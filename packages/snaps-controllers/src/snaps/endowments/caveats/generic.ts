import type {
  PermissionConstraint,
  PermissionValidatorConstraint,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { Json } from '@metamask/utils';

export type CaveatMapperReturnValue = Pick<PermissionConstraint, 'caveats'>;

export type CaveatMapperFunction = (value: Json) => CaveatMapperReturnValue;

/**
 * Create a generic permission validator that validates the presence of certain caveats.
 *
 * This validator only validates the types of the caveats, not the values.
 *
 * @param caveatsToValidate - A list of objects that represent caveats.
 * @param caveatsToValidate.type - The string defining the caveat type.
 * @param caveatsToValidate.optional - An optional boolean flag that defines
 * whether the caveat is optional or not.
 * @returns A function that validates a permission.
 */
export function createGenericPermissionValidator(
  caveatsToValidate: {
    type: string;
    optional?: boolean;
  }[],
): PermissionValidatorConstraint {
  const validCaveatTypes = new Set(
    caveatsToValidate.map((caveat) => caveat.type),
  );
  const requiredCaveats = caveatsToValidate.filter(
    (caveat) => !caveat.optional,
  );

  return function ({ caveats }) {
    const actualCaveats = caveats ?? [];
    const passedCaveatTypes = actualCaveats.map((caveat) => caveat.type);
    const passedCaveatsSet = new Set(passedCaveatTypes);

    // Disallow duplicates
    if (passedCaveatsSet.size !== passedCaveatTypes.length) {
      throw rpcErrors.invalidParams({
        message: 'Duplicate caveats are not allowed.',
      });
    }

    // Disallow caveats that don't match expected types
    if (!actualCaveats.every((caveat) => validCaveatTypes.has(caveat.type))) {
      throw rpcErrors.invalidParams({
        message: `Expected the following caveats: ${caveatsToValidate
          .map((caveat) => `"${caveat.type}"`)
          .join(', ')}, received ${actualCaveats
          .map((caveat) => `"${caveat.type}"`)
          .join(', ')}.`,
      });
    }

    // Fail if not all required caveats are specified
    if (!requiredCaveats.every((caveat) => passedCaveatsSet.has(caveat.type))) {
      throw rpcErrors.invalidParams({
        message: `Expected the following caveats: ${requiredCaveats
          .map((caveat) => `"${caveat.type}"`)
          .join(', ')}.`,
      });
    }
  };
}
