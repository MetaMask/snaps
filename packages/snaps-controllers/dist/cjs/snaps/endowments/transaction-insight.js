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
    transactionInsightEndowmentBuilder: function() {
        return transactionInsightEndowmentBuilder;
    },
    getTransactionInsightCaveatMapper: function() {
        return getTransactionInsightCaveatMapper;
    },
    getTransactionOriginCaveat: function() {
        return getTransactionOriginCaveat;
    },
    transactionInsightCaveatSpecifications: function() {
        return transactionInsightCaveatSpecifications;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _enum = require("./enum");
const permissionName = _enum.SnapEndowments.TransactionInsight;
/**
 * `endowment:transaction-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the transaction confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the transaction-insight endowment.
 */ const specificationBuilder = (_builderOptions)=>{
    return {
        permissionType: _permissioncontroller.PermissionType.Endowment,
        targetName: permissionName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.TransactionOrigin
        ],
        endowmentGetter: (_getterOptions)=>undefined,
        validator: ({ caveats })=>{
            if (caveats !== null && caveats?.length > 1 || caveats?.length === 1 && caveats[0].type !== _snapsutils.SnapCaveatType.TransactionOrigin) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.TransactionOrigin}" caveat.`
                });
            }
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const transactionInsightEndowmentBuilder = Object.freeze({
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
    (0, _utils.assert)(typeof value === 'boolean', 'Expected caveat value to have type "boolean"');
}
function getTransactionInsightCaveatMapper(value) {
    if (!value || !(0, _utils.isObject)(value) || (0, _utils.isObject)(value) && Object.keys(value).length === 0) {
        return {
            caveats: null
        };
    }
    return {
        caveats: [
            {
                type: _snapsutils.SnapCaveatType.TransactionOrigin,
                value: (0, _utils.hasProperty)(value, 'allowTransactionOrigin') && value.allowTransactionOrigin
            }
        ]
    };
}
function getTransactionOriginCaveat(permission) {
    if (!permission?.caveats) {
        return null;
    }
    (0, _utils.assert)(permission.caveats.length === 1);
    (0, _utils.assert)(permission.caveats[0].type === _snapsutils.SnapCaveatType.TransactionOrigin);
    const caveat = permission.caveats[0];
    return caveat.value ?? null;
}
const transactionInsightCaveatSpecifications = {
    [_snapsutils.SnapCaveatType.TransactionOrigin]: Object.freeze({
        type: _snapsutils.SnapCaveatType.TransactionOrigin,
        validator: (caveat)=>validateCaveat(caveat)
    })
};

//# sourceMappingURL=transaction-insight.js.map