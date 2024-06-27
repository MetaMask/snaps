// src/restricted/caveats/permittedCoinTypes.ts
import { providerErrors, rpcErrors } from "@metamask/rpc-errors";
import { FORBIDDEN_COIN_TYPES, SnapCaveatType } from "@metamask/snaps-utils";
import { hasProperty, isPlainObject } from "@metamask/utils";
function permittedCoinTypesCaveatMapper(value) {
  return {
    caveats: [
      {
        type: SnapCaveatType.PermittedCoinTypes,
        value
      }
    ]
  };
}
function validateBIP44Params(value) {
  if (!isPlainObject(value) || !hasProperty(value, "coinType")) {
    throw rpcErrors.invalidParams({
      message: "Expected a plain object containing a coin type."
    });
  }
  if (typeof value.coinType !== "number" || !Number.isInteger(value.coinType) || value.coinType < 0 || value.coinType > 2147483647) {
    throw rpcErrors.invalidParams({
      message: 'Invalid "coinType" parameter. Coin type must be a non-negative integer.'
    });
  }
  if (FORBIDDEN_COIN_TYPES.includes(value.coinType)) {
    throw rpcErrors.invalidParams({
      message: `Coin type ${value.coinType} is forbidden.`
    });
  }
}
function validateBIP44Caveat(caveat) {
  if (!hasProperty(caveat, "value") || !Array.isArray(caveat.value) || caveat.value.length === 0) {
    throw rpcErrors.invalidParams({
      message: "Expected non-empty array of coin types."
    });
  }
  caveat.value.forEach(validateBIP44Params);
}
var PermittedCoinTypesCaveatSpecification = {
  [SnapCaveatType.PermittedCoinTypes]: Object.freeze({
    type: SnapCaveatType.PermittedCoinTypes,
    decorator: (method, caveat) => {
      return async (args) => {
        const { params } = args;
        validateBIP44Params(params);
        const coinType = caveat.value.find(
          (caveatValue) => caveatValue.coinType === params.coinType
        );
        if (!coinType) {
          throw providerErrors.unauthorized({
            message: "The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest."
          });
        }
        return await method(args);
      };
    },
    validator: (caveat) => validateBIP44Caveat(caveat)
  })
};

export {
  permittedCoinTypesCaveatMapper,
  validateBIP44Params,
  validateBIP44Caveat,
  PermittedCoinTypesCaveatSpecification
};
//# sourceMappingURL=chunk-PIAWDTWO.mjs.map