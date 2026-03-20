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
import type {
  KeyringCapabilities,
  KeyringOrigins,
} from '@metamask/snaps-utils';
import {
  assertIsKeyringCapabilities,
  assertIsKeyringOrigins,
  SnapCaveatType,
} from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import { assert, hasProperty, isPlainObject } from '@metamask/utils';

import { createGenericPermissionValidator } from './caveats';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.Keyring;

type KeyringEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetName: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => null;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
  subjectTypes: readonly SubjectType[];
}>;

/**
 * `endowment:keyring` returns nothing; it is intended to be used as a flag
 * by the client to detect whether the snap has keyring capabilities.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the keyring endowment.
 */
const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.Endowment,
  any,
  KeyringEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetName: permissionName,
    allowedCaveats: [
      SnapCaveatType.KeyringOrigin,
      SnapCaveatType.KeyringCapabilities,
      SnapCaveatType.MaxRequestTime,
    ],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => null,
    validator: createGenericPermissionValidator([
      { type: SnapCaveatType.KeyringOrigin },
      { type: SnapCaveatType.KeyringCapabilities, optional: true },
      { type: SnapCaveatType.MaxRequestTime, optional: true },
    ]),
    subjectTypes: [SubjectType.Snap],
  };
};

export const keyringEndowmentBuilder = Object.freeze({
  targetName: permissionName,
  specificationBuilder,
} as const);

/**
 * Validate the value of a keyring origins caveat. This does not validate the
 * type of the caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveatOrigins(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: 'Invalid keyring origins: Expected a plain object.',
    });
  }

  const { value } = caveat;
  assertIsKeyringOrigins(value, rpcErrors.invalidParams);
}

/**
 * Validate the value of a keyring capabilities caveat. This does not validate
 * the type of the caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveatCapabilities(caveat: Caveat<string, any>) {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw rpcErrors.invalidParams({
      message: 'Invalid keyring capabilities: Expected a plain object.',
    });
  }

  const { value } = caveat;
  assertIsKeyringCapabilities(value, rpcErrors.invalidParams);
}

/**
 * Expected shape of the keyring endowment value from `initialPermissions`.
 * The mapper assumes this shape for typing only; it does not validate.
 * Invalid data is rejected when the permission is requested (see validator).
 */
type KeyringCaveatMapperInput = KeyringOrigins & {
  capabilities?: KeyringCapabilities;
};

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * This function only maps: it does not validate. The permission validator
 * runs when the permission is requested and will reject invalid caveats.
 * We assume the manifest supplies a KeyringCaveatMapperInput-shaped value;
 * the public signature accepts Json to satisfy CaveatMapperFunction.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getKeyringCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  const input = value as KeyringCaveatMapperInput;
  const caveats: PermissionConstraint['caveats'] = [
    {
      type: SnapCaveatType.KeyringOrigin,
      value: { allowedOrigins: input.allowedOrigins } as Json,
    },
  ];

  if (hasProperty(input, 'capabilities')) {
    caveats.push({
      type: SnapCaveatType.KeyringCapabilities,
      value: { capabilities: input.capabilities } as Json,
    });
  }

  return { caveats };
}

/**
 * Getter function to get the {@link KeyringOrigins} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value.
 * @throws If the permission does not have a valid {@link KeyringOrigins}
 * caveat.
 */
export function getKeyringCaveatOrigins(
  permission?: PermissionConstraint,
): KeyringOrigins {
  const caveat = permission?.caveats?.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.KeyringOrigin,
  ) as Caveat<string, KeyringOrigins> | undefined;

  assert(caveat);
  return caveat.value;
}

/**
 * Getter function to get the {@link KeyringCapabilities} caveat value from a
 * permission.
 *
 * @param permission - The permission to get the caveat value from.
 * @returns The caveat value, or `null` if the permission does not have a
 * {@link KeyringCapabilities} caveat.
 */
export function getKeyringCaveatCapabilities(
  permission?: PermissionConstraint,
): KeyringCapabilities | null {
  const caveat = permission?.caveats?.find(
    (permCaveat) => permCaveat.type === SnapCaveatType.KeyringCapabilities,
  ) as Caveat<string, KeyringCapabilities> | undefined;

  return caveat?.value ?? null;
}

export const keyringCaveatSpecifications: Record<
  SnapCaveatType.KeyringOrigin | SnapCaveatType.KeyringCapabilities,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.KeyringOrigin]: Object.freeze({
    type: SnapCaveatType.KeyringOrigin,
    validator: (caveat: Caveat<string, any>) => validateCaveatOrigins(caveat),
  }),
  [SnapCaveatType.KeyringCapabilities]: Object.freeze({
    type: SnapCaveatType.KeyringCapabilities,
    validator: (caveat: Caveat<string, any>) =>
      validateCaveatCapabilities(caveat),
  }),
};
