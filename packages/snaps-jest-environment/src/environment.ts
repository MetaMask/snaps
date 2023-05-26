import { EnvironmentContext, JestEnvironmentConfig } from '@jest/environment';
import { createModuleLogger } from '@metamask/utils';
import { setupBrowser, WebdriverIOQueries } from '@testing-library/webdriverio';
import { Server } from 'http';
import NodeEnvironment from 'jest-environment-node';
import { AddressInfo } from 'net';
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

    this.#server = await startServer();
    const { port } = this.#server.address() as AddressInfo;

    const executionEnvironmentUrl =
      this.#options.executionEnvironmentUrl ??
      `http://localhost:${port}/environment/`;

    const simulatorUrl =
      this.#options.simulatorUrl ?? `http://localhost:${port}/simulator/`;

    const args = [];
    if (this.#options.browserOptions.headless) {
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

    await this.browser.url(
      `${simulatorUrl}?environment=${encodeURIComponent(
        executionEnvironmentUrl,
      )}`,
    );

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
}

export default SnapsEnvironment;
