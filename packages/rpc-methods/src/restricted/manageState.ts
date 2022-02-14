import { Json } from 'json-rpc-engine';
import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
  isValidJson,
  NonEmptyArray,
} from '@metamask/snap-controllers';
import { ethErrors } from 'eth-rpc-errors';
import { isPlainObject } from '../utils';

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
 * `snap_manageState` let's the Snap store and manage some of its state on
 * your device.
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

      case ManageStateOperation.updateState:
        if (!isPlainObject(newState)) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid ${method} "updateState" parameter: The new state must be a plain object.`,
            data: {
              receivedNewState:
                typeof newState === 'undefined' ? 'undefined' : newState,
            },
          });
        } else if (!isValidJson(newState)) {
          throw ethErrors.rpc.invalidParams({
            message: `Invalid ${method} "updateState" parameter: The new state must be JSON serializable.`,
            data: {
              receivedNewState:
                typeof newState === 'undefined' ? 'undefined' : newState,
            },
          });
        }

        await updateSnapState(origin, newState);
        return null;

      default:
        throw ethErrors.rpc.invalidParams(
          `Invalid ${method} operation: "${operation}"`,
        );
    }
  };
}
