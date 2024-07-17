import {
  methodHandlers
} from "./chunk-7P6TF6CE.mjs";
import {
  selectHooks
} from "./chunk-W33UWNA2.mjs";

// src/permitted/middleware.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { logError } from "@metamask/snaps-utils";
function createSnapsMethodMiddleware(isSnap, hooks) {
  return async function methodMiddleware(request, response, next, end) {
    const handler = methodHandlers[request.method];
    if (handler) {
      if (String.prototype.startsWith.call(request.method, "snap_") && !isSnap) {
        return end(rpcErrors.methodNotFound());
      }
      const { implementation, hookNames } = handler;
      try {
        return await implementation(
          request,
          response,
          next,
          end,
          selectHooks(hooks, hookNames)
        );
      } catch (error) {
        logError(error);
        return end(error);
      }
    }
    return next();
  };
}

export {
  createSnapsMethodMiddleware
};
//# sourceMappingURL=chunk-ZXDCQWMJ.mjs.map