import type { NotificationType } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

export type Notification = {
  id: string;
  message: string;
  type: NotificationType;
};

export type NotificationsState = {
  notifications: Notification[];
};

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

export const getNotifications = createSelector(
  (state: ApplicationState) => state.notifications,
  ({ notifications }) => notifications,
);
