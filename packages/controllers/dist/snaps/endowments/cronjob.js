"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cronjobCaveatSpecifications = exports.validateCronjobCaveat = exports.getCronjobCaveatJobs = exports.getCronjobCaveatMapper = exports.cronjobEndowmentBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const snap_utils_1 = require("@metamask/snap-utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const enum_1 = require("./enum");
const permissionName = enum_1.SnapEndowments.Cronjob;
/**
 * `endowment:cronjob` returns nothing; it is intended to be used as a flag to determine whether the snap wants to run cronjobs.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the cronjob endowment.
 */
const specificationBuilder = (_builderOptions) => {
    return {
        permissionType: controllers_1.PermissionType.Endowment,
        targetKey: permissionName,
        allowedCaveats: [snap_utils_1.SnapCaveatType.SnapCronjob],
        endowmentGetter: (_getterOptions) => undefined,
    };
};
exports.cronjobEndowmentBuilder = Object.freeze({
    targetKey: permissionName,
    specificationBuilder,
});
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
function getCronjobCaveatMapper(value) {
    return {
        caveats: [
            {
                type: snap_utils_1.SnapCaveatType.SnapCronjob,
                value,
            },
        ],
    };
}
exports.getCronjobCaveatMapper = getCronjobCaveatMapper;
/**
 * Getter function to get the cronjobs from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The cronjobs, or `null` if the permission does not have a
 * cronjob caveat.
 */
function getCronjobCaveatJobs(permission) {
    var _a, _b;
    if (!(permission === null || permission === void 0 ? void 0 : permission.caveats)) {
        return null;
    }
    (0, utils_1.assert)(permission.caveats.length === 1);
    (0, utils_1.assert)(permission.caveats[0].type === snap_utils_1.SnapCaveatType.SnapCronjob);
    const caveat = permission.caveats[0];
    return (_b = (_a = caveat.value) === null || _a === void 0 ? void 0 : _a.jobs) !== null && _b !== void 0 ? _b : null;
}
exports.getCronjobCaveatJobs = getCronjobCaveatJobs;
/**
 * Validate the cronjob specification values associated with a caveat.
 * This validates that the value is a non-empty array with valid
 * cronjob expression and request object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the value is invalid.
 */
function validateCronjobCaveat(caveat) {
    if (!(0, utils_1.hasProperty)(caveat, 'value') || !(0, utils_1.isPlainObject)(caveat.value)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.',
        });
    }
    const { value } = caveat;
    if (!(0, utils_1.hasProperty)(value, 'jobs') || !(0, utils_1.isPlainObject)(value)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.',
        });
    }
    if (!(0, snap_utils_1.isCronjobSpecificationArray)(value.jobs)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a valid cronjob specification array.',
        });
    }
}
exports.validateCronjobCaveat = validateCronjobCaveat;
/**
 * Caveat specification for the Cronjob.
 */
exports.cronjobCaveatSpecifications = {
    [snap_utils_1.SnapCaveatType.SnapCronjob]: Object.freeze({
        type: snap_utils_1.SnapCaveatType.SnapCronjob,
        validator: (caveat) => validateCronjobCaveat(caveat),
    }),
};
//# sourceMappingURL=cronjob.js.map