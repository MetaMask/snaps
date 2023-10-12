import { createModuleLogger } from '@metamask/utils';
import { getDocument, queries } from 'pptr-testing-library';

import {
  getEnvironment,
  mock,
  waitFor,
  request,
  sendTransaction,
  runCronjob,
  mockJsonRpc,
  rootLogger,
} from './internals';
import type { Snap, SnapResponse } from './types';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { getByTestId } = queries;

const log = createModuleLogger(rootLogger, 'helpers');

/**
 * Load a Snap into the environment. This is the main entry point for testing
 * Snaps: It returns a {@link Snap} object that can be used to interact with the
 * Snap.
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
 * @param snapId - The ID of the Snap, including the prefix (`local:`). Defaults
 * to the URL of the built-in server, if it is running. This supports both
 * local snap IDs and NPM Snap IDs.
 * @returns The Snap.
 * @throws If the built-in server is not running, and no Snap ID is provided.
 */
export async function installSnap(
  snapId: string = getEnvironment().snapId,
): Promise<Snap> {
  const environment = getEnvironment();

  log('Installing Snap %s.', snapId);

  const page = await environment.createPage();
  const document = await getDocument(page);

  log('Setting Snap ID to %s.', snapId);
  await page.evaluate((payload) => {
    window.__SIMULATOR_API__.dispatch({
      type: 'configuration/setSnapId',
      payload,
    });
  }, snapId);

  log('Waiting for Snap to install.');
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  await waitFor(async () => await getByTestId(document, 'status-ok'), {
    timeout: 10000,
    message: `Timed out waiting for Snap to install. Make sure the Snap ID ("${snapId}") is correct, and the server is running.`,
  });

  return {
    request: (options) => {
      log('Sending request %o.', options);

      // Note: This function is intentionally not async, so that we can access
      // the `getInterface` method on the response.
      return request(page, options);
    },

    sendTransaction: async (options = {}): Promise<SnapResponse> => {
      log('Sending transaction %o.', options);

      return await sendTransaction(page, options);
    },

    runCronjob: (options) => {
      log('Running cronjob %o.', options);

      // Note: This function is intentionally not async, so that we can access
      // the `getInterface` method on the response.
      return runCronjob(page, options);
    },

    close: async () => {
      log('Closing page.');

      await page.close();
    },

    mock: async (options) => {
      log('Mocking %o.', options);

      return await mock(page, options);
    },

    mockJsonRpc: async (options) => {
      log('Mocking JSON-RPC %o.', options);

      return await mockJsonRpc(page, options);
    },
  };
}
