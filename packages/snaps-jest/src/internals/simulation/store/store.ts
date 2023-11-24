import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import { notificationsSlice } from './notifications';
import { stateSlice } from './state';
import { uiSlice } from './ui';

/**
 * Create a Redux store.
 *
 * @returns A Redux store with the default state.
 */
export function createStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      notifications: notificationsSlice.reducer,
      state: stateSlice.reducer,
      ui: uiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });

  return {
    store,
    runSaga: sagaMiddleware.run.bind(sagaMiddleware),
  };
}

export type Store = ReturnType<typeof createStore>['store'];
export type ApplicationState = ReturnType<Store['getState']>;
export type RunSagaFunction = ReturnType<typeof createStore>['runSaga'];
