import type { DialogType, NotificationArgs } from '@metamask/rpc-methods';
import type { Component } from '@metamask/snaps-ui';
import { nanoid } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { call, put, select, take } from 'redux-saga/effects';

import { addNativeNotification, addNotification } from '../notifications';
import {
  closeUserInterface,
  getRequestId,
  getSnapName,
  getSnapStateSelector,
  resolveUserInterface,
  setSnapState,
  showUserInterface,
} from './slice';

/**
 * Show a dialog to the user.
 *
 * @param snapId - The ID of the Snap that created the alert.
 * @param type - The type of dialog to show.
 * @param content - The content to show in the dialog.
 * @param _placeholder - The placeholder text to show in the dialog.
 * @yields Selects the current state.
 * @returns True if the dialog was shown, false otherwise.
 */
export function* showDialog(
  snapId: string,
  type: DialogType,
  content: Component,
  _placeholder?: string,
): SagaIterator {
  const snapName = yield select(getSnapName);

  // TODO: Support placeholder.
  yield put(
    showUserInterface({
      snapId,
      snapName: snapName ?? snapId,
      type,
      node: content,
    }),
  );

  const { payload } = yield take(resolveUserInterface.type);
  yield put(closeUserInterface());

  return payload;
}

/**
 * Show a native notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the alert.
 * @param args - The arguments to pass to the notification.
 * @param args.message - The message to show in the notification.
 * @yields Calls the Notification API.
 * @returns `null`.
 */
export function* showNativeNotification(
  _snapId: string,
  { message }: NotificationArgs,
): SagaIterator {
  const id = yield select(getRequestId);
  yield put(
    addNativeNotification({
      id,
      message,
    }),
  );

  const snapName = yield select(getSnapName);

  if (Notification.permission === 'default') {
    const permission = yield call([Notification, 'requestPermission']);
    if (permission === 'denied') {
      // Show notification permission denied error.
      yield put(
        addNotification({
          id: nanoid(),
          message:
            'Unable to show browser notification. Make sure notifications are enabled in your browser settings.',
        }),
      );
    }
  }

  if (Notification.permission === 'denied') {
    // Show notification permission denied error.
    yield put(
      addNotification({
        id: nanoid(),
        message:
          'Unable to show browser notification. Make sure notifications are enabled in your browser settings.',
      }),
    );
  }

  // eslint-disable-next-line no-new
  new Notification(snapName, {
    body: message,
  });

  return null;
}

/**
 * Show an in-app notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the alert.
 * @param args - The arguments to pass to the notification.
 * @param args.message - The message to show in the notification.
 * @yields Adds a notification to the notification list.
 * @returns `null`.
 */
export function* showInAppNotification(
  _snapId: string,
  { message }: NotificationArgs,
): SagaIterator {
  const id = yield select(getRequestId);
  yield put(
    addNotification({
      id,
      message,
    }),
  );

  return null;
}

/**
 * Updates the snap state in the simulation slice.
 *
 * @param _snapId - The snap id, unused for now.
 * @param newSnapState - The new state.
 * @yields Puts the newSnapState
 */
export function* updateSnapState(
  _snapId: string,
  newSnapState: string | null,
): SagaIterator {
  yield put(setSnapState(newSnapState));
}

/**
 * Gets the snap state from the simulation slice.
 *
 * @param _snapId - The snap id, unused for now.
 * @returns The snap state.
 * @yields Selects the snap state from the simulation slice.
 */
export function* getSnapState(_snapId: string): SagaIterator {
  const state: string = yield select(getSnapStateSelector);
  return state;
}
