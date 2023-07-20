import type {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.ExtendRuntime;

type ExtendRuntimeEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => ['extendRuntime'];
  allowedCaveats: null;
}>;

/**
 * `endowment:extend-runtime` returns the name of extendRuntime endowment that
 * enables execution of a long-running tasks inside a snap.
 * This is intended to populate the endowments of the SES Compartment
 * in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the extend-runtime endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  ExtendRuntimeEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => {
      return ['extendRuntime'];
    },
    subjectTypes: [SubjectType.Snap],
  };
};

export const extendRuntimeEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
