import {
  PermissionSpecificationBuilder,
  PermissionType,
  EndowmentGetterParams,
  ValidPermissionSpecification,
  SubjectType,
} from '@metamask/permission-controller';
import { NonEmptyArray } from '@metamask/utils';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.UserInput;

type UserInputEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:transaction-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the transaction confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the transaction-insight endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  UserInputEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const userInputEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
