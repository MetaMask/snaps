import {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionType,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.WebAssemblyAccess;

type WebAssemblyEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
  endowmentGetter: (_options?: any) => ['WebAssembly'];
  allowedCaveats: null;
}>;

/**
 * `endowment:webassembly` returns the name of global browser API(s) that
 * enable access to the WebAssembly API.
 * This is intended to populate the endowments of the SES Compartment
 * in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the WebAssembly endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  WebAssemblyEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetKey: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => {
      return ['WebAssembly'];
    },
  };
};

export const webAssemblyEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
