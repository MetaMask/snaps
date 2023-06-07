import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { assert, createModuleLogger } from '@metamask/utils';
import { setupBrowser, WebdriverIOQueries } from '@testing-library/webdriverio';
import { Server } from 'http';
import NodeEnvironment from 'jest-environment-node';
import { AddressInfo } from 'net';
import { Browser } from 'puppeteer';
import { remote } from 'webdriverio';

import { rootLogger, startServer } from './internals';
import { getOptions, SnapsEnvironmentOptions } from './options';

/* eslint-disable */
declare global {
  const browser: WebdriverIO.Browser;
  const snapsEnvironment: SnapsEnvironment;

  namespace WebdriverIO {
    interface Browser extends WebdriverIOQueries {}
    interface Element extends WebdriverIOQueries {}
  }
}
/* eslint-enable */

export class SnapsEnvironment extends NodeEnvironment {
  // `browser` is always set in the environment setup function. To avoid needing
  // to check for `undefined` everywhere, we use a type assertion here.
  browser!: WebdriverIO.Browser;

  queries!: WebdriverIOQueries;

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

  async setup() {
    await super.setup();

    if (this.#options.server.enabled) {
      this.#server = await startServer(this.#options.server);
    }

    const args = [];
    if (this.#options.browser.headless) {
      args.push('--headless');
    }

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

    const puppeteer = await this.browser.getPuppeteer();
    const pages = await puppeteer.pages();
    const page = pages[0];

    const browserLogger = createModuleLogger(rootLogger, 'browser');

    page
      .on('console', (message) => {
        browserLogger(`[${message.type()}] ${message.text()}`);
      })
      .on('pageerror', ({ message }) => {
        browserLogger(`[page error] ${message}`);
      });

    this.queries = setupBrowser(this.browser);

    this.global.browser = this.browser;
    this.global.snapsEnvironment = this;
  }

  async teardown() {
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
   * Get the snap ID for the current environment. This assumes that the built-in
   * server is running.
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
   * @returns The new page.
   */
  async createPage(url: string = this.url) {
    const puppeteer = (await this.browser.getPuppeteer()) as unknown as Browser;
    const page = await puppeteer.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const log = createModuleLogger(rootLogger, 'browser');

    page
      .on('console', (message) => {
        log(`[${message.type()}] ${message.text()}`);
      })
      .on('pageerror', ({ message }) => {
        log(`[page error] ${message}`);
      });

    return page;
  }
}

export default SnapsEnvironment;
