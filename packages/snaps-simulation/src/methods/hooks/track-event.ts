import type { TrackEventParams } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import { trackEvent } from '../../store/trackables';
import type { RunSagaFunction } from '@metamask/snaps-simulation';

/**
 * Track an event.
 *
 * @param event - The event to track.
 * @returns `null`.
 * @yields Adds the event to the store.
 */
function* trackEventImplementation(
  event: TrackEventParams['event'],
): SagaIterator {
  yield put(trackEvent(event));
  return null;
}

/**
 * Get a method that can be used to track an event.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to track an event.
 */
export function getTrackEventImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof trackEventImplementation>) => {
    return runSaga(trackEventImplementation, ...args).result();
  };
}
