"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/store/mocks.ts
var _toolkit = require('@reduxjs/toolkit');
var INITIAL_STATE = {
  jsonRpc: {}
};
var mocksSlice = _toolkit.createSlice.call(void 0, {
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
var getJsonRpcMock = _toolkit.createSelector.call(void 0, 
  getJsonRpcMocks,
  (_, method) => method,
  (jsonRpcMocks, method) => jsonRpcMocks[method]
);







exports.mocksSlice = mocksSlice; exports.addJsonRpcMock = addJsonRpcMock; exports.removeJsonRpcMock = removeJsonRpcMock; exports.getJsonRpcMocks = getJsonRpcMocks; exports.getJsonRpcMock = getJsonRpcMock;
//# sourceMappingURL=chunk-LACTK6EO.js.map