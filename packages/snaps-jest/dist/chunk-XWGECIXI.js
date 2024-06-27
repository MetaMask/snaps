"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkY3JC4WGWjs = require('./chunk-Y3JC4WGW.js');


var _chunkEMTW3H54js = require('./chunk-EMTW3H54.js');


var _chunkXKJHFUHEjs = require('./chunk-XKJHFUHE.js');

// src/internals/simulation/middleware/engine.ts
var _ethjsonrpcmiddleware = require('@metamask/eth-json-rpc-middleware');
var _jsonrpcengine = require('@metamask/json-rpc-engine');
var _snapsrpcmethods = require('@metamask/snaps-rpc-methods');
function createJsonRpcEngine({
  store,
  hooks,
  permissionMiddleware,
  endpoint = _chunkXKJHFUHEjs.DEFAULT_JSON_RPC_ENDPOINT
}) {
  const engine = new (0, _jsonrpcengine.JsonRpcEngine)();
  engine.push(_chunkEMTW3H54js.createMockMiddleware.call(void 0, store));
  engine.push(_chunkY3JC4WGWjs.createInternalMethodsMiddleware.call(void 0, hooks));
  engine.push(_snapsrpcmethods.createSnapsMethodMiddleware.call(void 0, true, hooks));
  engine.push(permissionMiddleware);
  engine.push(
    _ethjsonrpcmiddleware.createFetchMiddleware.call(void 0, {
      btoa: globalThis.btoa,
      fetch: globalThis.fetch,
      rpcUrl: endpoint
    })
  );
  return engine;
}



exports.createJsonRpcEngine = createJsonRpcEngine;
//# sourceMappingURL=chunk-XWGECIXI.js.map