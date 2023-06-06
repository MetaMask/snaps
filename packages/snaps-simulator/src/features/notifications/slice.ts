import { JsonRpcId } from '@metamask/utils';
import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type Notification = {
  id: JsonRpcId;
  message: string;
};

export type NotificationsState = {
  notifications: Notification[];

  /**
   * All notifications that have been added to the state. In contrast to
   * `notifications`, this array is never cleared.
   */
  allNotifications: Notification[];
};

export const INITIAL_NOTIFICATIONS_STATE: NotificationsState = {
  notifications: [],
  allNotifications: [],
};

const slice = createSlice({
  name: 'notifications',
  initialState: INITIAL_NOTIFICATIONS_STATE,
  reducers: {
    /**
     * Add a notification to the state.
     *
     * @param state - The current state.
     * @param action - The action with the notification message as the payload.
     */
    addNotification(
      state,
      action: PayloadAction<{ id: JsonRpcId; message: string }>,
    ) {
      state.notifications.push(action.payload);
      state.allNotifications.push(action.payload);
    },

    /**
     * Remove a notification from the state.
     *
     * @param state - The current state.
     * @param action - The action with the notification ID to remove as the
     * payload.
     */
    removeNotification(state, action: PayloadAction<string>) {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
  },
});

export const { addNotification, removeNotification } = slice.actions;
export const notifications = slice.reducer;

export const getNotifications = createSelector(
  (state: { notifications: NotificationsState }) => state.notifications,
  (state) => state.notifications,
);
