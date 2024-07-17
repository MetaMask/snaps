"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/store/ui.ts
var _toolkit = require('@reduxjs/toolkit');
var INITIAL_STATE = {
  current: null
};
var uiSlice = _toolkit.createSlice.call(void 0, {
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
var resolveInterface = _toolkit.createAction.call(void 0, 
  `${uiSlice.name}/resolveInterface`
);
var { setInterface, closeInterface } = uiSlice.actions;
var getCurrentInterface = _toolkit.createSelector.call(void 0, 
  (state) => state.ui,
  (ui) => ui.current
);







exports.uiSlice = uiSlice; exports.resolveInterface = resolveInterface; exports.setInterface = setInterface; exports.closeInterface = closeInterface; exports.getCurrentInterface = getCurrentInterface;
//# sourceMappingURL=chunk-D653LBAY.js.map