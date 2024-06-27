import type { SagaIterator } from 'redux-saga';
import { put, take } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { resolveInterface, setInterface, closeInterface } from '../../store';

type RequestUserApprovalParams = {
  type: string;
  requestData: {
    id: string;
  };
};

/**
 * Show a dialog to the user. This will wait for `resolveUserInterface` to be
 * dispatched before returning.
 *
 * @param opts - The options for the request.
 * @param opts.type - The type of dialog to show.
 * @param opts.requestData - The data to display in the dialog.
 * @param opts.requestData.id - The ID of the interface.
 * @yields Sets the dialog in the store, waits for the user to resolve the
 * dialog, and closes the dialog.
 * @returns The result of the dialog.
 */
function* requestUserApprovalImplementation({
  type,
  requestData: { id },
}: RequestUserApprovalParams): SagaIterator<unknown> {
  yield put(setInterface({ type, id }));

  // We use `take` to wait for `resolveUserInterface` to be dispatched, which
  // indicates that the user has resolved the dialog.
  const { payload } = yield take(resolveInterface.type);
  yield put(closeInterface());

  return payload;
}

/**
 * Get the implementation of the `requestUserApproval` hook.
 *
 * @param runSaga - The function to run a saga outside the usual Redux flow.
 * @returns The implementation of the `requestUserApproval` hook.
 */
export function getRequestUserApprovalImplementation(runSaga: RunSagaFunction) {
  return async (
    ...args: Parameters<typeof requestUserApprovalImplementation>
  ) => {
    return await runSaga(
      requestUserApprovalImplementation,
      ...args,
    ).toPromise();
  };
}
