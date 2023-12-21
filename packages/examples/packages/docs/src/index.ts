import type { OnRpcRequestHandler } from '@metamask/snaps-sdk';
import { getMethodHandler } from '@metamask/snaps-sdk';
import { string, object, optional } from 'superstruct';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method.
 *
 * @param params - The request parameters.
 * @param params.request - The JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @see https://docs.metamask.io/snaps/reference/exports/#onrpcrequest
 * @see https://docs.metamask.io/snaps/reference/rpc-api/#wallet_invokesnap
 */
export const onRpcRequest: OnRpcRequestHandler = getMethodHandler({
  signMessage: {
    schema: object({
      bar: optional(string()),
    }),

    /**
     * The handler for the `foo` method.
     *
     * @param params - The request parameters.
     * @param params.bar - The `bar` parameter.
     * @returns The response to the JSON-RPC request.
     */
    handler: async (params) => {
      return params;
    },
  },

  bar: {
    schema: (params: unknown): params is { bar: number } => true,

    /**
     * The handler for the `bar` method.
     *
     * @param params - The request parameters.
     * @param params.bar - The `bar` parameter.
     * @returns The response to the JSON-RPC request.
     */
    handler: async (params) => {
      return params;
    },
  },
});
