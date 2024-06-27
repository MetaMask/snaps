"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/restricted/caveats/permittedDerivationPaths.ts
var _rpcerrors = require('@metamask/rpc-errors');




var _snapsutils = require('@metamask/snaps-utils');
var _superstruct = require('@metamask/superstruct');
var _utils = require('@metamask/utils');
function permittedDerivationPathsCaveatMapper(value) {
  return {
    caveats: [
      {
        type: _snapsutils.SnapCaveatType.PermittedDerivationPaths,
        value
      }
    ]
  };
}
function validateBIP32Path(value) {
  _utils.assertStruct.call(void 0, 
    value,
    _snapsutils.Bip32EntropyStruct,
    "Invalid BIP-32 entropy path definition",
    _rpcerrors.rpcErrors.invalidParams
  );
}
function validateBIP32CaveatPaths(caveat) {
  _utils.assertStruct.call(void 0, 
    caveat,
    _superstruct.type.call(void 0, { value: _superstruct.size.call(void 0, _superstruct.array.call(void 0, _snapsutils.Bip32EntropyStruct), 1, Infinity) }),
    "Invalid BIP-32 entropy caveat",
    _rpcerrors.rpcErrors.internal
  );
}
var PermittedDerivationPathsCaveatSpecification = {
  [_snapsutils.SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
    type: _snapsutils.SnapCaveatType.PermittedDerivationPaths,
    decorator: (method, caveat) => {
      return async (args) => {
        const { params } = args;
        validateBIP32Path(params);
        const path = caveat.value.find(
          (caveatPath) => _snapsutils.isEqual.call(void 0, 
            params.path.slice(0, caveatPath.path.length),
            caveatPath.path
          ) && caveatPath.curve === params.curve
        );
        if (!path) {
          throw _rpcerrors.providerErrors.unauthorized({
            message: "The requested path is not permitted. Allowed paths must be specified in the snap manifest."
          });
        }
        return await method(args);
      };
    },
    validator: (caveat) => validateBIP32CaveatPaths(caveat)
  })
};






exports.permittedDerivationPathsCaveatMapper = permittedDerivationPathsCaveatMapper; exports.validateBIP32Path = validateBIP32Path; exports.validateBIP32CaveatPaths = validateBIP32CaveatPaths; exports.PermittedDerivationPathsCaveatSpecification = PermittedDerivationPathsCaveatSpecification;
//# sourceMappingURL=chunk-756OQVOC.js.map