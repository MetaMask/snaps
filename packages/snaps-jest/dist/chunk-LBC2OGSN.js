"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/store/state.ts
var _toolkit = require('@reduxjs/toolkit');
var INITIAL_STATE = {
  encrypted: null,
  unencrypted: null
};
var stateSlice = _toolkit.createSlice.call(void 0, {
  name: "state",
  initialState: INITIAL_STATE,
  reducers: {
    setState: (state, action) => {
      if (action.payload.encrypted) {
        state.encrypted = action.payload.state;
        return state;
      }
      state.unencrypted = action.payload.state;
      return state;
    },
    clearState: (state, action) => {
      if (action.payload.encrypted) {
        state.encrypted = null;
        return state;
      }
      state.unencrypted = null;
      return state;
    }
  }
});
var { setState, clearState } = stateSlice.actions;
function getState(encrypted) {
  return _toolkit.createSelector.call(void 0, 
    (state) => state,
    ({ state }) => {
      if (encrypted) {
        return state.encrypted;
      }
      return state.unencrypted;
    }
  );
}






exports.stateSlice = stateSlice; exports.setState = setState; exports.clearState = clearState; exports.getState = getState;
//# sourceMappingURL=chunk-LBC2OGSN.js.map