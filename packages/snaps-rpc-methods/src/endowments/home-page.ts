import type {
  PermissionSpecificationBuilder,
  EndowmentGetterParams,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import type { NonEmptyArray } from '@metamask/utils';

import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.HomePage;

type HomePageEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * `endowment:page-home` returns nothing; it is intended to be used as a
 * flag by the snap controller to detect whether the snap has the capability to
 * use the snap home page feature.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the `snap-pages` endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  HomePageEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: null,
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    subjectTypes: [SubjectType.Snap],
  };
};

export const homePageEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);
