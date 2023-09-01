import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';
import { NotificationType } from '@metamask/snaps-types';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `inApp`: Show an in-app notification to the user.
 * - `native`: Show a desktop notification to the user.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @param params.origin - The origin of the dapp that sent the request.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_notify
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
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
          message: `Hello, ${origin}, from the browser!`,
        },
      });

    default:
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
  }
};
