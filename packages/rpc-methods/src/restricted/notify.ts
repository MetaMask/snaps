import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/snap-controllers';
import { NonEmptyArray } from '@metamask/snap-controllers/src/utils';
import { ethErrors } from 'eth-rpc-errors';
import { isPlainObject } from '../utils';

const methodName = 'snap_notify';

export enum NotificationType {
  native = 'native',
}

type NotificationArgs = {
  /**
   * @todo
   */
  type: NotificationType;

  /**
   * @todo
   */
  message: string;
};

export type NotifyMethodHooks = {
  // @todo Figure out if some of this exists already in the extension
  /**
   * @param snapId - The ID of the Snap that created the confirmation.
   * @param args - The notification arguments.
   */
  showNotification: (snapId: string, args: NotificationArgs) => Promise<void>;
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
    showNotification: true,
  },
} as const);

function getImplementation({ showNotification }: NotifyMethodHooks) {
  return async function confirmImplementation(
    args: RestrictedMethodOptions<[NotificationArgs]>,
  ): Promise<void> {
    const {
      params,
      context: { origin },
    } = args;

    return await showNotification(origin, getValidatedParams(params));
  };
}

/**
 * Validates the confirm method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated confirm method parameter object.
 */
function getValidatedParams(params: unknown): NotificationArgs {
  if (!Array.isArray(params) || !isPlainObject(params[0])) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected array params with single object.',
    });
  }

  const { prompt, description } = params[0];

  if (!prompt || typeof prompt !== 'string' || prompt.length > 40) {
    throw ethErrors.rpc.invalidParams({
      message:
        'Must specify a non-empty string "prompt" less than 40 characters long.',
    });
  }

  if (
    description &&
    (typeof description !== 'string' || description.length > 140)
  ) {
    throw ethErrors.rpc.invalidParams({
      message:
        '"description" must be a string no more than 140 characters long if specified.',
    });
  }

  return params[0] as NotificationArgs;
}
