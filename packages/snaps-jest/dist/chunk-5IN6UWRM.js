"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkIUTOITRFjs = require('./chunk-IUTOITRF.js');

// src/internals/simulation/methods/hooks/request-user-approval.ts
var _effects = require('redux-saga/effects');
function* requestUserApprovalImplementation({
  type,
  requestData: { id }
}) {
  yield _effects.put.call(void 0, _chunkIUTOITRFjs.setInterface.call(void 0, { type, id }));
  const { payload } = yield _effects.take.call(void 0, _chunkIUTOITRFjs.resolveInterface.type);
  yield _effects.put.call(void 0, _chunkIUTOITRFjs.closeInterface.call(void 0, ));
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
//# sourceMappingURL=chunk-5IN6UWRM.js.map