import { HandlerType, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';
import { getDocument, queries } from 'pptr-testing-library';
import { create } from 'superstruct';

import {
  getEnvironment,
  getNotifications,
  waitFor,
  waitForResponse,
} from './internals';
import type { Snap, SnapResponse } from './types';
import { TransactionOptionsStruct } from './types';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { getByTestId } = queries;

/**
 * Load a snap into the environment. This is the main entry point for testing
 * snaps: It returns a {@link Snap} object that can be used to interact with the
 * snap.
 *
 * @example
 * ```ts
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
 * ```
 * @param snapId - The ID of the snap, including the prefix (`local:`).
 * @returns The snap.
 */
export async function installSnap(snapId: string): Promise<Snap> {
  const environment = getEnvironment();

  const page = await environment.createPage();
  const document = await getDocument(page);

  await page.evaluate((payload) => {
    window.__SIMULATOR_API__.dispatch({
      type: 'configuration/setSnapId',
      payload,
    });
  }, snapId);

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  await waitFor(async () => await getByTestId(document, 'status-ok'), {
    timeout: 10000,
    message: `Timed out waiting for snap to install. Make sure the snap ID ("${snapId}") is correct, and the server is running.`,
  });

  return {
    request: async ({
      origin = 'metamask.io',
      ...options
    }): Promise<SnapResponse> => {
      const args: SnapRpcHookArgs = {
        origin,
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          id: 1,
          ...options,
        },
      };

      const id = await page.evaluate((payload) => {
        window.__SIMULATOR_API__.dispatch({
          type: 'simulation/sendRequest',
          payload,
        });

        return window.__SIMULATOR_API__.getRequestId();
      }, args);

      const response = await waitForResponse(page, HandlerType.OnRpcRequest);
      const notifications = await getNotifications(page, id);

      return { id, response, notifications };
    },

    sendTransaction: async (_options = {}): Promise<SnapResponse> => {
      // This adds the default values to the options.
      const {
        origin: transactionOrigin,
        chainId,
        ...transaction
      } = create(_options, TransactionOptionsStruct);

      const args: SnapRpcHookArgs = {
        origin: '',
        handler: HandlerType.OnTransaction,
        request: {
          jsonrpc: '2.0',
          method: '',
          params: {
            chainId,
            transaction,
            transactionOrigin,
          },
        },
      };

      const id = await page.evaluate((payload) => {
        window.__SIMULATOR_API__.dispatch({
          type: 'simulation/sendRequest',
          payload,
        });

        return window.__SIMULATOR_API__.getRequestId();
      }, args);

      const response = await waitForResponse(page, HandlerType.OnTransaction);
      if (hasProperty(response, 'error')) {
        return { id, response, notifications: [] };
      }

      assert(isPlainObject(response.result));
      assert(hasProperty(response.result, 'content'));

      return { id, response, notifications: [], ui: response.result.content };
    },
  };
}
