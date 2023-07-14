import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `invokeSnap`: Call the `getPublicKey` method of the
 * `@metamask/bip32-example-snap`, and return the response. This demonstrates
 * that a snap can invoke another snap through the `wallet_invokeSnap` method.
 * Note that the `@metamask/bip32-example-snap` must be installed in the
 * extension, and it must have the `endowment:rpc` permission, with the "snaps"
 * option enabled.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#snap_getentropy
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'invokeSnap': {
      return snap.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: 'npm:@metamask/bip32-example-snap',
          request: {
            method: 'getPublicKey',
            params: {
              path: ['m', "44'", "0'"],
              curve: 'secp256k1',
              compressed: true,
            },
          },
        },
      });
    }

    default:
      throw rpcErrors.methodNotFound({
        data: {
          method: request.method,
        },
      });
  }
};
