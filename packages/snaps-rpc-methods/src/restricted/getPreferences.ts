import type {
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { GetPreferencesResult } from '@metamask/snaps-sdk';
import type { NonEmptyArray } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getPreferences';

export type GetPreferencesMethodHooks = {
  getPreferences: () => GetPreferencesResult;
};

type SpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetPreferencesMethodHooks;
};

type Specification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_getPreferences` permission.
 * `snap_getPreferences` allows snaps to access user preferences.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getPreferences` permission.
 */
export const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  SpecificationBuilderOptions,
  Specification
> = ({ allowedCaveats = null, methodHooks }: SpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetPreferencesMethodHooks> = {
  getPreferences: true,
};

/**
 * Gets the user's preferences.
 */
export const getPreferencesBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_getPreferences`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getPreferences - A function that returns the user selected preferences.
 * @returns The user preferences.
 */
export function getImplementation({
  getPreferences,
}: GetPreferencesMethodHooks) {
  return async function implementation(
    _args: RestrictedMethodOptions<RestrictedMethodParameters>,
  ): Promise<GetPreferencesResult> {
    return getPreferences();
  };
}
