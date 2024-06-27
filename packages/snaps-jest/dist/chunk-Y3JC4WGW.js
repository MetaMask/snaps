"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkWDYPMEZBjs = require('./chunk-WDYPMEZB.js');


var _chunk3FNLFVV2js = require('./chunk-3FNLFVV2.js');

// src/internals/simulation/middleware/internal-methods/middleware.ts
var _snapsutils = require('@metamask/snaps-utils');
var methodHandlers = {
  /* eslint-disable @typescript-eslint/naming-convention */
  metamask_getProviderState: _chunk3FNLFVV2js.getProviderStateHandler,
  eth_requestAccounts: _chunkWDYPMEZBjs.getAccountsHandler,
  eth_accounts: _chunkWDYPMEZBjs.getAccountsHandler
  /* eslint-enable @typescript-eslint/naming-convention */
};
function createInternalMethodsMiddleware(hooks) {
  return async function methodMiddleware(request, response, next, end) {
    const handler = methodHandlers[request.method];
    if (handler) {
      try {
        return await handler(request, response, next, end, hooks);
      } catch (error) {
        _snapsutils.logError.call(void 0, error);
        return end(error);
      }
    }
    return next();
  };
}



exports.createInternalMethodsMiddleware = createInternalMethodsMiddleware;
//# sourceMappingURL=chunk-Y3JC4WGW.js.map