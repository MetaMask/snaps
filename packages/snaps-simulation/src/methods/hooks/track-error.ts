import { getJsonError } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import { trackError } from '../../store/trackables';
import type { RunSagaFunction } from '@metamask/snaps-simulation';

/**
 * Track an error.
 *
 * @param error - The error to track.
 * @returns `null`.
 * @yields Adds the error to the store.
 */
function* trackErrorImplementation(error: Error): SagaIterator {
  const serialisedError = getJsonError(error);
  yield put(trackError(serialisedError));
  return null;
}

/**
 * Get a method that can be used to track an error.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to track an error.
 */
export function getTrackErrorImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof trackErrorImplementation>) => {
    return runSaga(trackErrorImplementation, ...args).result();
  };
}
