// src/restricted/caveats/snapIds.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { SnapCaveatType, SnapIdsStruct } from "@metamask/snaps-utils";
import { type } from "@metamask/superstruct";
import { hasProperty, assertStruct } from "@metamask/utils";
function snapIdsCaveatMapper(value) {
  return {
    caveats: [
      {
        type: SnapCaveatType.SnapIds,
        value
      }
    ]
  };
}
function validateSnapIdsCaveat(caveat) {
  assertStruct(
    caveat,
    type({
      value: SnapIdsStruct
    }),
    "Expected caveat to have a value property of a non-empty object of snap IDs.",
    rpcErrors.invalidParams
  );
}
var SnapIdsCaveatSpecification = {
  [SnapCaveatType.SnapIds]: Object.freeze({
    type: SnapCaveatType.SnapIds,
    validator: (caveat) => validateSnapIdsCaveat(caveat),
    decorator: (method, caveat) => {
      return async (args) => {
        const {
          params,
          context: { origin }
        } = args;
        const snapIds = caveat.value;
        const { snapId } = params;
        if (!hasProperty(snapIds, snapId)) {
          throw new Error(
            `${origin} does not have permission to invoke ${snapId} snap.`
          );
        }
        return await method(args);
      };
    }
  })
};

export {
  snapIdsCaveatMapper,
  validateSnapIdsCaveat,
  SnapIdsCaveatSpecification
};
//# sourceMappingURL=chunk-FJ7COFRJ.mjs.map