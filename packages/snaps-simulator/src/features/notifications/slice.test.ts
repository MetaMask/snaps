import {
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
            },
          ],
          notifications: [
            {
              id: '1',
              message: 'Hello, world!',
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
        },
      ]);
    });
  });
});
