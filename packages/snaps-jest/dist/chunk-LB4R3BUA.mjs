// src/internals/simulation/store/notifications.ts
import { createSelector, createSlice } from "@reduxjs/toolkit";
var INITIAL_STATE = {
  notifications: []
};
var notificationsSlice = createSlice({
  name: "notifications",
  initialState: INITIAL_STATE,
  reducers: {
    addNotification: (state, action) => {
      state.notifications.push(action.payload);
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    }
  }
});
var { addNotification, removeNotification, clearNotifications } = notificationsSlice.actions;
var getNotifications = createSelector(
  (state) => state.notifications,
  ({ notifications }) => notifications
);

export {
  notificationsSlice,
  addNotification,
  removeNotification,
  clearNotifications,
  getNotifications
};
//# sourceMappingURL=chunk-LB4R3BUA.mjs.map