import type {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.EthereumProvider;

type EthereumProviderEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: any) => ['ethereum'];
  allowedCaveats: null;
}>;

/**
 * `endowment:ethereum-provider` returns the name of the ethereum global browser API.
 * This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
 *
 * This populates the global scope with an EIP-1193 provider, which DOES NOT implement all legacy functionality exposed to dapps.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  EthereumProviderEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => {
      return ['ethereum'];
    },
    subjectTypes: [SubjectType.Snap],
  };
};

export const ethereumProviderEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
