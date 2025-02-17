import {
  MethodNotFoundError,
  type OnRpcRequestHandler,
} from '@metamask/snaps-sdk';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles two methods:
 *
 * - `invokeSnap`: Call the `getPublicKey` method of the
 * `@metamask/bip32-example-snap`, and return the response. This demonstrates
 * that a snap can invoke another snap through the `wallet_invokeSnap` method.
 * Note that the `@metamask/bip32-example-snap` must be installed in the
 * extension, and it must have the `endowment:rpc` permission, with the "snaps"
 * option enabled.
 *
 * - `invokeOtherSnap`: Call the `getPublicKey` method of the
 * `@metamask/bip44-example-snap`, and return the response. This demonstrates
 * that snaps can specify a list of `allowedOrigins` in their manifest, which
 * restricts which snaps can invoke them through the `wallet_invokeSnap` method.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
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

    case 'invokeOtherSnap': {
      return snap.request({
        method: 'wallet_invokeSnap',
        params: {
          snapId: 'npm:@metamask/bip44-example-snap',
          request: {
            method: 'getPublicKey',
            params: {
              coinType: 1,
              addressIndex: 0,
            },
          },
        },
      });
    }

    default:
      throw new MethodNotFoundError({ method: request.method });
  }
};
