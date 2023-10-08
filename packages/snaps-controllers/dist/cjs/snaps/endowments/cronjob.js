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
    cronjobEndowmentBuilder: function() {
        return cronjobEndowmentBuilder;
    },
    getCronjobCaveatMapper: function() {
        return getCronjobCaveatMapper;
    },
    getCronjobCaveatJobs: function() {
        return getCronjobCaveatJobs;
    },
    validateCronjobCaveat: function() {
        return validateCronjobCaveat;
    },
    cronjobCaveatSpecifications: function() {
        return cronjobCaveatSpecifications;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.Cronjob;
/**
 * `endowment:cronjob` returns nothing; it is intended to be used as a flag to determine whether the snap wants to run cronjobs.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the cronjob endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.SnapCronjob
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const cronjobEndowmentBuilder = Object.freeze({
    targetName: permissionName,
    specificationBuilder
});
function getCronjobCaveatMapper(value) {
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.SnapCronjob,
                value
            }
        ]
    };
}
function getCronjobCaveatJobs(permission) {
    if (!permission?.caveats) {
        return null;
    }
    (0, _utils.assert)(permission.caveats.length === 1);
    (0, _utils.assert)(permission.caveats[0].type === _snapsutils.SnapCaveatType.SnapCronjob);
    const caveat = permission.caveats[0];
    return (caveat.value?.jobs) ?? null;
}
function validateCronjobCaveat(caveat) {
    if (!(0, _utils.hasProperty)(caveat, 'value') || !(0, _utils.isPlainObject)(caveat.value)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.'
        });
    }
    const { value } = caveat;
    if (!(0, _utils.hasProperty)(value, 'jobs') || !(0, _utils.isPlainObject)(value)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.'
        });
    }
    if (!(0, _snapsutils.isCronjobSpecificationArray)(value.jobs)) {
        throw _ethrpcerrors.ethErrors.rpc.invalidParams({
            message: 'Expected a valid cronjob specification array.'
        });
    }
}
const cronjobCaveatSpecifications = {
    [_snapsutils.SnapCaveatType.SnapCronjob]: Object.freeze({
        type: _snapsutils.SnapCaveatType.SnapCronjob,
        validator: (caveat)=>validateCronjobCaveat(caveat)
    })
};

//# sourceMappingURL=cronjob.js.map