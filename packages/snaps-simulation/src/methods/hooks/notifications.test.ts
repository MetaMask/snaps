import { NotificationType } from '@metamask/snaps-sdk';

import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';
import {
  getShowInAppNotificationImplementation,
  getShowNativeNotificationImplementation,
} from './notifications';

describe('getShowNativeNotificationImplementation', () => {
  it('returns the implementation of the `showNativeNotification` hook', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getShowNativeNotificationImplementation(runSaga);

    expect(
      await fn('snap-id', {
        type: NotificationType.Native,
        message: 'message',
      }),
    ).toBeNull();

    expect(store.getState().notifications.notifications).toStrictEqual([
      {
        id: expect.any(String),
        type: NotificationType.Native,
        message: 'message',
      },
    ]);
  });
});

describe('getShowInAppNotificationImplementation', () => {
  const baseRequest = {
    title: undefined,
    content: undefined,
    footerLink: undefined,
  };

  it.each([
    { type: NotificationType.InApp, message: 'message' },
    {
      type: NotificationType.InApp,
      content: 'abcd',
      title: 'foo',
      message: 'bar',
    },
  ])(
    'returns the implementation of the `showInAppNotification` hook',
    async (request) => {
      const { store, runSaga } = createStore(getMockOptions());
      const fn = getShowInAppNotificationImplementation(runSaga);

      expect(await fn('snap-id', request)).toBeNull();

      expect(store.getState().notifications.notifications).toStrictEqual([
        {
          ...baseRequest,
          ...request,
          id: expect.any(String),
        },
      ]);
    },
  );
});
