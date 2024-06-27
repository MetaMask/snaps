"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkUF3UJTY3js = require('./chunk-UF3UJTY3.js');


var _chunk33MTKZ4Hjs = require('./chunk-33MTKZ4H.js');

// src/permitted/middleware.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
function createSnapsMethodMiddleware(isSnap, hooks) {
  return async function methodMiddleware(request, response, next, end) {
    const handler = _chunkUF3UJTY3js.methodHandlers[request.method];
    if (handler) {
      if (String.prototype.startsWith.call(request.method, "snap_") && !isSnap) {
        return end(_rpcerrors.rpcErrors.methodNotFound());
      }
      const { implementation, hookNames } = handler;
      try {
        return await implementation(
          request,
          response,
          next,
          end,
          _chunk33MTKZ4Hjs.selectHooks.call(void 0, hooks, hookNames)
        );
      } catch (error) {
        _snapsutils.logError.call(void 0, error);
        return end(error);
      }
    }
    return next();
  };
}



exports.createSnapsMethodMiddleware = createSnapsMethodMiddleware;
//# sourceMappingURL=chunk-ATBKAX2S.js.map