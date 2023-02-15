import {
  EndowmentGetterParams,
  PermissionSpecificationBuilder,
  PermissionType,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.WebHID;

type WebHIDEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.WebHID;
  targetKey: typeof permissionName;
  endowmentGetter: (_options?: any) => ['navigator'];
  allowedCaveats: null;
}>;

/**
 * `endowment:webhid` returns the name of global browser API(s) that
 * enable the usage of navigator.webhid. This enables the connection of devices that uses webhid such as Ledger.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the webhid endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  WebHIDEndowmentSpecification
> = (_builderOptions?: any) => {
  return {
    permissionType: PermissionType.Endowment,
    targetKey: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => {
      return ['navigator'];
    },
  };
};

export const webhidEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
