// src/internals/simulation/store/state.ts
import { createSelector, createSlice } from "@reduxjs/toolkit";
var INITIAL_STATE = {
  encrypted: null,
  unencrypted: null
};
var stateSlice = createSlice({
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
  return createSelector(
    (state) => state,
    ({ state }) => {
      if (encrypted) {
        return state.encrypted;
      }
      return state.unencrypted;
    }
  );
}

export {
  stateSlice,
  setState,
  clearState,
  getState
};
//# sourceMappingURL=chunk-MPZOXW6I.mjs.map