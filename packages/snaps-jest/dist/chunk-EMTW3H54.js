"use strict";Object.defineProperty(exports, "__esModule", {value: true});

var _chunkLACTK6EOjs = require('./chunk-LACTK6EO.js');

// src/internals/simulation/middleware/mock.ts
function createMockMiddleware(store) {
  return function mockMiddleware(request, response, next, end) {
    const result = _chunkLACTK6EOjs.getJsonRpcMock.call(void 0, store.getState(), request.method);
    if (result) {
      response.result = result;
      return end();
    }
    return next();
  };
}



exports.createMockMiddleware = createMockMiddleware;
//# sourceMappingURL=chunk-EMTW3H54.js.map