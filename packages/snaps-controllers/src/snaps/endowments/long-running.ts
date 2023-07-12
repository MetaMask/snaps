import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.LongRunning;

type LongRunningEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => undefined;
  allowedCaveats: null;
}>;

/**
 * `endowment:long-running` returns nothing; it is intended to be used as a flag
 * by the `SnapController` to make it ignore the request processing timeout
 * during snap lifecycle management. Essentially, it allows a snap to take an
 * infinite amount of time to process a request.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the long-running endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  LongRunningEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const longRunningEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
