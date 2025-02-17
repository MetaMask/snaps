import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

import type {
  BaseParams,
  LegacyParams,
  LegacySetStateParams,
  SetStateParams,
} from './types';
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
 * Each of the methods also takes an `encrypted` parameter.
 * This parameter can be used to choose between using encrypted or unencrypted storage.
 * Encrypted storage requires MetaMask to be unlocked, unencrypted storage does not.
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
      return await snap.request({
        method: 'snap_setState',
        params: {
          key: params?.key,
          value: params?.value,
          encrypted: params?.encrypted,
        },
      });
    }

    case 'getState': {
      const params = request.params as BaseParams;
      return await snap.request({
        method: 'snap_getState',
        params: {
          key: params?.key,
          encrypted: params?.encrypted,
        },
      });
    }

    case 'clearState': {
      const params = request.params as BaseParams;
      return await snap.request({
        method: 'snap_clearState',
        params: {
          encrypted: params?.encrypted,
        },
      });
    }

    case 'legacy_setState': {
      const params = request.params as LegacySetStateParams;
      if (params.items) {
        await setState({ items: params.items }, params.encrypted);
      }

      return true;
    }

    case 'legacy_getState': {
      const params = request.params as LegacyParams;
      return await getState(params?.encrypted);
    }

    case 'legacy_clearState': {
      const params = request.params as LegacyParams;
      await clearState(params?.encrypted);

      return true;
    }

    default:
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw new MethodNotFoundError({ method: request.method });
  }
};
