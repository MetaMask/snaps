"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.networkAccessEndowmentBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const enum_1 = require("./enum");
const permissionName = enum_1.SnapEndowments.NetworkAccess;
/**
 * `endowment:network-access` returns the name of global browser API(s) that
 * enable network access. This is intended to populate the endowments of the
 * SES Compartment in which a Snap executes.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the network endowment.
 */
const specificationBuilder = (_builderOptions) => {
    return {
        permissionType: controllers_1.PermissionType.Endowment,
        targetKey: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions) => {
            return ['fetch', 'WebSocket', 'Request', 'Headers', 'Response'];
        },
    };
};
exports.networkAccessEndowmentBuilder = Object.freeze({
    targetKey: permissionName,
    specificationBuilder,
});
//# sourceMappingURL=network-access.js.map