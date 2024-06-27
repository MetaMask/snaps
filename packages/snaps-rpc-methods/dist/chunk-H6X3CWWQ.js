"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/caveats/snapIds.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
function snapIdsCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.SnapIds,
        value
      }
    ]
  };
}
function validateSnapIdsCaveat(caveat) {
  _utils.assertStruct.call(void 0, 
    caveat,
    _superstruct.type.call(void 0, {
      value: _snapsutils.SnapIdsStruct
    }),
    "Expected caveat to have a value property of a non-empty object of snap IDs.",
    _rpcerrors.rpcErrors.invalidParams
  );
}
var SnapIdsCaveatSpecification = {
  [_snapsutils.SnapCaveatType.SnapIds]: Object.freeze({
    type: _snapsutils.SnapCaveatType.SnapIds,
    validator: (caveat) => validateSnapIdsCaveat(caveat),
    decorator: (method, caveat) => {
      return async (args) => {
        const {
          params,
          context: { origin }
        } = args;
        const snapIds = caveat.value;
        const { snapId } = params;
        if (!_utils.hasProperty.call(void 0, snapIds, snapId)) {
          throw new Error(
            `${origin} does not have permission to invoke ${snapId} snap.`
          );
        }
        return await method(args);
      };
    }
  })
};





exports.snapIdsCaveatMapper = snapIdsCaveatMapper; exports.validateSnapIdsCaveat = validateSnapIdsCaveat; exports.SnapIdsCaveatSpecification = SnapIdsCaveatSpecification;
//# sourceMappingURL=chunk-H6X3CWWQ.js.map