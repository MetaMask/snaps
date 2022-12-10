"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyringCaveatSpecifications = exports.getKeyringCaveatNamespaces = exports.getKeyringCaveatMapper = exports.keyringEndowmentBuilder = void 0;
const snap_utils_1 = require("@metamask/snap-utils");
const controllers_1 = require("@metamask/controllers");
const utils_1 = require("@metamask/utils");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const enum_1 = require("./enum");
const targetKey = enum_1.SnapEndowments.Keyring;
/**
 * The specification builder for the keyring endowment permission.
 *
 * @returns The specification for the keyring endowment permission.
 */
const specificationBuilder = () => {
    return {
        permissionType: controllers_1.PermissionType.Endowment,
        targetKey,
        allowedCaveats: [snap_utils_1.SnapCaveatType.SnapKeyring],
        endowmentGetter: (_getterOptions) => undefined,
        validator: ({ caveats }) => {
            if ((caveats === null || caveats === void 0 ? void 0 : caveats.length) !== 1 ||
                caveats[0].type !== snap_utils_1.SnapCaveatType.SnapKeyring) {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${snap_utils_1.SnapCaveatType.SnapKeyring}" caveat.`,
                });
            }
        },
    };
};
exports.keyringEndowmentBuilder = Object.freeze({
    targetKey,
    specificationBuilder,
});
/**
 * Validate the namespaces value of a caveat. This does not validate the type or
 * value of the caveat itself, only the value of the namespaces object.
 *
 * @param caveat - The caveat to validate.
 * @throws If the caveat value is invalid.
 */
function validateCaveatNamespace(caveat) {
    if (!(0, utils_1.hasProperty)(caveat, 'value') || !(0, utils_1.isPlainObject)(caveat.value)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.',
        });
    }
    const { value } = caveat;
    if (!(0, utils_1.hasProperty)(value, 'namespaces') || !(0, utils_1.isPlainObject)(value)) {
        throw eth_rpc_errors_1.ethErrors.rpc.invalidParams({
            message: 'Expected a plain object.',
        });
    }
    (0, snap_utils_1.assertIsNamespacesObject)(value.namespaces, eth_rpc_errors_1.ethErrors.rpc.invalidParams);
}
/**
 * Map a raw value from the `initialPermissions` to a caveat specification.
 * Note that this function does not do any validation, that's handled by the
 * PermissionsController when the permission is requested.
 *
 * @param value - The raw value from the `initialPermissions`.
 * @returns The caveat specification.
 */
function getKeyringCaveatMapper(value) {
    return {
        caveats: [
            {
                type: snap_utils_1.SnapCaveatType.SnapKeyring,
                value,
            },
        ],
    };
}
exports.getKeyringCaveatMapper = getKeyringCaveatMapper;
/**
 * Getter function to get the keyring namespaces from a permission.
 *
 * This does basic validation of the caveat, but does not validate the type or
 * value of the namespaces object itself, as this is handled by the
 * `PermissionsController` when the permission is requested.
 *
 * @param permission - The permission to get the keyring namespaces from.
 * @returns The keyring namespaces, or `null` if the permission does not have a
 * keyring caveat.
 */
function getKeyringCaveatNamespaces(permission) {
    var _a, _b;
    if (!(permission === null || permission === void 0 ? void 0 : permission.caveats)) {
        return null;
    }
    (0, utils_1.assert)(permission.caveats.length === 1);
    (0, utils_1.assert)(permission.caveats[0].type === snap_utils_1.SnapCaveatType.SnapKeyring);
    const caveat = permission.caveats[0];
    return (_b = (_a = caveat.value) === null || _a === void 0 ? void 0 : _a.namespaces) !== null && _b !== void 0 ? _b : null;
}
exports.getKeyringCaveatNamespaces = getKeyringCaveatNamespaces;
exports.keyringCaveatSpecifications = {
    [snap_utils_1.SnapCaveatType.SnapKeyring]: Object.freeze({
        type: snap_utils_1.SnapCaveatType.SnapKeyring,
        validator: (caveat) => validateCaveatNamespace(caveat),
    }),
};
//# sourceMappingURL=keyring.js.map