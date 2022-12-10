import { PermissionSpecificationBuilder, PermissionType, RestrictedMethodOptions } from '@metamask/controllers';
import { NonEmptyArray } from '@metamask/utils';
declare const methodName = "snap_notify";
export declare enum NotificationType {
    native = "native",
    inApp = "inApp"
}
export declare type NotificationArgs = {
    /**
     * Enum type to determine notification type.
     */
    type: NotificationType;
    /**
     * A message to show on the notification.
     */
    message: string;
};
export declare type NotifyMethodHooks = {
    /**
     * @param snapId - The ID of the Snap that created the notification.
     * @param args - The notification arguments.
     */
    showNativeNotification: (snapId: string, args: NotificationArgs) => Promise<null>;
    /**
     * @param snapId - The ID of the Snap that created the notification.
     * @param args - The notification arguments.
     */
    showInAppNotification: (snapId: string, args: NotificationArgs) => Promise<null>;
};
declare type SpecificationBuilderOptions = {
    allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
    methodHooks: NotifyMethodHooks;
};
export declare const notifyBuilder: Readonly<{
    readonly targetKey: "snap_notify";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, SpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetKey: typeof methodName;
        methodImplementation: ReturnType<typeof getImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: {
        readonly showNativeNotification: true;
        readonly showInAppNotification: true;
    };
}>;
/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showNativeNotification - A function that shows a native browser notification.
 * @param hooks.showInAppNotification - A function that shows a notification in the MetaMask UI.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */
declare function getImplementation({ showNativeNotification, showInAppNotification, }: NotifyMethodHooks): (args: RestrictedMethodOptions<[NotificationArgs]>) => Promise<null>;
export {};
