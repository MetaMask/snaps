import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  SubjectType,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { Json, JsonStruct, NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { MethodHooksObject } from 'src/utils';
import { StructError, create, object, string } from 'superstruct';

const methodName = 'snap_resolveInterface';

export type ResolveInterfaceArgs = {
  id: string;
  value: Json;
};

type ResolveInterface = (
  snapId: string,
  id: string,
  value: Json,
) => Promise<null>;

export type ResolveInterfaceMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param id - The ID of the interface to update.
   * @param value - A JSON-compatible value to resolve the interface with.
   */
  resolveInterface: ResolveInterface;
};

type ResolveInterfaceSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ResolveInterfaceMethodHooks;
};

type ResolveInterfaceSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getResolveInterfaceImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_resolveInterface` permission. `snap_resolveInterface`
 * lets the Snap resolve a UI inteface made of snaps UI components.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification of the `snap_resolveInterface` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ResolveInterfaceSpecificationBuilderOptions,
  ResolveInterfaceSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ResolveInterfaceSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getResolveInterfaceImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<ResolveInterfaceMethodHooks> = {
  resolveInterface: true,
};

export const resolveInterfaceBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const paramsStruct = object({
  id: string(),
  value: JsonStruct,
});

/**
 * Builds the method implementation for `snap_resolveInterface`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.resolveInterface - A function that resolves the specified interface in the
 * MetaMask UI.
 * @returns The method implementation which return nothing.
 */
export function getResolveInterfaceImplementation({
  resolveInterface,
}: ResolveInterfaceMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<ResolveInterfaceArgs>,
  ): Promise<null> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id, value } = validatedParams;

    return await resolveInterface(origin, id, value);
  };
}

/**
 * Validates the resolveInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated resolveInterface method parameter object.
 */
function getValidatedParams(params: unknown): ResolveInterfaceArgs {
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
