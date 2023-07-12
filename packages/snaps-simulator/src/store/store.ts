import { configureStore, createAction } from '@reduxjs/toolkit';
import type { SagaIterator, Saga } from 'redux-saga';
import { cancel, fork, take } from 'redux-saga/effects';

import { sagaMiddleware } from './middleware';
import { reducer } from './reducer';
import { rootSaga } from './sagas';

export const abortSaga = createAction('ABORT_SAGA');

/**
 * Create an abortable saga. This is useful for hot module reloading, where
 * sagas need to be restarted.
 *
 * The saga will run until the {@link abortSaga} action is dispatched.
 *
 * @param saga - The saga to make abortable.
 * @returns An abortable saga.
 */
export function createAbortableSaga(saga: Saga) {
  return function* abortableSaga(): SagaIterator {
    const sagaTask = yield fork(saga);
    yield take(abortSaga.type);
    yield cancel(sagaTask);
  };
}

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
        thunk: false,
        immutableCheck: true,
        serializableCheck: false,
      }).concat(sagaMiddleware),
  });

  sagaMiddleware.run(createAbortableSaga(rootSaga));

  /* eslint-disable no-restricted-globals */
  if (module.hot) {
    module.hot.accept('./reducer', () => store.replaceReducer(reducer));
    module.hot.accept('./sagas', () => {
      store.dispatch(abortSaga());
      sagaMiddleware.run(createAbortableSaga(rootSaga));
    });
  }
  /* eslint-enabled no-restricted-globals */

  return store;
}

export type ApplicationState = ReturnType<typeof reducer>;
export type Dispatch = ReturnType<typeof createStore>['dispatch'];
