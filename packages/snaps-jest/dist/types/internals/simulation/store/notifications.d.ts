import type { NotificationType } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
/**
 * A notification object.
 *
 * @property id - A unique ID for the notification.
 * @property message - The notification message.
 * @property type - The notification type.
 */
export declare type Notification = {
    id: string;
    message: string;
    type: NotificationType;
};
/**
 * The notifications state.
 *
 * @property notifications - An array of notifications.
 */
export declare type NotificationsState = {
    notifications: Notification[];
};
export declare const notificationsSlice: import("@reduxjs/toolkit").Slice<NotificationsState, {
    addNotification: (state: import("immer/dist/internal").WritableDraft<NotificationsState>, action: PayloadAction<Notification>) => void;
    removeNotification: (state: import("immer/dist/internal").WritableDraft<NotificationsState>, action: PayloadAction<string>) => void;
    clearNotifications: (state: import("immer/dist/internal").WritableDraft<NotificationsState>) => void;
}, "notifications">;
export declare const addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<Notification, "notifications/addNotification">, removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "notifications/removeNotification">, clearNotifications: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"notifications/clearNotifications">;
/**
 * Get the notifications from the state.
 *
 * @param state - The application state.
 * @returns An array of notifications.
 */
export declare const getNotifications: ((state: {
    mocks: import("./mocks").MocksState;
    notifications: NotificationsState;
    state: import("./state").State;
    ui: import("./ui").UiState;
}) => Notification[]) & import("reselect").OutputSelectorFields<(args_0: NotificationsState) => Notification[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
