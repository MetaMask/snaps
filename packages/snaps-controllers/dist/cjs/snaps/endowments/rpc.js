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
    rpcEndowmentBuilder: function() {
        return rpcEndowmentBuilder;
    },
    getRpcCaveatMapper: function() {
        return getRpcCaveatMapper;
    },
    getRpcCaveatOrigins: function() {
        return getRpcCaveatOrigins;
    },
    rpcCaveatSpecifications: function() {
        return rpcCaveatSpecifications;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _enum = require("./enum");
const targetName = _enum.SnapEndowments.Rpc;
/**
 * The specification builder for the JSON-RPC endowment permission.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the JSON-RPC endowment permission.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.RpcOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.RpcOrigin) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.RpcOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const rpcEndowmentBuilder = Object.freeze({
    targetName,
    specificationBuilder
});
/**
 * Validate the value of a caveat. This does not validate the type of the
 * caveat itself, only the value of the caveat.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */ function validateCaveatOrigins(caveat) {
    if (!(0, _utils.hasProperty)(caveat, 'value') || !(0, _utils.isPlainObject)(caveat.value)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Invalid JSON-RPC origins: Expected a plain object.'
        });
    }
    const { value } = caveat;
    (0, _snapsutils.assertIsRpcOrigins)(value, _ethrpcerrors.ethErrors.rpc.invalidParams);
}
function getRpcCaveatMapper(value) {
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.RpcOrigin,
                value
            }
        ]
    };
}
function getRpcCaveatOrigins(permission) {
    (0, _utils.assert)(permission?.caveats);
    (0, _utils.assert)(permission.caveats.length === 1);
    (0, _utils.assert)(permission.caveats[0].type === _snapsutils.SnapCaveatType.RpcOrigin);
    const caveat = permission.caveats[0];
    return caveat.value;
}
const rpcCaveatSpecifications = {
    [_snapsutils.SnapCaveatType.RpcOrigin]: Object.freeze({
        type: _snapsutils.SnapCaveatType.RpcOrigin,
        validator: (caveat)=>validateCaveatOrigins(caveat)
    })
};

//# sourceMappingURL=rpc.js.map