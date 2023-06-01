import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  SubjectType,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { Component, ComponentStruct } from '@metamask/snaps-ui';
import { NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { MethodHooksObject } from 'src/utils';
import { StructError, create, object, string } from 'superstruct';

const methodName = 'snap_updateInterface';

export type UpdateInterfaceArgs = {
  id: string;
  ui: Component;
};

type UpdateInterface = (
  snapId: string,
  id: string,
  ui: Component,
) => Promise<null>;

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

const paramsStruct = object({
  id: string(),
  ui: ComponentStruct,
});

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
  return async function implementation(
    args: RestrictedMethodOptions<UpdateInterfaceArgs>,
  ): Promise<null> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id, ui } = validatedParams;

    return await updateInterface(origin, id, ui);
  };
}

/**
 * Validates the updateInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated updateInterface method parameter object.
 */
function getValidatedParams(params: unknown): UpdateInterfaceArgs {
  try {
    return create(params, paramsStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw ethErrors.rpc.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }
    /* istanbul ignore next */
    throw ethErrors.rpc.internal();
  }
}
