import {
  notificationsSlice
} from "./chunk-LB4R3BUA.mjs";
import {
  setState,
  stateSlice
} from "./chunk-MPZOXW6I.mjs";
import {
  uiSlice
} from "./chunk-JBCVYYCS.mjs";
import {
  mocksSlice
} from "./chunk-H2464AXT.mjs";

// src/internals/simulation/store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
function createStore({ state, unencryptedState }) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      mocks: mocksSlice.reducer,
      notifications: notificationsSlice.reducer,
      state: stateSlice.reducer,
      ui: uiSlice.reducer
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware)
  });
  if (state) {
    store.dispatch(
      setState({
        state: JSON.stringify(state),
        encrypted: true
      })
    );
  }
  if (unencryptedState) {
    store.dispatch(
      setState({
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

export {
  createStore
};
//# sourceMappingURL=chunk-QGF2M7HK.mjs.map