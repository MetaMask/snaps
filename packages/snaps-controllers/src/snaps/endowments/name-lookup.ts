import {
  EndowmentGetterParams,
  PermissionType,
  PermissionSpecificationBuilder,
  ValidPermissionSpecification,
  SubjectType,
} from '@metamask/permission-controller';
import { NonEmptyArray } from '@metamask/utils';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.NameLookup;

type NameLookupEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:name-lookup` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to resolve content entered into the send screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the name-lookup endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  NameLookupEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetKey: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const nameLookupEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);
