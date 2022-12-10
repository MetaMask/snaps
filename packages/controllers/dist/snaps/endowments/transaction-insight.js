"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionInsightEndowmentBuilder = void 0;
const controllers_1 = require("@metamask/controllers");
const enum_1 = require("./enum");
const permissionName = enum_1.SnapEndowments.TransactionInsight;
/**
 * `endowment:transaction-insight` returns nothing; it is intended to be used as a flag
 * by the extension to detect whether the snap has the capability to show information on the transaction confirmation screen.
 *
 * @param _builderOptions - Optional specification builder options.
 * @returns The specification for the transaction-insight endowment.
 */
const specificationBuilder = (_builderOptions) => {
    return {
        permissionType: controllers_1.PermissionType.Endowment,
        targetKey: permissionName,
        allowedCaveats: null,
        endowmentGetter: (_getterOptions) => undefined,
    };
};
exports.transactionInsightEndowmentBuilder = Object.freeze({
    targetKey: permissionName,
    specificationBuilder,
});
//# sourceMappingURL=transaction-insight.js.map