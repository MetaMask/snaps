export declare const sagaMiddleware: import("redux-saga").SagaMiddleware<object>;
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
export declare const runSaga: <S extends import("redux-saga").Saga<any[]>>(saga: S, ...args: Parameters<S>) => import("redux-saga").Task<any>;
