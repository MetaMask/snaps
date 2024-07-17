"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkD653LBAYjs = require('./chunk-D653LBAY.js');

// src/internals/simulation/methods/hooks/request-user-approval.ts
var _effects = require('redux-saga/effects');
function* requestUserApprovalImplementation({
  type,
  requestData: { id }
}) {
  yield _effects.put.call(void 0, _chunkD653LBAYjs.setInterface.call(void 0, { type, id }));
  const { payload } = yield _effects.take.call(void 0, _chunkD653LBAYjs.resolveInterface.type);
  yield _effects.put.call(void 0, _chunkD653LBAYjs.closeInterface.call(void 0, ));
  return payload;
}
function getRequestUserApprovalImplementation(runSaga) {
  return async (...args) => {
    return await runSaga(
      requestUserApprovalImplementation,
      ...args
    ).toPromise();
  };
}



exports.getRequestUserApprovalImplementation = getRequestUserApprovalImplementation;
//# sourceMappingURL=chunk-SNXRXX2O.js.map