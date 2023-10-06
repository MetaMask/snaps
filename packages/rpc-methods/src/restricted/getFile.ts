import type {
  PermissionSpecificationBuilder,
  RestrictedMethodOptions,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';
import { assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import type { Infer } from 'superstruct';
import { object, string } from 'superstruct';

import type { MethodHooksObject } from '../utils';

const targetName = 'snap_getFile';

type GetFileSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetFileHooks;
};

type GetFileSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof targetName;
  methodImplementation: ReturnType<typeof getImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

export const GetFileArgsStruct = object({
  path: string(),
});

export type GetFileArgs = Infer<typeof GetFileArgsStruct>;

export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetFileSpecificationBuilderOptions,
  GetFileSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetFileSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetFileHooks> = {
  getSnapFile: true,
};

export const getFileBuilder = Object.freeze({
  targetName,
  specificationBuilder,
  methodHooks,
} as const);

export type GetFileHooks = {
  getSnapFile: (path: string) => Promise<Uint8Array>;
};

/**
 * Builds the method implementation for `snap_getFile`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getSnapFile - The method to load a static snap file.
 * @returns The method implementation.
 */
export function getImplementation({ getSnapFile }: GetFileHooks) {
  return async function getFile(
    options: RestrictedMethodOptions<GetFileArgs>,
  ): Promise<Uint8Array> {
    const { params } = options;

    assertStruct(
      params,
      GetFileArgsStruct,
      'Invalid "snap_getFile" parameters',
      ethErrors.rpc.invalidParams,
    );

    return getSnapFile(params.path);
  };
}
