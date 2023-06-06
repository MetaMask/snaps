import type { HandlerType, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { getDocument, queries } from 'pptr-testing-library';

import {
  getEnvironment,
  getNotifications,
  waitFor,
  waitForResponse,
} from './internals';
import type { SnapResponse, Snap } from './types';

// eslint-disable-next-line @typescript-eslint/unbound-method
const { getByTestId } = queries;

/**
 * Load a snap into the environment.
 *
 * @param snapId - The ID of the snap, including the prefix.
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

      const response = await waitForResponse(page, 'onRpcRequest');
      const notifications = await getNotifications(page, id);

      return { id, response, notifications };
    },
  };
}
