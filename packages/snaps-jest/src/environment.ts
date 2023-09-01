import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { assert, createModuleLogger } from '@metamask/utils';
import type { Server } from 'http';
import NodeEnvironment from 'jest-environment-node';
import type { AddressInfo } from 'net';
import type { Browser } from 'puppeteer';
import { remote } from 'webdriverio';

import { rootLogger, startServer } from './internals';
import type { SnapsEnvironmentOptions } from './options';
import { getOptions } from './options';

/* eslint-disable */
declare global {
  const browser: WebdriverIO.Browser;
  const snapsEnvironment: SnapsEnvironment;
}
/* eslint-enable */

const log = createModuleLogger(rootLogger, 'environment');

export class SnapsEnvironment extends NodeEnvironment {
  // `browser` is always set in the environment setup function. To avoid needing
  // to check for `undefined` everywhere, we use a type assertion here.
  browser!: WebdriverIO.Browser;

  #options: SnapsEnvironmentOptions;

  #server: Server | undefined;

  /**
   * Constructor.
   *
   * @param options - The environment options.
   * @param context - The environment context.
   */
  constructor(options: JestEnvironmentConfig, context: EnvironmentContext) {
    super(options, context);
    this.#options = getOptions(options.projectConfig.testEnvironmentOptions);
  }

  /**
   * Set up the environment. This starts the built-in HTTP server, and creates a
   * new browser instance.
   */
  async setup() {
    await super.setup();

    if (this.#options.server.enabled) {
      log('Starting server.');
      this.#server = await startServer(this.#options.server);
    }

    const args = [];
    if (this.#options.browser.headless) {
      args.push('--headless', '--disable-gpu');
    }

    log('Starting browser.');
    this.browser = await remote({
      logLevel: 'error',
      capabilities: {
        browserName: 'chrome',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'goog:chromeOptions': {
          args,
        },
      },
    });

    this.global.browser = this.browser;
    this.global.snapsEnvironment = this;
  }

  /**
   * Tear down the environment. This closes the browser, and stops the built-in
   * HTTP server.
   */
  async teardown() {
    if (this.#options.keepAlive) {
      log('Not tearing down environment because keepAlive is enabled.');
      return;
    }

    log('Closing browser, and stopping server.');
    await this.browser?.deleteSession();
    this.#server?.close();

    await super.teardown();
  }

  /**
   * Get the URL to the simulator, including the environment URL.
   *
   * @returns The simulator URL.
   * @throws If the server is not running.
   */
  get url() {
    assert(this.#server, 'Server is not running.');

    const { port } = this.#server.address() as AddressInfo;
    const simulatorUrl =
      this.#options.simulatorUrl ?? `http://localhost:${port}/simulator/`;

    const executionEnvironmentUrl =
      this.#options.executionEnvironmentUrl ??
      `http://localhost:${port}/environment/`;

    return `${simulatorUrl}?environment=${encodeURIComponent(
      executionEnvironmentUrl,
    )}`;
  }

  /**
   * Get the snap ID for the current environment, which is used if no snap ID is
   * passed to {@link installSnap}. This assumes that the built-in server is
   * running.
   *
   * @returns The snap ID.
   * @throws If the server is not running.
   */
  get snapId() {
    assert(
      this.#server,
      'You must specify a snap ID, because the built-in server is not running.',
    );

    const { port } = this.#server.address() as AddressInfo;
    return `local:http://localhost:${port}`;
  }

  /**
   * Create a new page, and attach logging handlers.
   *
   * @param url - The page URL. Defaults to the specified Snaps Simulator URL,
   * or the default simulator URL if none is specified.
   * @param timeout - The page timeout, in milliseconds.
   * @returns The new page.
   */
  async createPage(url: string = this.url, timeout = 10000) {
    const puppeteer = (await this.browser.getPuppeteer()) as unknown as Browser;
    const page = await puppeteer.newPage();

    page.setDefaultTimeout(timeout);
    page.setDefaultNavigationTimeout(timeout);

    // Give the page permission to show notifications. This is required for
    // testing `snap_notify`.
    await page.browserContext().overridePermissions(url, ['notifications']);

    // `networkidle0` is used to ensure that the page is fully loaded. This
    // makes it wait for no requests to be made, which guarantees that the page
    // is ready.
    await page.goto(url, { waitUntil: 'networkidle0' });

    const browserLog = createModuleLogger(rootLogger, 'browser');

    page
      // This is fired when the page calls `console.log` or similar.
      .on('console', (message) => {
        browserLog(`[${message.type()}] ${message.text()}`);
      })

      // This is fired when the page throws an error.
      .on('pageerror', ({ message }) => {
        browserLog(`[page error] ${message}`);
      });

    return page;
  }
}

export default SnapsEnvironment;
