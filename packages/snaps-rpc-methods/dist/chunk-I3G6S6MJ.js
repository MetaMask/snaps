"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/caveats/permittedCoinTypes.ts
var _rpcerrors = require('@metamask/rpc-errors');
var _snapsutils = require('@metamask/snaps-utils');
var _utils = require('@metamask/utils');
function permittedCoinTypesCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.PermittedCoinTypes,
        value
      }
    ]
  };
}
function validateBIP44Params(value) {
  if (!_utils.isPlainObject.call(void 0, value) || !_utils.hasProperty.call(void 0, value, "coinType")) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected a plain object containing a coin type."
    });
  }
  if (typeof value.coinType !== "number" || !Number.isInteger(value.coinType) || value.coinType < 0 || value.coinType > 2147483647) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: 'Invalid "coinType" parameter. Coin type must be a non-negative integer.'
    });
  }
  if (_snapsutils.FORBIDDEN_COIN_TYPES.includes(value.coinType)) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: `Coin type ${value.coinType} is forbidden.`
    });
  }
}
function validateBIP44Caveat(caveat) {
  if (!_utils.hasProperty.call(void 0, caveat, "value") || !Array.isArray(caveat.value) || caveat.value.length === 0) {
    throw _rpcerrors.rpcErrors.invalidParams({
      message: "Expected non-empty array of coin types."
    });
  }
  caveat.value.forEach(validateBIP44Params);
}
var PermittedCoinTypesCaveatSpecification = {
  [_snapsutils.SnapCaveatType.PermittedCoinTypes]: Object.freeze({
    type: _snapsutils.SnapCaveatType.PermittedCoinTypes,
    decorator: (method, caveat) => {
      return async (args) => {
        const { params } = args;
        validateBIP44Params(params);
        const coinType = caveat.value.find(
          (caveatValue) => caveatValue.coinType === params.coinType
        );
        if (!coinType) {
          throw _rpcerrors.providerErrors.unauthorized({
            message: "The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest."
          });
        }
        return await method(args);
      };
    },
    validator: (caveat) => validateBIP44Caveat(caveat)
  })
};






exports.permittedCoinTypesCaveatMapper = permittedCoinTypesCaveatMapper; exports.validateBIP44Params = validateBIP44Params; exports.validateBIP44Caveat = validateBIP44Caveat; exports.PermittedCoinTypesCaveatSpecification = PermittedCoinTypesCaveatSpecification;
//# sourceMappingURL=chunk-I3G6S6MJ.js.map