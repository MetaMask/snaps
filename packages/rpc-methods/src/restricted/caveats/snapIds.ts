import {
  Caveat,
  RestrictedMethodOptions,
  RestrictedMethodParameters,
  RestrictedMethodCaveatSpecificationConstraint,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { assertIsValidSnapId, SnapCaveatType } from '@metamask/snaps-utils';
import { isObject, hasProperty } from '@metamask/utils';

import { InvokeSnapParams } from '../invokeSnap';

/**
 * Validates that the caveat value exists and is a non-empty object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat is invalid.
 */
export function validateSnapIdsCaveat(caveat: Caveat<string, any>) {
  if (!isObject(caveat.value) || Object.keys(caveat.value).length === 0) {
    throw rpcErrors.invalidParams({
      message:
        'Expected caveat to have a value property of a non-empty object of snap IDs.',
    });
  }
  const snapIds = Object.keys(caveat.value);
  for (const snapId of snapIds) {
    assertIsValidSnapId(snapId);
  }
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
