import { configureStore, createAction } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { api, snapsApi } from './api';
import { reducer } from './reducer';

export const abortSaga = createAction('ABORT_SAGA');

/**
 * Create a Redux store. The store is configured to support hot reloading of
 * the reducers.
 *
 * @returns A Redux store.
 */
export function createStore() {
  const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: true,
        immutableCheck: true,
        serializableCheck: false,
      }).concat(api.middleware, snapsApi.middleware),
  });

  setupListeners(store.dispatch);

  /* eslint-disable no-restricted-globals */
  if (module.hot) {
    module.hot.accept('./reducer', () => store.replaceReducer(reducer));
  }
  /* eslint-enabled no-restricted-globals */

  return store;
}

export type ApplicationState = ReturnType<typeof reducer>;
export type Dispatch = ReturnType<typeof createStore>['dispatch'];
