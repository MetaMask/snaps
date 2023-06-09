import createSagaMiddleware from 'redux-saga';

export const sagaMiddleware = createSagaMiddleware();

/**
 * A function to run a saga outside of the usual Redux flow.
 *
 * This is useful for running sagas, and waiting for a result using promises.
 * For example:
 *
 * ```ts
 * const result = await runSaga(mySaga, ...args).toPromise();
 * ```
 */
export const runSaga = sagaMiddleware.run.bind(sagaMiddleware);
