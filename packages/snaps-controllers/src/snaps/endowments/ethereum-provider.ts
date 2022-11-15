import {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionType,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.EthereumProvider;

type EthereumProviderEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
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
    targetKey: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => {
      return ['ethereum'];
    },
  };
};

export const ethereumProviderEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
