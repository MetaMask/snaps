import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

import type { SetStateParams } from './types';
import { clearState, getState, setState } from './utils';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles three methods:
 *
 * - `setState`: Set the state of the snap. This stores the state in the
 * extension's local storage, so it will persist across requests.
 * - `getState`: Get the state of the snap. This retrieves the state from the
 * extension's local storage, or returns the default state if no state has been
 * set.
 * - `clearState`: Clear the state of the snap. This removes the state from the
 * extension's local storage, so the next `getState` request will return the
 * default state.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_managestate
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'setState': {
      const params = request.params as SetStateParams;
      const state = await getState();

      await setState({ ...state, ...params });
      return true;
    }

    case 'getState':
      return await getState();

    case 'clearState':
      await clearState();
      return true;

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
