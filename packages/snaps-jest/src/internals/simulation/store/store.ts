import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import type { SimulationOptions } from '../options';
import { notificationsSlice } from './notifications';
import { setState, stateSlice } from './state';
import { uiSlice } from './ui';

/**
 * Create a Redux store.
 *
 * @param options - The simulation options.
 * @param options.state - The initial state for the Snap.
 * @returns A Redux store with the default state.
 */
export function createStore({ state }: SimulationOptions) {
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

  // Set initial state for the Snap.
  store.dispatch(
    setState({
      state: JSON.stringify(state),
      encrypted: true,
    }),
  );

  store.dispatch(
    setState({
      state: JSON.stringify(state),
      encrypted: false,
    }),
  );

  return {
    store,
    runSaga: sagaMiddleware.run.bind(sagaMiddleware),
  };
}

export type Store = ReturnType<typeof createStore>['store'];
export type ApplicationState = ReturnType<Store['getState']>;
export type RunSagaFunction = ReturnType<typeof createStore>['runSaga'];
