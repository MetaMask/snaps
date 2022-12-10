"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.longRunningEndowmentBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const enum_1 = require("./enum");
const permissionName = enum_1.SnapEndowments.LongRunning;
/**
 * `endowment:long-running` returns nothing; it is intended to be used as a flag
 * by the `SnapController` to make it ignore the request processing timeout
 * during snap lifecycle management. Essentially, it allows a snap to take an
 * infinite amount of time to process a request.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the long-running endowment.
 */
const specificationBuilder = (_builderOptions) => {
    return {
        permissionType: controllers_1.PermissionType.Endowment,
        targetKey: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions) => undefined,
    };
};
exports.longRunningEndowmentBuilder = Object.freeze({
    targetKey: permissionName,
    specificationBuilder,
});
//# sourceMappingURL=long-running.js.map