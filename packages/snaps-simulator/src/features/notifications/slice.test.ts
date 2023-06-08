import { NotificationType } from '@metamask/rpc-methods';

import {
  addNativeNotification,
  addNotification,
  INITIAL_NOTIFICATIONS_STATE,
  notifications as reducer,
  removeNotification,
} from './slice';

describe('notifications slice', () => {
  describe('addNotification', () => {
    it('adds a notification to the state', () => {
      const result = reducer(
        INITIAL_NOTIFICATIONS_STATE,
        addNotification({
          id: 'foo',
          message: 'Hello, world!',
        }),
      );

      expect(result.notifications).toHaveLength(1);
      expect(result.notifications).toStrictEqual([
        {
          id: expect.any(String),
          message: 'Hello, world!',
          type: NotificationType.InApp,
        },
      ]);
    });
  });

  describe('addNativeNotification', () => {
    it('adds a native notification to the state', () => {
      const result = reducer(
        INITIAL_NOTIFICATIONS_STATE,
        addNativeNotification({
          id: 'foo',
          message: 'Hello, world!',
        }),
      );

      expect(result.notifications).toHaveLength(0);
      expect(result.allNotifications).toHaveLength(1);
      expect(result.allNotifications).toStrictEqual([
        {
          id: expect.any(String),
          message: 'Hello, world!',
          type: NotificationType.Native,
        },
      ]);
    });
  });

  describe('removeNotification', () => {
    it('removes a notification from the state', () => {
      const result = reducer(
        {
          allNotifications: [
            {
              id: '1',
              message: 'Hello, world!',
              type: NotificationType.Native,
            },
          ],
          notifications: [
            {
              id: '1',
              message: 'Hello, world!',
              type: NotificationType.InApp,
            },
          ],
        },
        removeNotification('1'),
      );

      expect(result.notifications).toStrictEqual([]);
      expect(result.allNotifications).toStrictEqual([
        {
          id: '1',
          message: 'Hello, world!',
          type: NotificationType.Native,
        },
      ]);
    });
  });
});
