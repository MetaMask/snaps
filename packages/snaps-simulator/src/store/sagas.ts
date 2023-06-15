import { all, fork } from 'redux-saga/effects';

import { simulationSaga, rootPollingSaga, manifestSaga } from '../features';

/**
 * Root saga for the application.
 *
 * @yields All sagas for the application.
 */
export function* rootSaga() {
  // To avoid one saga failing and crashing all sagas, we fork each saga
  // individually.
  yield all([fork(simulationSaga), fork(rootPollingSaga), fork(manifestSaga)]);
}
