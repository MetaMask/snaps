import type {
  Caveat,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
  RestrictedMethodCaveatSpecificationConstraint,
  PermissionConstraint,
} from '@metamask/permission-controller';
import type { SnapIds } from '@metamask/snaps-utils';
import { SnapCaveatType, SnapIdsStruct } from '@metamask/snaps-utils';
import type { Json } from '@metamask/utils';
import { hasProperty, assertStruct } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { type } from 'superstruct';

import type { InvokeSnapParams } from '../invokeSnap';

/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
export function snapIdsCaveatMapper(
  value: Json,
): Pick<PermissionConstraint, 'caveats'> {
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapIds,
        value,
      },
    ],
  };
}

/**
 * Validates that the caveat value exists and is a non-empty object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateSnapIdsCaveat(
  caveat: Caveat<string, any>,
): asserts caveat is Caveat<string, SnapIds> {
  assertStruct(
    caveat,
    type({
      value: SnapIdsStruct,
    }),
    'Expected caveat to have a value property of a non-empty object of snap IDs.',
    ethErrors.rpc.invalidParams,
  );
}

export const SnapIdsCaveatSpecification: Record<
  SnapCaveatType.SnapIds,
  RestrictedMethodCaveatSpecificationConstraint
> = {
  [SnapCaveatType.SnapIds]: Object.freeze({
    type: SnapCaveatType.SnapIds,
    validator: (caveat) => validateSnapIdsCaveat(caveat),
    decorator: (method, caveat) => {
      return async (args) => {
        const {
          params,
          context: { origin },
        }: RestrictedMethodOptions<RestrictedMethodParameters> = args;
        const snapIds = caveat.value;
        const { snapId } = params as InvokeSnapParams;
        if (!hasProperty(snapIds, snapId)) {
          throw new Error(
            `${origin} does not have permission to invoke ${snapId} snap.`,
          );
        }
        return await method(args);
      };
    },
  }),
};
