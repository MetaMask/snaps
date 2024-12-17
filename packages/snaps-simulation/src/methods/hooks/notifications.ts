import type { NotifyParams } from '@metamask/snaps-sdk';
import { NotificationType } from '@metamask/snaps-sdk';
import { nanoid } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { put } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { addNotification } from '../../store';

/**
 * Show a native notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the notification.
 * @param options - The notification options.
 * @param options.message - The message to show in the notification.
 * @yields Adds the notification to the store.
 * @returns `null`.
 */
function* showNativeNotificationImplementation(
  _snapId: string,
  { message }: NotifyParams,
): SagaIterator {
  yield put(
    addNotification({ id: nanoid(), type: NotificationType.Native, message }),
  );

  return null;
}

/**
 * Get a method that can be used to show a native notification.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to show a native notification.
 */
export function getShowNativeNotificationImplementation(
  runSaga: RunSagaFunction,
) {
  return async (
    ...args: Parameters<typeof showNativeNotificationImplementation>
  ) => {
    return await runSaga(
      showNativeNotificationImplementation,
      ...args,
    ).toPromise();
  };
}

/**
 * Show an in-app notification to the user.
 *
 * @param _snapId - The ID of the Snap that created the notification.
 * @param options - The notification options.
 * @param options.message - The message to show in the notification.
 * @param options.title - The title to show in the notification.
 * @param options.content - The JSX content to show in the notification.
 * @param options.footerLink - The footer to show in the notification.
 * @yields Adds the notification to the store.
 * @returns `null`.
 */
function* showInAppNotificationImplementation(
  _snapId: string,
  {
    message,
    title,
    content,
    footerLink,
  }: NotifyParams & {
    title?: string;
    content?: string;
    footerLink?: { text: string; href: string };
  },
): SagaIterator<null> {
  yield put(
    addNotification({
      id: nanoid(),
      type: NotificationType.InApp,
      message,
      title,
      content,
      footerLink,
    }),
  );

  return null;
}

/**
 * Get a method that can be used to show an in-app notification.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that can be used to show an in-app notification.
 */
export function getShowInAppNotificationImplementation(
  runSaga: RunSagaFunction,
) {
  return async (
    ...args: Parameters<typeof showInAppNotificationImplementation>
  ) => {
    return await runSaga(
      showInAppNotificationImplementation,
      ...args,
    ).toPromise();
  };
}
