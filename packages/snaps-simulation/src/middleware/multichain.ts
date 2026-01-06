import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { createAsyncMiddleware } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Json, JsonRpcParams } from '@metamask/utils';

/**
 * Create a middleware that handles requests to the multichain API.
 *
 * @param isMultichain - Whether the JSON-RPC pipeline has multichain enabled.
 * @returns The middleware.
 */
export function createMultichainMiddleware(
  isMultichain: boolean,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(async (request, _response, next) => {
    const isMultichainRequest = [
      'wallet_createSession',
      'wallet_invokeMethod',
      'wallet_getSession',
      'wallet_revokeSession',
    ].includes(request.method);

    if (!isMultichain && isMultichainRequest) {
      throw rpcErrors.methodNotFound();
    }

    if (isMultichain && !isMultichainRequest) {
      throw rpcErrors.methodNotFound();
    }

    await next();
  });
}
