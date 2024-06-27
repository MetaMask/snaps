/**
 * Root saga for the application.
 *
 * @yields All sagas for the application.
 */
export declare function rootSaga(): Generator<import("redux-saga/effects").AllEffect<import("redux-saga/effects").ForkEffect<void>>, void, unknown>;
