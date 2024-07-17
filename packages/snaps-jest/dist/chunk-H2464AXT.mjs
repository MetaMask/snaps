// src/internals/simulation/store/mocks.ts
import { createSelector, createSlice } from "@reduxjs/toolkit";
var INITIAL_STATE = {
  jsonRpc: {}
};
var mocksSlice = createSlice({
  name: "mocks",
  initialState: INITIAL_STATE,
  reducers: {
    addJsonRpcMock: (state, action) => {
      state.jsonRpc[action.payload.method] = action.payload.result;
    },
    removeJsonRpcMock: (state, action) => {
      delete state.jsonRpc[action.payload];
    }
  }
});
var { addJsonRpcMock, removeJsonRpcMock } = mocksSlice.actions;
var getJsonRpcMocks = (state) => state.mocks.jsonRpc;
var getJsonRpcMock = createSelector(
  getJsonRpcMocks,
  (_, method) => method,
  (jsonRpcMocks, method) => jsonRpcMocks[method]
);

export {
  mocksSlice,
  addJsonRpcMock,
  removeJsonRpcMock,
  getJsonRpcMocks,
  getJsonRpcMock
};
//# sourceMappingURL=chunk-H2464AXT.mjs.map