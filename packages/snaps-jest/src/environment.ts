import type {
  EnvironmentContext,
  JestEnvironmentConfig,
} from '@jest/environment';
import { assert, createModuleLogger } from '@metamask/utils';
import type { Server } from 'http';
import NodeEnvironment from 'jest-environment-node';
import type { AddressInfo } from 'net';

import { rootLogger, startServer } from './internals';
import type { SnapsEnvironmentOptions } from './options';
import { getOptions } from './options';

/* eslint-disable */
declare global {
  const snapsEnvironment: SnapsEnvironment;
}
/* eslint-enable */

const log = createModuleLogger(rootLogger, 'environment');

export class SnapsEnvironment extends NodeEnvironment {
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

    this.global.snapsEnvironment = this;
  }

  /**
   * Tear down the environment. This closes the browser, and stops the built-in
   * HTTP server.
   */
  async teardown() {
    this.#server?.close();
    await super.teardown();
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
}

export default SnapsEnvironment;
