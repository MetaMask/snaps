import type { NotificationType } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

/**
 * A notification object.
 *
 * @property id - A unique ID for the notification.
 * @property message - The notification message.
 * @property type - The notification type.
 */
export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

/**
 * The notifications state.
 *
 * @property notifications - An array of notifications.
 */
export type NotificationsState = {
  notifications: Notification[];
};

/**
 * The initial notifications state.
 */
const INITIAL_STATE: NotificationsState = {
  notifications: [],
};

export const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: INITIAL_STATE,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload,
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
  },
});

export const { addNotification, removeNotification, clearNotifications } =
  notificationsSlice.actions;

/**
 * Get the notifications from the state.
 *
 * @param state - The application state.
 * @returns An array of notifications.
 */
export const getNotifications = createSelector(
  (state: ApplicationState) => state.notifications,
  ({ notifications }) => notifications,
);
