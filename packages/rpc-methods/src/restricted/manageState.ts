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
const specificationBuilder: PermissionSpecificationBuilder<
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
  clearState = 'clear',
  getState = 'get',
  updateState = 'update',
}

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
function getManageStateImplementation({
  clearSnapState,
  getSnapState,
  updateSnapState,
}: ManageStateMethodHooks) {
  return async function manageState(
    options: RestrictedMethodOptions<
      [ManageStateOperation, Record<string, Json>]
    >,
  ): Promise<null | Record<string, Json>> {
    const {
      params = [],
      method,
      context: { origin },
    } = options;
    const [operation, newState] = params;

    switch (operation) {
      case ManageStateOperation.clearState:
        await clearSnapState(origin);
        return null;

      case ManageStateOperation.getState:
        return await getSnapState(origin);

      case ManageStateOperation.updateState: {
        if (!isObject(newState)) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
            data: {
              receivedNewState:
                typeof newState === 'undefined' ? 'undefined' : newState,
            },
          });
        }
        const [isValid, plainTextSizeInBytes] =
          validateJsonAndGetSize(newState);
        if (!isValid) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
            data: {
              receivedNewState:
                typeof newState === 'undefined' ? 'undefined' : newState,
            },
          });
        } else if (plainTextSizeInBytes > STORAGE_SIZE_LIMIT) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid ${method} "updateState" parameter: The new state must not exceed ${STORAGE_SIZE_LIMIT} bytes in size.`,
            data: {
              receivedNewState:
                typeof newState === 'undefined' ? 'undefined' : newState,
            },
          });
        }

        await updateSnapState(origin, newState);
        return null;
      }
      default:
        throw ethErrors.rpc.invalidParams(
          `Invalid ${method} operation: "${operation}"`,
        );
    }
  };
}
