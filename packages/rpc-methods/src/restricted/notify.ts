import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { NonEmptyArray, isObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_notify';

// Move all the types to a shared place when implementing more notifications
export enum NotificationType {
  native = 'native',
  inApp = 'inApp',
}

export type NotificationArgs = {
  /**
   * Enum type to determine notification type.
   */
  type: NotificationType;

  /**
   * A message to show on the notification.
   */
  message: string;
};

export type NotifyMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that created the notification.
   * @param args - The notification arguments.
   */
  showNativeNotification: (
    snapId: string,
    args: NotificationArgs,
  ) => Promise<null>;

  /**
   * @param snapId - The ID of the Snap that created the notification.
   * @param args - The notification arguments.
   */
  showInAppNotification: (
    snapId: string,
    args: NotificationArgs,
  ) => Promise<null>;
};

type SpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: NotifyMethodHooks;
};

type Specification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof methodName;
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
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  SpecificationBuilderOptions,
  Specification
> = ({ allowedCaveats = null, methodHooks }: SpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks),
  };
};

export const notifyBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    showNativeNotification: true,
    showInAppNotification: true,
  },
} as const);

/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showNativeNotification - A function that shows a native browser notification.
 * @param hooks.showInAppNotification - A function that shows a notification in the MetaMask UI.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */
function getImplementation({
  showNativeNotification,
  showInAppNotification,
}: NotifyMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<[NotificationArgs]>,
  ): Promise<null> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    switch (validatedParams.type) {
      case NotificationType.native:
        return await showNativeNotification(origin, validatedParams);
      case NotificationType.inApp:
        return await showInAppNotification(origin, validatedParams);
      default:
        throw ethErrors.rpc.invalidParams({
          message: 'Must specify a valid notification "type".',
        });
    }
  };
}

/**
 * Validates the notify method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
function getValidatedParams(params: unknown): NotificationArgs {
  if (!Array.isArray(params) || !isObject(params[0])) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected array params with single object.',
    });
  }

  const { type, message } = params[0];

  if (
    !type ||
    typeof type !== 'string' ||
    !(Object.values(NotificationType) as string[]).includes(type)
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Must specify a valid notification "type".',
    });
  }

  // Set to the max message length on a Mac notification for now.
  if (!message || typeof message !== 'string' || message.length >= 50) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "message" less than 50 characters long.',
    });
  }

  return params[0] as NotificationArgs;
}
