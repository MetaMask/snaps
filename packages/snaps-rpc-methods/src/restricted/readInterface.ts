import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Json, NonEmptyArray } from '@metamask/utils';
import type { MethodHooksObject } from 'src/utils';
import { StructError, create, object, string } from 'superstruct';

const methodName = 'snap_readInterface';

export type ReadInterfaceArgs = {
  id: string;
};

type ReadInterface = (snapId: string, id: string) => Promise<Json>;

export type ReadInterfaceMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param id - The ID of the interface to update.
   * @returns The resolved value.
   */
  readInterface: ReadInterface;
};

type ReadInterfaceSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: ReadInterfaceMethodHooks;
};

type ReadInterfaceSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getReadInterfaceImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_readInterface` permission. `snap_readInterface`
 * lets the Snap read the resolved values of an UI interface.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification of the `snap_readInterface` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  ReadInterfaceSpecificationBuilderOptions,
  ReadInterfaceSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: ReadInterfaceSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getReadInterfaceImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<ReadInterfaceMethodHooks> = {
  readInterface: true,
};

export const readInterfaceBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const paramsStruct = object({
  id: string(),
});

/**
 * Builds the method implementation for `snap_readInterface`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.readInterface - A function that resolves the specified interface in the
 * MetaMask UI.
 * @returns The method implementation which return nothing.
 */
export function getReadInterfaceImplementation({
  readInterface,
}: ReadInterfaceMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<ReadInterfaceArgs>,
  ): Promise<Json> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    return await readInterface(origin, id);
  };
}

/**
 * Validates the readInterface method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated readInterface method parameter object.
 */
function getValidatedParams(params: unknown): ReadInterfaceArgs {
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
