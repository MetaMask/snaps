import { rpcErrors } from '@metamask/rpc-errors';
import type { OnRpcRequestHandler } from '@metamask/snaps-types';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method. This handler handles a single method:
 *
 * - `hello`: Returns a static message, "Hello from the MetaMask Snaps CLI using
 * Browserify!". This is just for demonstration purposes, showing that a snap
 * can be built with the MetaMask Snaps CLI using Browserify.
 *
 * Note that Browserify is not recommended, and only exists for backwards
 * compatibility with existing snaps. New snaps should be built with Webpack.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 */
export const onRpcRequest: OnRpcRequestHandler = async ({ request }) => {
  switch (request.method) {
    case 'hello':
      return 'Hello from the MetaMask Snaps CLI using Browserify!';

    default: {
      throw rpcErrors.methodNotFound({
        data: { method: request.method },
      });
    }
  }
};
