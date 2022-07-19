import {
  PermissionSpecificationBuilder,
  PermissionType,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/controllers';
import { TX_INSIGHT_PERMISSION } from './constants';

const permissionName = TX_INSIGHT_PERMISSION;

type LongRunningEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
  endowmentGetter: (_options?: any) => undefined;
  allowedCaveats: null;
}>;

/**
 * `endowment:tx-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the tx confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the tx-insight endowment.
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

export const txInsightEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
