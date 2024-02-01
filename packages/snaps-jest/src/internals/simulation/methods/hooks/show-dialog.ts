import type { DialogType } from '@metamask/snaps-sdk';
import type { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { resolveInterface, setInterface, closeInterface } from '../../store';

/**
 * Show a dialog to the user. This will wait for `resolveUserInterface` to be
 * dispatched before returning.
 *
 * @param _snapId - The ID of the Snap that created the dialog. This is ignored
 * because the simulator only supports one Snap.
 * @param type - The type of dialog to show.
 * @param id - The interface ID.
 * @param _placeholder - The placeholder text to show in the dialog. This is
 * not implemented yet.
 * @yields Sets the dialog in the store, waits for the user to resolve the
 * dialog, and closes the dialog.
 * @returns The result of the dialog.
 */
function* showDialogImplementation(
  _snapId: string,
  type: DialogType,
  id: string,
  _placeholder?: string,
): SagaIterator<unknown> {
  yield put(setInterface({ type, id }));

  // We use `take` to wait for `resolveUserInterface` to be dispatched, which
  // indicates that the user has resolved the dialog.
  const { payload } = yield take(resolveInterface.type);
  yield put(closeInterface());

  return payload;
}

/**
 * Get the implementation of the `showDialog` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `showDialog` hook.
 */
export function getShowDialogImplementation(runSaga: RunSagaFunction) {
  return async (...args: Parameters<typeof showDialogImplementation>) => {
    return await runSaga(showDialogImplementation, ...args).toPromise();
  };
}
