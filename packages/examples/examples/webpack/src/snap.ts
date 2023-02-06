import { OnRpcRequestHandler } from '@metamask/snaps-types';

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns `null` if the request succeeded.
 * @throws If the request method is not valid for this snap.
 * @throws If the `snap_notify` call failed.
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
          type: 'inApp',
          message: `Hello, ${origin}!`,
        },
      });
    case 'native':
      return await snap.request({
        method: 'snap_notify',
        params: {
          type: 'native',
          message: `Hello, ${origin}!`,
        },
      });
    default:
      throw new Error('Method not found.');
  }
};
