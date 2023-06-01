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
import { StructError, create, object } from 'superstruct';

const methodName = 'snap_showInterface';

export type ShowInterfaceArgs = {
  ui: Component;
};

type ShowInterface = (snapId: string, ui: Component) => Promise<string>;

export type ShowInterfaceMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param ui - The UI components.
   * @returns The unique identifier of the interface.
   */
  showInterface: ShowInterface;
};

type ShowInterfaceSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ShowInterfaceMethodHooks;
};

type ShowInterfaceSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getShowInterfaceImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_showInterface` permission. `snap_showInterface`
 * lets the Snap display a UI inteface made of snaps UI components.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_dialog` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ShowInterfaceSpecificationBuilderOptions,
  ShowInterfaceSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ShowInterfaceSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getShowInterfaceImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<ShowInterfaceMethodHooks> = {
  showInterface: true,
};

export const showInterfaceBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const paramsStruct = object({
  ui: ComponentStruct,
});

/**
 * Builds the method implementation for `snap_showInterface`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.showInterface - A function that shows the specified interface in the
 * MetaMask UI and returns the identifier for the interface.
 * @returns The identifier of the interface.
 */
export function getShowInterfaceImplementation({
  showInterface,
}: ShowInterfaceMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<ShowInterfaceArgs>,
  ): Promise<string> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { ui } = validatedParams;

    return await showInterface(origin, ui);
  };
}

/**
 * Validates the showInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated showInterface method parameter object.
 */
function getValidatedParams(params: unknown): ShowInterfaceArgs {
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
