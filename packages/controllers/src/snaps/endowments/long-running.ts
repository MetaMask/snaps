import {
  PermissionSpecificationBuilder,
  PermissionType,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.longRunning;

type LongRunningEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
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
    targetKey: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
  };
};

export const longRunningEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
