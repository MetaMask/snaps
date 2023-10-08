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
    keyringEndowmentBuilder: function() {
        return keyringEndowmentBuilder;
    },
    getKeyringCaveatMapper: function() {
        return getKeyringCaveatMapper;
    },
    getKeyringCaveatOrigins: function() {
        return getKeyringCaveatOrigins;
    },
    keyringCaveatSpecifications: function() {
        return keyringCaveatSpecifications;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.Keyring;
/**
 * `endowment:keyring` returns nothing; it is intended to be used as a flag
 * by the client to detect whether the snap has keyring capabilities.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the keyring endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.KeyringOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.KeyringOrigin) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.KeyringOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const keyringEndowmentBuilder = Object.freeze({
    targetName: permissionName,
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
            message: 'Invalid keyring origins: Expected a plain object.'
        });
    }
    const { value } = caveat;
    (0, _snapsutils.assertIsKeyringOrigins)(value, _ethrpcerrors.ethErrors.rpc.invalidParams);
}
function getKeyringCaveatMapper(value) {
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.KeyringOrigin,
                value
            }
        ]
    };
}
function getKeyringCaveatOrigins(permission) {
    (0, _utils.assert)(permission?.caveats);
    (0, _utils.assert)(permission.caveats.length === 1);
    (0, _utils.assert)(permission.caveats[0].type === _snapsutils.SnapCaveatType.KeyringOrigin);
    const caveat = permission.caveats[0];
    return caveat.value;
}
const keyringCaveatSpecifications = {
    [_snapsutils.SnapCaveatType.KeyringOrigin]: Object.freeze({
        type: _snapsutils.SnapCaveatType.KeyringOrigin,
        validator: (caveat)=>validateCaveatOrigins(caveat)
    })
};

//# sourceMappingURL=keyring.js.map