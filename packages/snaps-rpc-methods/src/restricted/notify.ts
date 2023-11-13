import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { NotificationType } from '@metamask/snaps-sdk';
import type {
  NotifyParams,
  NotifyResult,
  EnumToUnion,
} from '@metamask/snaps-sdk';
import { validateTextLinks } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { isObject } from '@metamask/utils';

import { type MethodHooksObject } from '../utils';

const methodName = 'snap_notify';

export type NotificationArgs = {
  /**
   * Enum type to determine notification type.
   */
  type: EnumToUnion<NotificationType>;

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

  isOnPhishingList: (url: string) => boolean;

  maybeUpdatePhishingList: () => Promise<void>;
};

type SpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: NotifyMethodHooks;
};

type Specification = ValidPermissionSpecification<{
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
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  SpecificationBuilderOptions,
  Specification
> = ({ allowedCaveats = null, methodHooks }: SpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<NotifyMethodHooks> = {
  showNativeNotification: true,
  showInAppNotification: true,
  isOnPhishingList: true,
  maybeUpdatePhishingList: true,
};

export const notifyBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showNativeNotification - A function that shows a native browser notification.
 * @param hooks.showInAppNotification - A function that shows a notification in the MetaMask UI.
 * @param hooks.isOnPhishingList - A function that checks for links against the phishing list.
 * @param hooks.maybeUpdatePhishingList - A function that updates the phishing list if needed.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */
export function getImplementation({
  showNativeNotification,
  showInAppNotification,
  isOnPhishingList,
  maybeUpdatePhishingList,
}: NotifyMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<NotifyParams>,
  ): Promise<NotifyResult> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    await maybeUpdatePhishingList();

    validateTextLinks(validatedParams.message, isOnPhishingList);

    switch (validatedParams.type) {
      case NotificationType.Native:
        return await showNativeNotification(origin, validatedParams);
      case NotificationType.InApp:
        return await showInAppNotification(origin, validatedParams);
      default:
        throw rpcErrors.invalidParams({
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
export function getValidatedParams(params: unknown): NotifyParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { type, message } = params;

  if (
    !type ||
    typeof type !== 'string' ||
    !Object.values(NotificationType).includes(type as NotificationType)
  ) {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid notification "type".',
    });
  }

  // Set to the max message length on a Mac notification for now.
  if (!message || typeof message !== 'string' || message.length >= 50) {
    throw rpcErrors.invalidParams({
      message:
        'Must specify a non-empty string "message" less than 50 characters long.',
    });
  }

  return params as NotificationArgs;
}
