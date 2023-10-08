"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    permittedDerivationPathsCaveatMapper: function() {
        return permittedDerivationPathsCaveatMapper;
    },
    validateBIP32Path: function() {
        return validateBIP32Path;
    },
    validateBIP32CaveatPaths: function() {
        return validateBIP32CaveatPaths;
    },
    PermittedDerivationPathsCaveatSpecification: function() {
        return PermittedDerivationPathsCaveatSpecification;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _superstruct = require("superstruct");
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
    (0, _utils.assertStruct)(value, _snapsutils.Bip32EntropyStruct, 'Invalid BIP-32 entropy path definition', _ethrpcerrors.ethErrors.rpc.invalidParams);
}
function validateBIP32CaveatPaths(caveat) {
    (0, _utils.assertStruct)(caveat, (0, _superstruct.type)({
        value: (0, _superstruct.size)((0, _superstruct.array)(_snapsutils.Bip32EntropyStruct), 1, Infinity)
    }), 'Invalid BIP-32 entropy caveat', _ethrpcerrors.ethErrors.rpc.internal);
}
const PermittedDerivationPathsCaveatSpecification = {
    [_snapsutils.SnapCaveatType.PermittedDerivationPaths]: Object.freeze({
        type: _snapsutils.SnapCaveatType.PermittedDerivationPaths,
        decorator: (method, caveat)=>{
            return async (args)=>{
                const { params } = args;
                validateBIP32Path(params);
                const path = caveat.value.find((caveatPath)=>(0, _snapsutils.isEqual)(params.path.slice(0, caveatPath.path.length), caveatPath.path) && caveatPath.curve === params.curve);
                if (!path) {
                    throw _ethrpcerrors.ethErrors.provider.unauthorized({
                        message: 'The requested path is not permitted. Allowed paths must be specified in the snap manifest.'
                    });
                }
                return await method(args);
            };
        },
        validator: (caveat)=>validateBIP32CaveatPaths(caveat)
    })
};

//# sourceMappingURL=permittedDerivationPaths.js.map