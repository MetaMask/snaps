"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/endowments/caveats/requestTime.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
function assertIsMaxRequestTime(value, ErrorWrapper) {
  _utils.assertStruct.call(void 0, 
    value,
    _snapsutils.MaxRequestTimeStruct,
    "Invalid maxRequestTime",
    ErrorWrapper
  );
}
function validateMaxRequestTimeCaveat(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value")) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Invalid maxRequestTime caveat."
    });
  }
  const { value } = caveat;
  assertIsMaxRequestTime(value, _rpcerrors.rpcErrors.invalidParams);
}
function getMaxRequestTimeCaveatMapper(value) {
  if (!value || !_utils.isObject.call(void 0, value) || _utils.isObject.call(void 0, value) && !_utils.hasProperty.call(void 0, value, "maxRequestTime")) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.MaxRequestTime,
        value: value.maxRequestTime
      }
    ]
  };
}
function createMaxRequestTimeMapper(mapper) {
  return function(value) {
    const { maxRequestTime, ...rest } = value;
    const mapperResult = mapper(rest);
    if (!maxRequestTime) {
      return mapperResult;
    }
    return {
      ...mapperResult,
      caveats: [
        ...mapperResult.caveats ?? [],
        {
          type: _snapsutils.SnapCaveatType.MaxRequestTime,
          value: maxRequestTime
        }
      ]
    };
  };
}
function getMaxRequestTimeCaveat(permission) {
  const foundCaveat = permission?.caveats?.find(
    (caveat) => caveat.type === _snapsutils.SnapCaveatType.MaxRequestTime
  );
  return foundCaveat?.value ?? null;
}
var maxRequestTimeCaveatSpecifications = {
  [_snapsutils.SnapCaveatType.MaxRequestTime]: Object.freeze({
    type: _snapsutils.SnapCaveatType.MaxRequestTime,
    validator: (caveat) => validateMaxRequestTimeCaveat(caveat)
  })
};






exports.getMaxRequestTimeCaveatMapper = getMaxRequestTimeCaveatMapper; exports.createMaxRequestTimeMapper = createMaxRequestTimeMapper; exports.getMaxRequestTimeCaveat = getMaxRequestTimeCaveat; exports.maxRequestTimeCaveatSpecifications = maxRequestTimeCaveatSpecifications;
//# sourceMappingURL=chunk-FCVWU5XH.js.map