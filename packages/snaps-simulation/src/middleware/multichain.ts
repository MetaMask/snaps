import { createAsyncMiddleware, JsonRpcMiddleware } from "@metamask/json-rpc-engine";
import { Json, JsonRpcParams } from "@metamask/utils";
import { rpcErrors } from '@metamask/rpc-errors';

export function createMultichainMiddleware(isMultichain: boolean): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(async (request, response, next) => {
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