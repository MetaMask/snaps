"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _chunk2YE2P5BZjs = require('./chunk-2YE2P5BZ.js');



var _chunkLBC2OGSNjs = require('./chunk-LBC2OGSN.js');


var _chunkD653LBAYjs = require('./chunk-D653LBAY.js');


var _chunkLACTK6EOjs = require('./chunk-LACTK6EO.js');

// src/internals/simulation/store/store.ts
var _toolkit = require('@reduxjs/toolkit');
var _reduxsaga = require('redux-saga'); var _reduxsaga2 = _interopRequireDefault(_reduxsaga);
function createStore({ state, unencryptedState }) {
  const sagaMiddleware = _reduxsaga2.default.call(void 0, );
  const store = _toolkit.configureStore.call(void 0, {
    reducer: {
      mocks: _chunkLACTK6EOjs.mocksSlice.reducer,
      notifications: _chunk2YE2P5BZjs.notificationsSlice.reducer,
      state: _chunkLBC2OGSNjs.stateSlice.reducer,
      ui: _chunkD653LBAYjs.uiSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
  });
  if (state) {
    store.dispatch(
      _chunkLBC2OGSNjs.setState.call(void 0, {
        state: JSON.stringify(state),
        encrypted: true
      })
    );
  }
  if (unencryptedState) {
    store.dispatch(
      _chunkLBC2OGSNjs.setState.call(void 0, {
        state: JSON.stringify(unencryptedState),
        encrypted: false
      })
    );
  }
  return {
    store,
    runSaga: sagaMiddleware.run.bind(sagaMiddleware)
  };
}



exports.createStore = createStore;
//# sourceMappingURL=chunk-ALE5GAX6.js.map