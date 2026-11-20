import type { ExecutionService } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { installSnap } from '@metamask/snaps-simulation';
import type {
  InstalledSnap,
  InstallSnapOptions,
  SnapHelpers,
} from '@metamask/snaps-simulation';
import { assert, createModuleLogger } from '@metamask/utils';
import type { Server } from 'http';
import type { AddressInfo } from 'net';
import type { Environment } from 'vitest/environments';

import { rootLogger, startServer } from './internals';
import type { SnapsEnvironmentOptions } from './options';
import { getOptions } from './options';

declare global {
  var snapsEnvironment: SnapsEnvironment;
}

const log = createModuleLogger(rootLogger, 'environment');

/**
 * The Vitest environment for testing MetaMask Snaps. This starts the built-in
 * HTTP server, and provides the `installSnap` function to the test environment.
 */
export class SnapsEnvironment {
  readonly #options: SnapsEnvironmentOptions;

  #server: Server | undefined;

  #instance: (InstalledSnap & SnapHelpers) | undefined;

  /**
   * Constructor.
   *
   * @param options - The environment options.
   */
  constructor(options: Record<string, unknown> = {}) {
    this.#options = getOptions(options);
  }

  /**
   * Set up the environment. This starts the built-in HTTP server.
   *
   * @param global - The global object for the test environment.
   */
  async setup(global: Record<string, unknown>) {
    if (this.#options.server.enabled) {
      log('Starting server.');
      this.#server = await startServer(this.#options.server);
    }

    global.snapsEnvironment = this;
  }

  /**
   * Tear down the environment. This terminates any installed Snaps and stops
   * the built-in HTTP server.
   */
  async teardown() {
    await this.#instance?.executionService.terminateAllSnaps();
    this.#server?.close();
  }

  /**
   * Install a Snap in the environment. This will terminate any previously
   * installed Snaps, and run the Snap code in a new execution service.
   *
   * @param snapId - The ID of the Snap to install.
   * @param options - The options to use when installing the Snap.
   * @param options.executionService - The execution service to use.
   * @param options.executionServiceOptions - The options to use when creating the
   * execution service, if any. This should only include options specific to the
   * provided execution service.
   * @param options.options - The simulation options.
   * @template Service - The type of the execution service.
   * @returns The installed Snap.
   */
  async installSnap<
    Service extends new (
      ...args: any[]
    ) => InstanceType<typeof ExecutionService>,
  >(
    snapId: string = this.snapId,
    options: Partial<InstallSnapOptions<Service>> = {},
  ) {
    await this.#instance?.executionService.terminateAllSnaps();
    this.#instance = await installSnap(snapId as SnapId, options);
    return this.#instance;
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

/**
 * Create a new Vitest environment. A new environment is created for each test
 * file, so environments do not share state.
 *
 * @returns The Vitest environment.
 */
function createEnvironment(): Environment {
  return {
    name: 'snaps-vitest',
    transformMode: 'ssr',
    async setup(
      global: Record<string, unknown>,
      options: Record<string, unknown>,
    ) {
      const environment = new SnapsEnvironment(options);
      await environment.setup(global);

      return {
        teardown: async () => {
          await environment.teardown();
        },
      };
    },
  };
}

export default createEnvironment();
