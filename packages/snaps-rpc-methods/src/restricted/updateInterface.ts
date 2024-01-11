import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Component, UpdateInterfaceParams } from '@metamask/snaps-sdk';
import { ComponentStruct } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { StructError, create, object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_updateInterface';

type UpdateInterface = (snapId: string, id: string, ui: Component) => null;

export type UpdateInterfaceMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param id - The ID of the interface to update.
   * @param ui - The UI components.
   */
  updateInterface: UpdateInterface;
};

type UpdateInterfaceSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: UpdateInterfaceMethodHooks;
};

type UpdateInterfaceSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getUpdateInterfaceImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_updateInterface` permission. `snap_updateInterface`
 * lets the Snap update a UI inteface made of snaps UI components.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification of the `snap_updateInterface` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  UpdateInterfaceSpecificationBuilderOptions,
  UpdateInterfaceSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: UpdateInterfaceSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getUpdateInterfaceImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<UpdateInterfaceMethodHooks> = {
  updateInterface: true,
};

export const updateInterfaceBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const UpdateInterfaceParametersStruct = object({
  id: string(),
  ui: ComponentStruct,
});

export type UpdateInterfaceParameters = InferMatching<
  typeof UpdateInterfaceParametersStruct,
  UpdateInterfaceParams
>;

/**
 * Builds the method implementation for `snap_updateInterface`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.updateInterface - A function that updates the specified interface in the
 * MetaMask UI.
 * @returns The method implementation which return nothing.
 */
export function getUpdateInterfaceImplementation({
  updateInterface,
}: UpdateInterfaceMethodHooks) {
  return function implementation(
    args: RestrictedMethodOptions<UpdateInterfaceParameters>,
  ): null {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id, ui } = validatedParams;

    updateInterface(origin, id, ui);

    return null;
  };
}

/**
 * Validates the updateInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated updateInterface method parameter object.
 */
function getValidatedParams(params: unknown): UpdateInterfaceParameters {
  try {
    return create(params, UpdateInterfaceParametersStruct);
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
