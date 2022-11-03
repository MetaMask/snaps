import {
  PermissionSpecificationBuilder,
  PermissionType,
  EndowmentGetterParams,
  ValidPermissionSpecification,
  PermissionValidatorConstraint,
  PermissionConstraint,
  CaveatSpecificationConstraint,
  Caveat,
} from '@metamask/controllers';
import {
  assert,
  hasProperty,
  isObject,
  isPlainObject,
  Json,
  NonEmptyArray,
} from '@metamask/utils';
import { SnapCaveatType } from '@metamask/snap-utils';
import { ethErrors } from 'eth-rpc-errors';
import { SnapEndowments } from './enum';

const permissionName = SnapEndowments.TransactionInsight;

type TransactionInsightEndowmentSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.Endowment;
  targetKey: typeof permissionName;
  endowmentGetter: (_options?: EndowmentGetterParams) => undefined;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
  validator: PermissionValidatorConstraint;
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
  TransactionInsightEndowmentSpecification
> = (_builderOptions?: unknown) => {
  return {
    permissionType: PermissionType.Endowment,
    targetKey: permissionName,
    allowedCaveats: [SnapCaveatType.SnapTransactionInsight],
    endowmentGetter: (_getterOptions?: EndowmentGetterParams) => undefined,
    validator: ({ caveats }) => {
      if (
        caveats !== null &&
        (caveats?.length > 1 ||
          caveats[0].type !== SnapCaveatType.SnapTransactionInsight)
      ) {
        throw ethErrors.rpc.invalidParams({
          message: `Expected a single "${SnapCaveatType.SnapTransactionInsight}" caveat.`,
        });
      }
    },
  };
};

export const transactionInsightEndowmentBuilder = Object.freeze({
  targetKey: permissionName,
  specificationBuilder,
} as const);

/**
 * Validates the type of the caveat value.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveat(caveat: Caveat<string, any>): void {
  if (!hasProperty(caveat, 'value') || !isPlainObject(caveat.value)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  const { value } = caveat;

  if (!hasProperty(value, 'allowTransactionOrigin')) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected a plain object.',
    });
  }

  assert(
    typeof value.allowTransactionOrigin === 'boolean',
    'Expected allowTransactionOrigin to have type "boolean"',
  );
}

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function getTransactionInsightCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  if (!value || (isObject(value) && Object.keys(value).length === 0)) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapTransactionInsight,
        value,
      },
    ],
  };
}

export type TransactionInsightCaveat = {
  allowTransactionOrigin?: boolean;
};

/**
 * Getter function to get the keyring namespaces from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The keyring namespaces, or `null` if the permission does not have a
 * keyring caveat.
 */
export function getTransactionInsightCaveat(
  permission?: PermissionConstraint,
): TransactionInsightCaveat | null {
  if (!permission?.caveats) {
    return null;
  }

  assert(permission.caveats.length === 1);
  assert(permission.caveats[0].type === SnapCaveatType.SnapTransactionInsight);

  const caveat = permission.caveats[0] as Caveat<
    string,
    TransactionInsightCaveat
  >;

  return caveat.value ?? null;
}

export const transactionInsightCaveatSpecifications: Record<
  SnapCaveatType.SnapTransactionInsight,
  CaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapTransactionInsight]: Object.freeze({
    type: SnapCaveatType.SnapTransactionInsight,
    validator: (caveat: Caveat<string, any>) => validateCaveat(caveat),
  }),
};
