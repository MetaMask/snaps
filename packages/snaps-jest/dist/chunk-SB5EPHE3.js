"use strict";Object.defineProperty(exports, "__esModule", {value: true});



var _chunkLBC2OGSNjs = require('./chunk-LBC2OGSN.js');

// src/internals/simulation/methods/hooks/state.ts
var _snapsutils = require('@metamask/snaps-utils');
var _effects = require('redux-saga/effects');
function* getSnapStateImplementation(_snapId, encrypted = true) {
  const state = yield _effects.select.call(void 0, _chunkLBC2OGSNjs.getState.call(void 0, encrypted));
  return _snapsutils.parseJson.call(void 0, state);
}
function getGetSnapStateMethodImplementation(runSaga) {
  return (...args) => {
    return runSaga(getSnapStateImplementation, ...args).result();
  };
}
function* updateSnapStateImplementation(_snapId, newState, encrypted = true) {
  yield _effects.put.call(void 0, _chunkLBC2OGSNjs.setState.call(void 0, { state: JSON.stringify(newState), encrypted }));
}
function getUpdateSnapStateMethodImplementation(runSaga) {
  return (...args) => {
    runSaga(updateSnapStateImplementation, ...args).result();
  };
}
function* clearSnapStateImplementation(_snapId, encrypted = true) {
  yield _effects.put.call(void 0, _chunkLBC2OGSNjs.clearState.call(void 0, { encrypted }));
}
function getClearSnapStateMethodImplementation(runSaga) {
  return async (...args) => {
    runSaga(clearSnapStateImplementation, ...args).result();
  };
}





exports.getGetSnapStateMethodImplementation = getGetSnapStateMethodImplementation; exports.getUpdateSnapStateMethodImplementation = getUpdateSnapStateMethodImplementation; exports.getClearSnapStateMethodImplementation = getClearSnapStateMethodImplementation;
//# sourceMappingURL=chunk-SB5EPHE3.js.map