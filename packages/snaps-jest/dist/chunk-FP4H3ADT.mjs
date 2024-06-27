import {
  getJsonRpcMock
} from "./chunk-H2464AXT.mjs";

// src/internals/simulation/middleware/mock.ts
function createMockMiddleware(store) {
  return function mockMiddleware(request, response, next, end) {
    const result = getJsonRpcMock(store.getState(), request.method);
    if (result) {
      response.result = result;
      return end();
    }
    return next();
  };
}

export {
  createMockMiddleware
};
//# sourceMappingURL=chunk-FP4H3ADT.mjs.map