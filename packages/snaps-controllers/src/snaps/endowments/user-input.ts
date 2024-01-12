import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from '@metamask/snaps-utils';
import type { NonEmptyArray } from '@metamask/utils';

const permissionName = SnapEndowments.UserInput;

type UserInputEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:user-input` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to handle user inputs.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the user-input endowment.
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
