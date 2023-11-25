import type { AbstractExecutionService } from '@metamask/snaps-controllers';
import { HandlerType, logInfo } from '@metamask/snaps-utils';
import { createModuleLogger } from '@metamask/utils';
import { create } from 'superstruct';

import {
  rootLogger,
  handleRequest,
  TransactionOptionsStruct,
  getEnvironment,
} from './internals';
import type { InstallSnapOptions } from './internals';
import type { Snap, SnapResponse } from './types';

const log = createModuleLogger(rootLogger, 'helpers');

/**
 * Get the options for {@link installSnap}.
 *
 * @param snapId - The ID of the Snap, or the options.
 * @param options - The options, if any.
 * @returns The options.
 */
function getOptions<
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService
  >,
>(
  snapId?: string | Partial<InstallSnapOptions<Service>>,
  options: Partial<InstallSnapOptions<Service>> = {},
): [string | undefined, Partial<InstallSnapOptions<Service>>] {
  if (typeof snapId === 'object') {
    return [undefined, snapId];
  }

  return [snapId, options];
}

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap(): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService
  >,
>(options: Partial<InstallSnapOptions<Service>>): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService
  >,
>(
  snapId: string,
  options?: Partial<InstallSnapOptions<Service>>,
): Promise<Snap>;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * import { installSnap } from '@metamask/snaps-jest';
 *
 * describe('My Snap', () => {
 *   it('should do something', async () => {
 *     const { request } = await installSnap('local:my-snap');
 *     const response = await request({
 *       method: 'foo',
 *       params: ['bar'],
 *     });
 *     expect(response).toRespondWith('bar');
 *   });
 * });
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @param options - The options to use.
 * @param options.executionService - The execution service to use. Defaults to
 * {@link NodeThreadExecutionService}. You do not need to provide this unless
 * you are testing a custom execution service.
 * @param options.executionServiceOptions - The options to use when creating the
 * execution service, if any. This should only include options specific to the
 * provided execution service.
 * @param options.options - The simulation options.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap<
  Service extends new (...args: any[]) => InstanceType<
    typeof AbstractExecutionService
  >,
>(
  snapId?: string | Partial<InstallSnapOptions<Service>>,
  options: Partial<InstallSnapOptions<Service>> = {},
): Promise<Snap> {
  const resolvedOptions = getOptions(snapId, options);
  const {
    snapId: installedSnapId,
    store,
    executionService,
    runSaga,
  } = await getEnvironment().installSnap(...resolvedOptions);

  return {
    request: (request) => {
      log('Sending request %o.', request);

      return handleRequest({
        snapId: installedSnapId,
        store,
        executionService,
        runSaga,
        handler: HandlerType.OnRpcRequest,
        request,
      });
    },

    sendTransaction: async (request): Promise<SnapResponse> => {
      log('Sending transaction %o.', request);

      const {
        origin: transactionOrigin,
        chainId,
        ...transaction
      } = create(request, TransactionOptionsStruct);

      return handleRequest({
        snapId: installedSnapId,
        store,
        executionService,
        runSaga,
        handler: HandlerType.OnTransaction,
        request: {
          method: '',
          params: {
            chainId,
            transaction,
            transactionOrigin,
          },
        },
      });
    },

    runCronjob: (request) => {
      log('Running cronjob %o.', options);

      return handleRequest({
        snapId: installedSnapId,
        store,
        executionService,
        runSaga,
        handler: HandlerType.OnCronjob,
        request,
      });
    },

    close: async () => {
      log('Closing execution service.');
      logInfo(
        'Calling `snap.close()` is deprecated, and will be removed in a future release. Snaps are now automatically closed when the test ends.',
      );

      await executionService.terminateAllSnaps();
    },
  };
}
