import type {
  AsyncJsonRpcEngineNextCallback,
  JsonRpcMiddleware,
} from '@metamask/json-rpc-engine';
import { createAsyncMiddleware } from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  Json,
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

import { createSessionHandler } from './create-session';
import { getSessionHandler } from './get-session';
import { invokeMethodHandler } from './invoke-method';
import { revokeSessionHandler } from './revoke-session';
import type { MultichainMiddlewareHooks } from '../../simulation';

const multichainHandlers = {
  /* eslint-disable @typescript-eslint/naming-convention */
  wallet_createSession: createSessionHandler,
  wallet_invokeMethod: invokeMethodHandler,
  wallet_getSession: getSessionHandler,
  wallet_revokeSession: revokeSessionHandler,
  /* eslint-enable @typescript-eslint/naming-convention */
};

/**
 * Create a middleware that handles requests to the multichain API.
 *
 * @param isMultichain - Whether the JSON-RPC pipeline has multichain enabled.
 * @param hooks - Hooks required to execute the middleware RPC methods.
 * @returns The middleware.
 */
export function createMultichainMiddleware(
  isMultichain: boolean,
  hooks: MultichainMiddlewareHooks,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(
    async (
      request: JsonRpcRequest,
      response: PendingJsonRpcResponse,
      next: AsyncJsonRpcEngineNextCallback,
    ) => {
      const handler =
        multichainHandlers[request.method as keyof typeof multichainHandlers];

      const isMultichainRequest = handler !== undefined;

      if (!isMultichain && isMultichainRequest) {
        throw rpcErrors.methodNotFound();
      }

      // If disabled, this middleware functions as a passthrough.
      if (!isMultichain && !isMultichainRequest) {
        await next();
        return;
      }

      if (isMultichain && !isMultichainRequest) {
        throw rpcErrors.methodNotFound();
      }

      const result = await handler(request, hooks);

      if (result) {
        response.result = result;
        return;
      }

      await next();
    },
  );
}
