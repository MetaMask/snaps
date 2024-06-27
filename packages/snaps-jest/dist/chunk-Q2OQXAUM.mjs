import {
  getAccountsHandler
} from "./chunk-VOYBI6T4.mjs";
import {
  getProviderStateHandler
} from "./chunk-IXKO6X55.mjs";

// src/internals/simulation/middleware/internal-methods/middleware.ts
import { logError } from "@metamask/snaps-utils";
var methodHandlers = {
  /* eslint-disable @typescript-eslint/naming-convention */
  metamask_getProviderState: getProviderStateHandler,
  eth_requestAccounts: getAccountsHandler,
  eth_accounts: getAccountsHandler
  /* eslint-enable @typescript-eslint/naming-convention */
};
function createInternalMethodsMiddleware(hooks) {
  return async function methodMiddleware(request, response, next, end) {
    const handler = methodHandlers[request.method];
    if (handler) {
      try {
        return await handler(request, response, next, end, hooks);
      } catch (error) {
        logError(error);
        return end(error);
      }
    }
    return next();
  };
}

export {
  createInternalMethodsMiddleware
};
//# sourceMappingURL=chunk-Q2OQXAUM.mjs.map