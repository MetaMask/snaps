import { MethodNotFoundError, NotificationType } from '@metamask/snaps-sdk';
import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `inApp`: Show an in-app notification to the user.
 * - `native`: Show a desktop notification to the user.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_notify
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'inApp':
      return await snap.request({
        method: 'snap_notify',
        params: {
          // We're using the `NotificationType` enum here, but you can also use
          // the string values directly, e.g. `type: 'inApp'`.
          type: NotificationType.InApp,
          message: `Hello from within MetaMask!`,
        },
      });

    case 'native':
      return await snap.request({
        method: 'snap_notify',
        params: {
          // We're using the `NotificationType` enum here, but you can also use
          // the string values directly, e.g. `type: 'native'`.
          type: NotificationType.Native,
          message: `Hello from the browser!`,
        },
      });

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
