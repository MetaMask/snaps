import type { PermissionSpecificationBuilder, RestrictedMethodOptions, ValidPermissionSpecification } from '@metamask/permission-controller';
import { PermissionType } from '@metamask/permission-controller';
import type { EnumToUnion } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from '../utils';
declare const methodName = "snap_notify";
export declare enum NotificationType {
    InApp = "inApp",
    Native = "native"
}
export declare type NotificationArgs = {
    /**
     * Enum type to determine notification type.
     */
    type: EnumToUnion<NotificationType>;
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
declare type Specification = ValidPermissionSpecification<{
    permissionType: PermissionType.RestrictedMethod;
    targetName: typeof methodName;
    methodImplementation: ReturnType<typeof getImplementation>;
    allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;
/**
 * The specification builder for the `snap_notify` permission.
 * `snap_notify` allows snaps to send multiple types of notifications to its users.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_notify` permission.
 */
export declare const specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, SpecificationBuilderOptions, Specification>;
export declare const notifyBuilder: Readonly<{
    readonly targetName: "snap_notify";
    readonly specificationBuilder: PermissionSpecificationBuilder<PermissionType.RestrictedMethod, SpecificationBuilderOptions, {
        permissionType: PermissionType.RestrictedMethod;
        targetName: typeof methodName;
        methodImplementation: ReturnType<typeof getImplementation>;
        allowedCaveats: Readonly<NonEmptyArray<string>> | null;
    }>;
    readonly methodHooks: MethodHooksObject<NotifyMethodHooks>;
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
export declare function getImplementation({ showNativeNotification, showInAppNotification, }: NotifyMethodHooks): (args: RestrictedMethodOptions<NotificationArgs>) => Promise<null>;
/**
 * Validates the notify method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
export declare function getValidatedParams(params: unknown): NotificationArgs;
export {};
