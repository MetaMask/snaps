import { parseJson } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import type { SagaIterator } from 'redux-saga';
import { put, select } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { clearState, getState, setState } from '../../store';

/**
 * Get the Snap state from the store.
 *
 * @param _snapId - The ID of the Snap to get the state for. This is ignored
 * because the simulator only supports one Snap.
 * @param encrypted - Whether to get the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @returns The state of the Snap.
 * @yields Selects the state from the store.
 */
function* getSnapStateImplementation(
  _snapId: string,
  encrypted = true,
): SagaIterator<string> {
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
export function getGetSnapStateMethodImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof getSnapStateImplementation>) => {
    return runSaga(getSnapStateImplementation, ...args).result();
  };
}

/**
 * Update the Snap state in the store.
 *
 * @param _snapId - The ID of the Snap to update the state for. This is ignored
 * because the simulator only supports one Snap.
 * @param newState - The new state.
 * @param encrypted - Whether to update the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @yields Puts the new state in the store.
 */
function* updateSnapStateImplementation(
  _snapId: string,
  newState: Record<string, Json>,
  encrypted = true,
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
export function getUpdateSnapStateMethodImplementation(
  runSaga: RunSagaFunction,
) {
  return (...args: Parameters<typeof updateSnapStateImplementation>) => {
    runSaga(updateSnapStateImplementation, ...args).result();
  };
}

/**
 * Clear the Snap state in the store.
 *
 * @param _snapId - The ID of the Snap to clear the state for. This is ignored
 * because the simulator only supports one Snap.
 * @param encrypted - Whether to clear the encrypted or unencrypted state.
 * Defaults to encrypted state.
 * @yields Puts the new state in the store.
 */
function* clearSnapStateImplementation(
  _snapId: string,
  encrypted = true,
): SagaIterator<void> {
  yield put(clearState({ encrypted }));
}

/**
 * Get the implementation of the `clearSnapState` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `clearSnapState` hook.
 */
export function getClearSnapStateMethodImplementation(
  runSaga: RunSagaFunction,
) {
  return async (...args: Parameters<typeof clearSnapStateImplementation>) => {
    runSaga(clearSnapStateImplementation, ...args).result();
  };
}
