import type {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.MultichainProvider;

type MultichainProviderEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: null;
}>;

/**
 * `endowment:multichain-provider` returns nothing; it is intended to be used as a
 * flag by the Snaps Platform to detect whether a Snap has the capability to
 * use the multichain API.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  MultichainProviderEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    subjectTypes: [SubjectType.Snap],
  };
};

export const multichainProviderEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
