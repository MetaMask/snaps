import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.LifecycleHooks;

type LifecycleHooksEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:lifecycle-hooks` returns nothing; it is intended to be used as a
 * flag by the snap controller to detect whether the snap has the capability to
 * use lifecycle hooks.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the `lifecycle-hooks` endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  LifecycleHooksEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const lifecycleHooksEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
