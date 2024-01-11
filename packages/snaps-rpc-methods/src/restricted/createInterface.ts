import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Component, CreateInterfaceParams } from '@metamask/snaps-sdk';
import { ComponentStruct } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';
import { StructError, create, object } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_createInterface';

type CreateInterface = (snapId: string, ui: Component) => string;

export type CreateInterfaceMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param ui - The UI components.
   * @returns The unique identifier of the interface.
   */
  createInterface: CreateInterface;
};

type CreateInterfaceSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: CreateInterfaceMethodHooks;
};

type CreateInterfaceSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getCreateInterfaceImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_createInterface` permission. `snap_createInterface`
 * lets the Snap create a UI interface made of snaps UI components.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_createInterface` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  CreateInterfaceSpecificationBuilderOptions,
  CreateInterfaceSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: CreateInterfaceSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getCreateInterfaceImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<CreateInterfaceMethodHooks> = {
  createInterface: true,
};

export const createInterfaceBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const CreateInterfaceParametersStruct = object({
  ui: ComponentStruct,
});

export type CreateInterfaceParameters = InferMatching<
  typeof CreateInterfaceParametersStruct,
  CreateInterfaceParams
>;

/**
 * Builds the method implementation for `snap_createInterface`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.createInterface - A function that creates the specified interface in the
 * Interface controller and returns the identifier for the interface.
 * @returns The identifier of the interface.
 */
export function getCreateInterfaceImplementation({
  createInterface,
}: CreateInterfaceMethodHooks) {
  return function implementation(
    args: RestrictedMethodOptions<CreateInterfaceParameters>,
  ): string {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { ui } = validatedParams;

    return createInterface(origin, ui);
  };
}

/**
 * Validates the createInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated createInterface method parameter object.
 */
function getValidatedParams(params: unknown): CreateInterfaceParameters {
  try {
    return create(params, CreateInterfaceParametersStruct);
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
