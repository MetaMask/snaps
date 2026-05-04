import type { Messenger } from '@metamask/messenger';
import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  NotifyParams,
  NotifyResult,
  ComponentOrElement,
} from '@metamask/snaps-sdk';
import {
  enumValue,
  NotificationType,
  union,
  ContentType,
  getErrorMessage,
  ComponentOrElementStruct,
} from '@metamask/snaps-sdk';
import {
  createUnion,
  validateLink,
  validateTextLinks,
} from '@metamask/snaps-utils';
import type { InferMatching } from '@metamask/snaps-utils';
import { object, string, optional } from '@metamask/superstruct';
import type { NonEmptyArray } from '@metamask/utils';
import { hasProperty, isObject } from '@metamask/utils';

import type {
  RateLimitControllerCallAction,
  SnapControllerGetSnapAction,
  SnapInterfaceControllerCreateInterfaceAction,
} from '../types';
import { type MethodHooksObject } from '../utils';

const methodName = 'snap_notify';

const NativeNotificationStruct = object({
  type: enumValue(NotificationType.Native),
  message: string(),
});

const InAppNotificationStruct = object({
  type: enumValue(NotificationType.InApp),
  message: string(),
});

const InAppNotificationWithDetailsStruct = object({
  type: enumValue(NotificationType.InApp),
  message: string(),
  content: ComponentOrElementStruct,
  title: string(),
  footerLink: optional(
    object({
      href: string(),
      text: string(),
    }),
  ),
});

const NotificationParametersStruct = union([
  InAppNotificationStruct,
  InAppNotificationWithDetailsStruct,
  NativeNotificationStruct,
]);

export type NotificationArgs = InferMatching<
  typeof NotificationParametersStruct,
  NotifyParams
>;

export type NotifyMethodHooks = {
  isOnPhishingList: (url: string) => boolean;

  maybeUpdatePhishingList: () => Promise<void>;
};

export type NotifyMessengerActions =
  | RateLimitControllerCallAction
  | SnapControllerGetSnapAction
  | SnapInterfaceControllerCreateInterfaceAction;

type SpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: NotifyMethodHooks;
  messenger: Messenger<string, NotifyMessengerActions>;
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
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_notify` permission.
 */
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  SpecificationBuilderOptions,
  Specification
> = ({
  allowedCaveats = null,
  methodHooks,
  messenger,
}: SpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getImplementation({ methodHooks, messenger }),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<NotifyMethodHooks> = {
  isOnPhishingList: true,
  maybeUpdatePhishingList: true,
};

/**
 * Display a
 * [notification](https://docs.metamask.io/snaps/features/notifications/) in
 * MetaMask or natively in the OS. Snaps can trigger a short (up to 80
 * characters) notification message for actionable or time sensitive
 * information. `inApp` notifications can also include an optional
 * [expanded view](https://docs.metamask.io/snaps/features/notifications/#expanded-view).
 * The expanded view has a title, content, and optional footer link shown when
 * a user clicks on the notification.
 *
 * @example Basic in app notification
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_notify": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * snap.request({
 *   method: 'snap_notify',
 *   params: {
 *     type: 'inApp',
 *     message: 'This is an in-app notification',
 *   },
 * });
 * ```
 *
 * @example Expandable in app notification
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_notify": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * snap.request({
 *   method: 'snap_notify',
 *   params: {
 *     type: 'inApp',
 *     message: 'This is an in-app notification',
 *     title: 'Notification Title',
 *     content: (
 *       <Box>
 *         <Text>This is the expanded content of the notification.</Text>
 *       </Box>
 *     ),
 *     footerLink: {
 *       href: 'https://example.com',
 *       text: 'Click here for more info',
 *     },
 *   },
 * });
 * ```
 *
 * @example Native notification
 * ```json name="Manifest"
 * {
 *   "initialPermissions": {
 *     "snap_notify": {}
 *   }
 * }
 * ```
 * ```ts name="Usage"
 * snap.request({
 *   method: 'snap_notify',
 *   params: {
 *     type: 'native',
 *     message: 'This is a native notification',
 *   },
 * });
 * ```
 */
export const notifyBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
  actionNames: [
    'RateLimitController:call',
    'SnapController:getSnap',
    'SnapInterfaceController:createInterface',
  ],
} as const);

/**
 * Builds the method implementation for `snap_notify`.
 *
 * @param options - The options.
 * @param options.messenger - The messenger.
 * @param options.methodHooks - The RPC method hooks.
 * @param options.methodHooks.isOnPhishingList - A function that checks for links against the phishing list.
 * @param options.methodHooks.maybeUpdatePhishingList - A function that updates the phishing list if needed.
 * @returns The method implementation which returns `null` on success.
 * @throws If the params are invalid.
 */
export function getImplementation({
  methodHooks: { isOnPhishingList, maybeUpdatePhishingList },
  messenger,
}: SpecificationBuilderOptions) {
  return async function implementation(
    args: RestrictedMethodOptions<NotifyParams>,
  ): Promise<NotifyResult> {
    const {
      params,
      context: { origin },
    } = args;

    await maybeUpdatePhishingList();

    const validatedParams = getValidatedParams(
      params,
      isOnPhishingList,
      messenger,
    );

    if (hasProperty(validatedParams, 'content')) {
      const id = await messenger.call(
        'SnapInterfaceController:createInterface',
        origin,
        validatedParams.content as ComponentOrElement,
        undefined,
        ContentType.Notification,
      );
      validatedParams.content = id;
    }

    switch (validatedParams.type) {
      case NotificationType.Native:
        return (await messenger.call(
          'RateLimitController:call',
          origin,
          'showNativeNotification',
          origin,
          validatedParams.message,
        )) as NotifyResult;
      case NotificationType.InApp: {
        const { content, message, title, footerLink } =
          validatedParams as NotificationArgs & {
            content?: string;
            title?: string;
            footerLink?: { href: string; text: string };
          };
        return (await messenger.call(
          'RateLimitController:call',
          origin,
          'showInAppNotification',
          origin,
          {
            interfaceId: content,
            message,
            title,
            footerLink,
          },
        )) as NotifyResult;
      }
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
 * @param isOnPhishingList - The function that checks for links against the phishing list.
 * @param messenger - The messenger.
 * @returns The validated method parameter object.
 * @throws If the params are invalid.
 */
export function getValidatedParams(
  params: unknown,
  isOnPhishingList: NotifyMethodHooks['isOnPhishingList'],
  messenger: Messenger<string, NotifyMessengerActions>,
): NotifyParams {
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

  const isNotString = !message || typeof message !== 'string';
  // Set to the max message length on a Mac notification for now.
  if (
    type === NotificationType.Native &&
    (isNotString || message.length >= 50)
  ) {
    throw rpcErrors.invalidParams({
      message:
        'Must specify a non-empty string "message" less than 50 characters long.',
    });
  }

  if (
    type === NotificationType.InApp &&
    (isNotString || message.length >= 500)
  ) {
    throw rpcErrors.invalidParams({
      message:
        'Must specify a non-empty string "message" less than 500 characters long.',
    });
  }

  try {
    const validatedParams = createUnion(
      params,
      NotificationParametersStruct,
      'type',
    );

    const getSnap = (snapId: string) =>
      messenger.call('SnapController:getSnap', snapId);

    validateTextLinks(validatedParams.message, isOnPhishingList, getSnap);

    if (hasProperty(validatedParams, 'footerLink')) {
      validateLink(validatedParams.footerLink.href, isOnPhishingList, getSnap);
    }

    return validatedParams;
  } catch (error) {
    throw rpcErrors.invalidParams({
      message: `Invalid params: ${getErrorMessage(error)}`,
    });
  }
}
