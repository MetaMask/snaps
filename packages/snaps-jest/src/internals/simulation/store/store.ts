import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';

import type { SimulationOptions } from '../options';
import { mocksSlice } from './mocks';
import { notificationsSlice } from './notifications';
import { setState, stateSlice } from './state';
import { uiSlice } from './ui';

/**
 * Create a Redux store.
 *
 * @param password - The password to use for state encryption.
 * @param options - The simulation options.
 * @param options.state - The initial state for the Snap.
 * @param options.unencryptedState - The initial unencrypted state for the Snap.
 * @returns A Redux store with the default state.
 */
export function createStore(
  password: string,
  { state, unencryptedState }: SimulationOptions,
) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: {
      mocks: mocksSlice.reducer,
      notifications: notificationsSlice.reducer,
      state: stateSlice.reducer,
      ui: uiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });

  // Set initial state for the Snap.
  if (state) {
    store.dispatch(
      setState({
        state: JSON.stringify({
          password,
          value: state,
        }),
        encrypted: true,
      }),
    );
  }

  if (unencryptedState) {
    store.dispatch(
      setState({
        state: JSON.stringify(unencryptedState),
        encrypted: false,
      }),
    );
  }

  return {
    store,
    runSaga: sagaMiddleware.run.bind(sagaMiddleware),
  };
}

export type Store = ReturnType<typeof createStore>['store'];
export type ApplicationState = ReturnType<Store['getState']>;
export type RunSagaFunction = ReturnType<typeof createStore>['runSaga'];
