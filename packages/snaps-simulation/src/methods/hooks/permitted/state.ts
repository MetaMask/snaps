import { parseJson } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import type { SagaIterator } from 'redux-saga';
import { put, select } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../../store';
import { clearState, getState, setState } from '../../../store';

/**
 * Get the Snap state from the store.
 *
 * @param encrypted - Whether to get the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @returns The state of the Snap.
 * @yields Selects the state from the store.
 */
function* getSnapStateImplementation(encrypted: boolean): SagaIterator<string> {
  const state = yield select(getState(encrypted));
  // TODO: Use actual decryption implementation
  return parseJson(state);
}

/**
 * Get the implementation of the `getSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `getSnapState` hook.
 */
export function getPermittedGetSnapStateMethodImplementation(
  runSaga: RunSagaFunction,
) {
  return async (...args: Parameters<typeof getSnapStateImplementation>) => {
    return await runSaga(getSnapStateImplementation, ...args).toPromise();
  };
}

/**
 * Update the Snap state in the store.
 *
 * @param newState - The new state.
 * @param encrypted - Whether to update the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @yields Puts the new state in the store.
 */
function* updateSnapStateImplementation(
  newState: Record<string, Json>,
  encrypted: boolean,
): SagaIterator<void> {
  // TODO: Use actual encryption implementation
  yield put(setState({ state: JSON.stringify(newState), encrypted }));
}

/**
 * Get the implementation of the `updateSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `updateSnapState` hook.
 */
export function getPermittedUpdateSnapStateMethodImplementation(
  runSaga: RunSagaFunction,
) {
  return async (...args: Parameters<typeof updateSnapStateImplementation>) => {
    return await runSaga(updateSnapStateImplementation, ...args).toPromise();
  };
}

/**
 * Clear the Snap state in the store.
 *
 * @param encrypted - Whether to clear the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @yields Puts the new state in the store.
 */
function* clearSnapStateImplementation(encrypted: boolean): SagaIterator<void> {
  yield put(clearState({ encrypted }));
}

/**
 * Get the implementation of the `clearSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `clearSnapState` hook.
 */
export function getPermittedClearSnapStateMethodImplementation(
  runSaga: RunSagaFunction,
) {
  return async (...args: Parameters<typeof clearSnapStateImplementation>) => {
    runSaga(clearSnapStateImplementation, ...args).result();
  };
}
