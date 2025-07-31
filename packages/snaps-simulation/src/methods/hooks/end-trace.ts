import type { EndTraceParams } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { endTrace } from '../../store';

/**
 * End a performance trace.
 *
 * @param event - The performance trace to end.
 * @returns `null`.
 * @yields Adds the completed trace to the store.
 */
function* endTraceImplementation(event: EndTraceParams): SagaIterator {
  yield put(endTrace(event));
  return null;
}

/**
 * Get a method that can be used to end a performance trace.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to end a performance trace.
 */
export function getEndTraceImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof endTraceImplementation>) => {
    return runSaga(endTraceImplementation, ...args).result();
  };
}
