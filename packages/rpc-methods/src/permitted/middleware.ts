import { logError } from '@metamask/snaps-utils';
import { ethErrors } from 'eth-rpc-errors';
import { JsonRpcMiddleware, JsonRpcRequest } from 'json-rpc-engine';

import { handlers } from '.';
import { selectHooks } from '../utils';

const snapHandlerMap = handlers.reduce((map, handler) => {
  for (const methodName of handler.methodNames) {
    map.set(methodName, handler);
  }
  return map;
}, new Map());

/**
 * Creates a middleware that handles permitted snap RPC methods.
 *
 * @param isSnap - A flag that should indicate whether the requesting origin is a snap or not.
 * @param hooks - An object containing the hooks made available to the permitted RPC methods.
 * @returns The middleware.
 */
export function createSnapMethodMiddleware(
  isSnap: boolean,
  hooks: Record<string, unknown>,
): JsonRpcMiddleware<JsonRpcRequest<unknown>, any> {
  // This is not actually a misused promise, the type is just wrong
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async function methodMiddleware(req, res, next, end) {
    const handler = snapHandlerMap.get(req.method);
    if (handler) {
      if (/^snap_/iu.test(req.method) && !isSnap) {
        return end(ethErrors.rpc.methodNotFound());
      }

      const { implementation, hookNames } = handler;
      try {
        // Implementations may or may not be async, so we must await them.
        return await implementation(
          req,
          res,
          next,
          end,
          selectHooks(hooks, hookNames),
        );
      } catch (error) {
        logError(error);
        return end(error);
      }
    }

    return next();
  };
}
