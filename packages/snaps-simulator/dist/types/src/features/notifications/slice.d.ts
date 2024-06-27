import { NotificationType } from '@metamask/snaps-sdk';
export declare type Notification = {
    id: string;
    message: string;
    type: NotificationType;
};
export declare type NotificationsState = {
    notifications: Notification[];
    /**
     * All notifications that have been added to the state. In contrast to
     * `notifications`, this array is never cleared.
     */
    allNotifications: Notification[];
};
export declare const INITIAL_NOTIFICATIONS_STATE: NotificationsState;
export declare const addNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    message: string;
}, "notifications/addNotification">, addNativeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    id: string;
    message: string;
}, "notifications/addNativeNotification">, removeNotification: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "notifications/removeNotification">;
export declare const notifications: import("redux").Reducer<NotificationsState, import("redux").AnyAction>;
export declare const getNotifications: ((state: {
    notifications: NotificationsState;
}) => Notification[]) & import("reselect").OutputSelectorFields<(args_0: NotificationsState) => Notification[], {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
