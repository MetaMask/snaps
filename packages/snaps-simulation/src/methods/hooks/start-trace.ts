import type { StartTraceParams } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { startTrace } from '../../store';

/**
 * Start a performance trace.
 *
 * @param event - The performance trace to start.
 * @returns `null`.
 * @yields Adds the pending trace to the store.
 */
function* startTraceImplementation(event: StartTraceParams): SagaIterator {
  yield put(startTrace(event));
  return {
    /* eslint-disable @typescript-eslint/naming-convention */
    _traceId: 'test-trace-id',
    _spanId: 'test-span-id',
    /* eslint-enable @typescript-eslint/naming-convention */
  };
}

/**
 * Get a method that can be used to start a performance trace.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to start a performance trace.
 */
export function getStartTraceImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof startTraceImplementation>) => {
    return runSaga(startTraceImplementation, ...args).result();
  };
}
