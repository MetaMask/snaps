// src/endowments/caveats/requestTime.ts
import { rpcErrors } from "@metamask/rpc-errors";
import { MaxRequestTimeStruct, SnapCaveatType } from "@metamask/snaps-utils";
import { assertStruct, hasProperty, isObject } from "@metamask/utils";
function assertIsMaxRequestTime(value, ErrorWrapper) {
  assertStruct(
    value,
    MaxRequestTimeStruct,
    "Invalid maxRequestTime",
    ErrorWrapper
  );
}
function validateMaxRequestTimeCaveat(caveat) {
  if (!hasProperty(caveat, "value")) {
    throw rpcErrors.invalidParams({
      message: "Invalid maxRequestTime caveat."
    });
  }
  const { value } = caveat;
  assertIsMaxRequestTime(value, rpcErrors.invalidParams);
}
function getMaxRequestTimeCaveatMapper(value) {
  if (!value || !isObject(value) || isObject(value) && !hasProperty(value, "maxRequestTime")) {
    return { caveats: null };
  }
  return {
    caveats: [
      {
        type: SnapCaveatType.MaxRequestTime,
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
          type: SnapCaveatType.MaxRequestTime,
          value: maxRequestTime
        }
      ]
    };
  };
}
function getMaxRequestTimeCaveat(permission) {
  const foundCaveat = permission?.caveats?.find(
    (caveat) => caveat.type === SnapCaveatType.MaxRequestTime
  );
  return foundCaveat?.value ?? null;
}
var maxRequestTimeCaveatSpecifications = {
  [SnapCaveatType.MaxRequestTime]: Object.freeze({
    type: SnapCaveatType.MaxRequestTime,
    validator: (caveat) => validateMaxRequestTimeCaveat(caveat)
  })
};

export {
  getMaxRequestTimeCaveatMapper,
  createMaxRequestTimeMapper,
  getMaxRequestTimeCaveat,
  maxRequestTimeCaveatSpecifications
};
//# sourceMappingURL=chunk-23XDKQW2.mjs.map