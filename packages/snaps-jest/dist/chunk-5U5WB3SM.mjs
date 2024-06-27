import {
  clearState,
  getState,
  setState
} from "./chunk-MPZOXW6I.mjs";

// src/internals/simulation/methods/hooks/state.ts
import { parseJson } from "@metamask/snaps-utils";
import { put, select } from "redux-saga/effects";
function* getSnapStateImplementation(_snapId, encrypted = true) {
  const state = yield select(getState(encrypted));
  return parseJson(state);
}
function getGetSnapStateMethodImplementation(runSaga) {
  return (...args) => {
    return runSaga(getSnapStateImplementation, ...args).result();
  };
}
function* updateSnapStateImplementation(_snapId, newState, encrypted = true) {
  yield put(setState({ state: JSON.stringify(newState), encrypted }));
}
function getUpdateSnapStateMethodImplementation(runSaga) {
  return (...args) => {
    runSaga(updateSnapStateImplementation, ...args).result();
  };
}
function* clearSnapStateImplementation(_snapId, encrypted = true) {
  yield put(clearState({ encrypted }));
}
function getClearSnapStateMethodImplementation(runSaga) {
  return async (...args) => {
    runSaga(clearSnapStateImplementation, ...args).result();
  };
}

export {
  getGetSnapStateMethodImplementation,
  getUpdateSnapStateMethodImplementation,
  getClearSnapStateMethodImplementation
};
//# sourceMappingURL=chunk-5U5WB3SM.mjs.map