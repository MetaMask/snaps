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
    permittedCoinTypesCaveatMapper: function() {
        return permittedCoinTypesCaveatMapper;
    },
    validateBIP44Params: function() {
        return validateBIP44Params;
    },
    validateBIP44Caveat: function() {
        return validateBIP44Caveat;
    },
    PermittedCoinTypesCaveatSpecification: function() {
        return PermittedCoinTypesCaveatSpecification;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
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
    if (!(0, _utils.isPlainObject)(value) || !(0, _utils.hasProperty)(value, 'coinType')) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object containing a coin type.'
        });
    }
    if (typeof value.coinType !== 'number' || !Number.isInteger(value.coinType) || value.coinType < 0 || value.coinType > 0x7fffffff) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Invalid "coinType" parameter. Coin type must be a non-negative integer.'
        });
    }
    if (_snapsutils.FORBIDDEN_COIN_TYPES.includes(value.coinType)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: `Coin type ${value.coinType} is forbidden.`
        });
    }
}
function validateBIP44Caveat(caveat) {
    if (!(0, _utils.hasProperty)(caveat, 'value') || !Array.isArray(caveat.value) || caveat.value.length === 0) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected non-empty array of coin types.'
        });
    }
    caveat.value.forEach(validateBIP44Params);
}
const PermittedCoinTypesCaveatSpecification = {
    [_snapsutils.SnapCaveatType.PermittedCoinTypes]: Object.freeze({
        type: _snapsutils.SnapCaveatType.PermittedCoinTypes,
        decorator: (method, caveat)=>{
            return async (args)=>{
                const { params } = args;
                validateBIP44Params(params);
                const coinType = caveat.value.find((caveatValue)=>caveatValue.coinType === params.coinType);
                if (!coinType) {
                    throw _ethrpcerrors.ethErrors.provider.unauthorized({
                        message: 'The requested coin type is not permitted. Allowed coin types must be specified in the snap manifest.'
                    });
                }
                return await method(args);
            };
        },
        validator: (caveat)=>validateBIP44Caveat(caveat)
    })
};

//# sourceMappingURL=permittedCoinTypes.js.map