import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import {
  Json,
  NonEmptyArray,
  isObject,
  validateJsonAndGetSize,
} from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

const methodName = 'snap_manageState';

export type ManageStateMethodHooks = {
  /**
   * A function that clears the state of the requesting Snap.
   */
  clearSnapState: (snapId: string) => Promise<void>;

  /**
   * A function that gets the state of the requesting Snap.
   *
   * @returns The current state of the Snap.
   */
  getSnapState: (snapId: string) => Promise<Record<string, Json>>;

  /**
   * A function that updates the state of the requesting Snap.
   *
   * @param newState - The new state of the Snap.
   */
  updateSnapState: (
    snapId: string,
    newState: Record<string, Json>,
  ) => Promise<void>;
};

type ManageStateSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ManageStateMethodHooks;
};

type ManageStateSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetKey: typeof methodName;
  methodImplementation: ReturnType<typeof getManageStateImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_manageState` permission.
 * `snap_manageState` lets the Snap store and manage some of its state on
 * your device.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_manageState` permission.
 */
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ManageStateSpecificationBuilderOptions,
  ManageStateSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ManageStateSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetKey: methodName,
    allowedCaveats,
    methodImplementation: getManageStateImplementation(methodHooks),
  };
};

export const manageStateBuilder = Object.freeze({
  targetKey: methodName,
  specificationBuilder,
  methodHooks: {
    clearSnapState: true,
    getSnapState: true,
    updateSnapState: true,
  },
} as const);

export enum ManageStateOperation {
  ClearState = 'clear',
  GetState = 'get',
  UpdateState = 'update',
}

export type ManageStateArgs = {
  operation: ManageStateOperation;
  newState?: Record<string, Json>;
};

export const STORAGE_SIZE_LIMIT = 104857600; // In bytes (100MB)

/**
 * Builds the method implementation for `snap_manageState`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.clearSnapState - A function that clears the state stored for a snap.
 * @param hooks.getSnapState - A function that fetches the persisted decrypted state for a snap.
 * @param hooks.updateSnapState - A function that updates the state stored for a snap.
 * @returns The method implementation which either returns `null` for a successful state update/deletion or returns the decrypted state.
 * @throws If the params are invalid.
 */
export function getManageStateImplementation({
  clearSnapState,
  getSnapState,
  updateSnapState,
}: ManageStateMethodHooks) {
  return async function manageState(
    options: RestrictedMethodOptions<ManageStateArgs>,
  ): Promise<null | Record<string, Json>> {
    const {
      params = {},
      method,
      context: { origin },
    } = options;
    const { operation, newState } = getValidatedParams(params, method);

    switch (operation) {
      case ManageStateOperation.ClearState:
        await clearSnapState(origin);
        return null;

      case ManageStateOperation.GetState:
        return await getSnapState(origin);

      case ManageStateOperation.UpdateState: {
        await updateSnapState(origin, newState as Record<string, Json>);
        return null;
      }
      default:
        throw ethErrors.rpc.invalidParams(
          `Invalid ${method} operation: "${operation as string}"`,
        );
    }
  };
}

/**
 * Validates the manageState method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @param method - RPC method name used for debugging errors.
 * @param storageSizeLimit - Maximum allowed size (in bytes) of a new state object.
 * @returns The validated method parameter object.
 */
export function getValidatedParams(
  params: unknown,
  method: string,
  storageSizeLimit = STORAGE_SIZE_LIMIT,
): ManageStateArgs {
  if (!isObject(params)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { operation, newState } = params;

  if (
    !operation ||
    typeof operation !== 'string' ||
    !(Object.values(ManageStateOperation) as string[]).includes(operation)
  ) {
    throw ethErrors.rpc.invalidParams({
      message: 'Must specify a valid manage state "operation".',
    });
  }

  if (operation === ManageStateOperation.UpdateState) {
    if (!isObject(newState)) {
      throw ethErrors.rpc.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
        data: {
          receivedNewState:
            typeof newState === 'undefined' ? 'undefined' : newState,
        },
      });
    }
    const [isValid, plainTextSizeInBytes] = validateJsonAndGetSize(newState);
    if (!isValid) {
      throw ethErrors.rpc.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
        data: {
          receivedNewState:
            typeof newState === 'undefined' ? 'undefined' : newState,
        },
      });
    } else if (plainTextSizeInBytes > storageSizeLimit) {
      throw ethErrors.rpc.invalidParams({
        message: `Invalid ${method} "updateState" parameter: The new state must not exceed ${storageSizeLimit} bytes in size.`,
        data: {
          receivedNewState:
            typeof newState === 'undefined' ? 'undefined' : newState,
        },
      });
    }
  }

  return params as ManageStateArgs;
}
