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
    nameLookupEndowmentBuilder: function() {
        return nameLookupEndowmentBuilder;
    },
    getNameLookupCaveatMapper: function() {
        return getNameLookupCaveatMapper;
    },
    getChainIdsCaveat: function() {
        return getChainIdsCaveat;
    },
    nameLookupCaveatSpecifications: function() {
        return nameLookupCaveatSpecifications;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.NameLookup;
/**
 * `endowment:name-lookup` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to resolve a domain/address.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the name-lookup endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.ChainIds
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (!caveats || caveats !== null && caveats?.length > 1 || caveats?.length === 1 && caveats[0].type !== _snapsutils.SnapCaveatType.ChainIds) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.ChainIds}" caveat.`
                });
            }
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const nameLookupEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});
/**
 * Validates the type of the caveat value.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */ function validateCaveat(caveat) {
    if (!(0, _utils.hasProperty)(caveat, 'value') || !(0, _utils.isPlainObject)(caveat)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.'
        });
    }
    const { value } = caveat;
    (0, _utils.assert)(Array.isArray(value) && value.every((val)=>(0, _snapsutils.isChainId)(val)), 'Expected caveat value to have type "string array"');
}
function getNameLookupCaveatMapper(value) {
    if (!value || !Array.isArray(value) || Array.isArray(value) && value.length === 0) {
        return {
            caveats: null
        };
    }
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.ChainIds,
                value
            }
        ]
    };
}
function getChainIdsCaveat(permission) {
    if (!permission?.caveats) {
        return null;
    }
    (0, _utils.assert)(permission.caveats.length === 1);
    (0, _utils.assert)(permission.caveats[0].type === _snapsutils.SnapCaveatType.ChainIds);
    const caveat = permission.caveats[0];
    return caveat.value ?? null;
}
const nameLookupCaveatSpecifications = {
    [_snapsutils.SnapCaveatType.ChainIds]: Object.freeze({
        type: _snapsutils.SnapCaveatType.ChainIds,
        validator: (caveat)=>validateCaveat(caveat)
    })
};

//# sourceMappingURL=name-lookup.js.map