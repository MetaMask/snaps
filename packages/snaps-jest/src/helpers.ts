import { getDocument, queries } from 'pptr-testing-library';

import {
  getEnvironment,
  mock,
  waitFor,
  request,
  sendTransaction,
  runCronjob,
  mockJsonRpc,
} from './internals';
import type { Snap, SnapResponse } from './types';

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
 * @param snapId - The ID of the snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM snap IDs.
 * @returns The snap.
 * @throws If the built-in server is not running, and no snap ID is provided.
 */
export async function installSnap(
  snapId: string = getEnvironment().snapId,
): Promise<Snap> {
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
    request: (options) => {
      // Note: This function is intentionally not async, so that we can access
      // the `getInterface` method on the response.
      return request(page, options);
    },

    sendTransaction: async (options = {}): Promise<SnapResponse> => {
      return await sendTransaction(page, options);
    },

    runCronjob: (options) => {
      // Note: This function is intentionally not async, so that we can access
      // the `getInterface` method on the response.
      return runCronjob(page, options);
    },

    close: async () => {
      await page.close();
    },

    mock: async (options) => {
      return await mock(page, options);
    },

    mockJsonRpc: async (options) => {
      return await mockJsonRpc(page, options);
    },
  };
}
