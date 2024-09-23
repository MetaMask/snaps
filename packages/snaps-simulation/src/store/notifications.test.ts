import { NotificationType } from '@metamask/snaps-sdk';

import {
  addNotification,
  clearNotifications,
  getNotifications,
  notificationsSlice,
  removeNotification,
} from './notifications';

describe('notificationsSlice', () => {
  describe('addNotification', () => {
    it('adds a notification to the state', () => {
      const state = notificationsSlice.reducer(
        undefined,
        addNotification({
          id: 'foo',
          message: 'bar',
          type: NotificationType.Native,
        }),
      );

      expect(state).toStrictEqual({
        notifications: [
          {
            id: 'foo',
            message: 'bar',
            type: NotificationType.Native,
          },
        ],
      });
    });
  });

  describe('removeNotification', () => {
    it('removes a notification from the state', () => {
      const state = notificationsSlice.reducer(
        {
          notifications: [
            {
              id: 'foo',
              message: 'bar',
              type: NotificationType.Native,
            },
          ],
        },
        removeNotification('foo'),
      );

      expect(state).toStrictEqual({
        notifications: [],
      });
    });
  });

  describe('clearNotifications', () => {
    it('clears the notifications from the state', () => {
      const state = notificationsSlice.reducer(
        {
          notifications: [
            {
              id: 'foo',
              message: 'bar',
              type: NotificationType.Native,
            },
          ],
        },
        clearNotifications(),
      );

      expect(state).toStrictEqual({
        notifications: [],
      });
    });
  });
});

describe('getNotifications', () => {
  it('returns the notifications from the state', () => {
    const state = {
      notifications: {
        notifications: [
          {
            id: 'foo',
            message: 'bar',
            type: NotificationType.Native,
          },
        ],
      },
    };

    // @ts-expect-error - The `state` parameter is only partially defined.
    expect(state.notifications.notifications).toBe(getNotifications(state));
  });
});
