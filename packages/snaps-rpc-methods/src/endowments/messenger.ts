import type {
  Caveat,
  CaveatSpecificationConstraint,
  EndowmentGetterParams,
  PermissionConstraint,
  PermissionSpecificationBuilder,
  PermissionValidatorConstraint,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { MessengerActionsStruct } from '@metamask/snaps-utils';
import { MessengerScopesStruct, SnapCaveatType } from '@metamask/snaps-utils';
import type { Infer } from '@metamask/superstruct';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assertStruct, hasProperty, isObject } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Messenger;

type MessengerEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  subjectTypes: readonly SubjectType[];
}>;

/**
 * `endowment:messenger` returns nothing; it is intended to be used as a
 * flag by the Snaps Platform to detect whether a Snap has the capability to
 * use the messenger API.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the messenger endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  MessengerEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [SnapCaveatType.MessengerScopes],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.MessengerScopes },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const messengerEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getMessengerCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  if (!value || !isObject(value) || Object.keys(value).length === 0) {
    return { caveats: null };
  }

  return {
    caveats: [
      {
        type: SnapCaveatType.MessengerScopes,
        value,
      },
    ],
  };
}

export type MessengerActions = Infer<typeof MessengerActionsStruct>;

/**
 * Getter function to get the {@link MessengerActions} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 */
export function getMessengerCaveatActions(
  permission?: PermissionConstraint,
): MessengerActions | null {
  const caveat = permission?.caveats?.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.MessengerScopes,
  ) as Caveat<string, { actions?: MessengerActions }> | undefined;

  return caveat?.value.actions ? caveat.value.actions : null;
}

/**
 * Validates the type of the caveat value.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveat(caveat: Caveat<string, any>): void {
  if (!hasProperty(caveat, 'value') || !isObject(caveat)) {
    throw rpcErrors.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;
  assertStruct(
    value,
    MessengerScopesStruct,
    'Invalid messenger scopes specified',
    rpcErrors.invalidParams,
  );
}

export const messengerCaveatSpecifications: Record<
  SnapCaveatType.MessengerScopes,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.MessengerScopes]: Object.freeze({
    type: SnapCaveatType.MessengerScopes,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
};
