"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/internals/simulation/store/notifications.ts
var _toolkit = require('@reduxjs/toolkit');
var INITIAL_STATE = {
  notifications: []
};
var notificationsSlice = _toolkit.createSlice.call(void 0, {
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
var getNotifications = _toolkit.createSelector.call(void 0, 
  (state) => state.notifications,
  ({ notifications }) => notifications
);







exports.notificationsSlice = notificationsSlice; exports.addNotification = addNotification; exports.removeNotification = removeNotification; exports.clearNotifications = clearNotifications; exports.getNotifications = getNotifications;
//# sourceMappingURL=chunk-2YE2P5BZ.js.map