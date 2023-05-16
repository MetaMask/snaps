import { HandlerType } from '@metamask/snaps-utils';
import { assert, JsonRpcRequest } from '@metamask/utils';
import express, { Express } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';
import { join } from 'path';
import { promisify } from 'util';
import { Browser, remote } from 'webdriverio';
import { EnvironmentPlugin, webpack } from 'webpack';
import merge from 'webpack-merge';

import configs from '../../webpack.config';
import { BenchmarkRunner, BenchmarkRunnerOptions } from './environment';

export type BrowserRunnerOptions = BenchmarkRunnerOptions & {
  bundleName: string;
  port?: number;
};

export abstract class BrowserRunner extends BenchmarkRunner {
  #bundleName: string;

  #port?: number;

  #server?: Server;

  protected browser?: Browser;

  protected constructor({ bundleName, ...options }: BrowserRunnerOptions) {
    super(options);
    this.#bundleName = bundleName;
  }

  /**
   * Initialize the browser runner. This will build the bundle, start the
   * server, and initialize the browser.
   *
   * @returns A promise that resolves once the browser runner is initialized.
   */
  async initialize() {
    await this.#startServer();
    await this.#build();
    await this.#initializeBrowser();
  }

  async executeSnap(snapId: string, sourceCode: string) {
    assert(this.browser, 'Browser not initialized.');

    const result = await this.browser.executeAsync<
      Error | string,
      [string, string]
    >(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (snapId, sourceCode, done) => {
        window.service.service
          .executeSnap({
            snapId,
            sourceCode,
            endowments: ['Math', 'crypto'],
          })
          .then(done)
          .catch((error) => done(error.message));
      },
      snapId,
      sourceCode,
    );

    assert(result === 'OK', `Snap execution failed: ${String(result)}`);
  }

  async handleRpcRequest(
    snapId: string,
    request: JsonRpcRequest,
  ): Promise<unknown> {
    assert(this.browser, 'Browser not initialized.');

    return await this.browser?.executeAsync(
      // eslint-disable-next-line @typescript-eslint/no-shadow
      (snapId, handler, request, done) => {
        window.service.service
          .handleRpcRequest(snapId, {
            origin: 'benchmark',
            handler,
            request,
          })
          .then(done)
          .catch((error) => done(error.message));
      },
      snapId,
      HandlerType.OnRpcRequest,
      request,
    );
  }

  async stop() {
    assert(this.browser, 'Browser not initialized.');
    assert(this.#server, 'Server not initialized.');

    await this.browser.deleteSession();
    await promisify(this.#server.close.bind(this.#server))();
  }

  async terminateAllSnaps() {
    assert(this.browser, 'Browser not initialized.');

    await this.browser.executeAsync((done) => {
      window.service.service.terminateAllSnaps().then(done).catch(done);
    });
  }

  /**
   * Get the bundle path. This is the path to the built bundle. This only exists
   * after {@link initialize} has been called.
   *
   * @returns The bundle path.
   */
  get bundlePath() {
    return join(__dirname, '../../dist/services', this.#bundleName);
  }

  /**
   * Get the execution environment path. This is the path to the built
   * execution environment in the `snaps-execution-environments` package.
   *
   * @returns The execution environment path.
   */
  get executionEnvironmentPath() {
    return join(
      __dirname,
      '../../../snaps-execution-environments/dist/browserify',
      this.#bundleName,
    );
  }

  async #build() {
    const baseConfig = configs.find(
      (bundleConfig) => bundleConfig.name === this.#bundleName,
    );

    assert(baseConfig, `Bundle not found: ${this.#bundleName}.`);
    assert(this.#port, 'Server port not initialized.');

    const config = merge(baseConfig, {
      plugins: [
        new EnvironmentPlugin({
          BENCHMARK_URL: `http://localhost:${this.#port}`,
        }),
      ],
    });

    const compiler = webpack(config);
    return await new Promise<void>((resolve, reject) => {
      compiler.run((error, stats) => {
        if (error) {
          return reject(error);
        }

        if (stats?.hasErrors()) {
          return reject(stats.toString());
        }

        return resolve();
      });
    });
  }

  protected setupRoutes(_app: Express) {
    // No-op
  }

  async #startServer() {
    const app = express();
    app.use('/service', express.static(this.bundlePath));
    app.use('/environment', express.static(this.executionEnvironmentPath));

    this.setupRoutes(app);

    this.#server = await new Promise<Server>((resolve, reject) => {
      // We listen on port `0` to get a random port.
      const server = app.listen(0, () => {
        resolve(server);
      });

      server.on('error', reject);
    });

    this.#port = (this.#server.address() as AddressInfo)?.port;
  }

  async #initializeBrowser() {
    assert(this.#port, 'Server port not initialized.');

    this.browser = await remote({
      automationProtocol: 'devtools',
      logLevel: 'error',
      capabilities: {
        browserName: 'chrome',
        /* eslint-disable @typescript-eslint/naming-convention */
        'goog:chromeOptions': {
          args: [],
        },
        'wdio:devtoolsOptions': {
          headless: false,
        },
        /* eslint-enable @typescript-eslint/naming-convention */
      },
    });

    await this.browser.navigateTo(`http://localhost:${this.#port}/service`);
  }
}
