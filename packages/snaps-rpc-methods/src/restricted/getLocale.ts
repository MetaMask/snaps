import type {
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type {
  GetLocaleResult,
  GetPreferencesResult,
} from '@metamask/snaps-sdk';
import type { NonEmptyArray } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getLocale';

export type GetLocaleMethodHooks = {
  getPreferences: () => GetPreferencesResult;
};

type SpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetLocaleMethodHooks;
};

type Specification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_getLocale` permission.
 * `snap_getLocale` allows snaps to get the user selected locale.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the permission.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getLocale` permission.
 * @deprecated - To be removed in favor of `snap_getPreferences`.
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

const methodHooks: MethodHooksObject<GetLocaleMethodHooks> = {
  getPreferences: true,
};

/**
 * Get the user's locale setting. You can use this method to localize text in
 * your Snap.
 *
 * Note that this method is deprecated. We recommend using
 * [`snap_getPreferences`](https://docs.metamask.io/snaps/reference/snaps-api/snap_getpreferences)
 * instead, which provides access to the user's locale as well as other
 * preferences.
 */
export const getLocaleBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
} as const);

/**
 * Builds the method implementation for `snap_getLocale`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getPreferences - A function that returns the user selected preferences.
 * @returns The user selected locale.
 */
export function getImplementation({ getPreferences }: GetLocaleMethodHooks) {
  return async function implementation(
    _args: RestrictedMethodOptions<RestrictedMethodParameters>,
  ): Promise<GetLocaleResult> {
    return getPreferences().locale;
  };
}
