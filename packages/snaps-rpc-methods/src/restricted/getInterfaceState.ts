import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { InterfaceState } from '@metamask/snaps-sdk';
import type { NonEmptyArray } from '@metamask/utils';
import { StructError, create, object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getInterfaceState';

export type GetInterfaceStateArgs = {
  id: string;
};

type GetInterfaceState = (snapId: string, id: string) => InterfaceState;

export type GetInterfaceStateMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param id - The interface ID.
   * @returns The state of the interface.
   */
  getInterfaceState: GetInterfaceState;
};

type GetInterfaceStateSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetInterfaceStateMethodHooks;
};

type GetInterfaceStateSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getGetInterfaceStateImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_getInterfaceState` permission. `snap_getInterfaceState`
 * lets the Snap get the state of an interface.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_getInterfaceState` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetInterfaceStateSpecificationBuilderOptions,
  GetInterfaceStateSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetInterfaceStateSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getGetInterfaceStateImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetInterfaceStateMethodHooks> = {
  getInterfaceState: true,
};

export const getInterfaceStateBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const paramsStruct = object({
  id: string(),
});

/**
 * Builds the method implementation for `snap_getInterfaceState`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getInterfaceState - A function that gets the state of the requested interface.
 * @returns The state of the interface.
 */
export function getGetInterfaceStateImplementation({
  getInterfaceState,
}: GetInterfaceStateMethodHooks) {
  return function implementation(
    args: RestrictedMethodOptions<GetInterfaceStateArgs>,
  ): InterfaceState {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    return getInterfaceState(origin, id);
  };
}

/**
 * Validates the getInterfaceState method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getInterfaceState method parameter object.
 */
function getValidatedParams(params: unknown): GetInterfaceStateArgs {
  try {
    return create(params, paramsStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }
    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}
