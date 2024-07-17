// src/internals/simulation/store/ui.ts
import { createAction, createSelector, createSlice } from "@reduxjs/toolkit";
var INITIAL_STATE = {
  current: null
};
var uiSlice = createSlice({
  name: "ui",
  initialState: INITIAL_STATE,
  reducers: {
    setInterface(state, action) {
      state.current = action.payload;
    },
    closeInterface(state) {
      state.current = null;
    }
  }
});
var resolveInterface = createAction(
  `${uiSlice.name}/resolveInterface`
);
var { setInterface, closeInterface } = uiSlice.actions;
var getCurrentInterface = createSelector(
  (state) => state.ui,
  (ui) => ui.current
);

export {
  uiSlice,
  resolveInterface,
  setInterface,
  closeInterface,
  getCurrentInterface
};
//# sourceMappingURL=chunk-ZJQSGRNK.mjs.map