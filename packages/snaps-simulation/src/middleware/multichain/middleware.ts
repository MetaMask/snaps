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
import type { MultichainMiddlewareHooks } from '../../simulation';

const multichainHandlers = {
  /* eslint-disable @typescript-eslint/naming-convention */
  wallet_createSession: createSessionHandler,
  wallet_invokeMethod: invokeMethodHandler,
  wallet_getSession: getSessionHandler,
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

      const handler =
        multichainHandlers[request.method as keyof typeof multichainHandlers];

      if (!handler) {
        await next();
        return;
      }

      const result = await handler(request as any, hooks);

      if (result) {
        response.result = result;
        return;
      }

      await next();
    },
  );
}
