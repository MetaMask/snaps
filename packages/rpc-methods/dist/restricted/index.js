"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.caveatMappers = exports.caveatSpecifications = exports.restrictedMethodPermissionBuilders = exports.NotificationType = exports.ManageStateOperation = exports.DialogType = void 0;
const confirm_1 = require("./confirm");
const dialog_1 = require("./dialog");
const getBip44Entropy_1 = require("./getBip44Entropy");
const invokeSnap_1 = require("./invokeSnap");
const manageState_1 = require("./manageState");
const notify_1 = require("./notify");
const getBip32Entropy_1 = require("./getBip32Entropy");
const getBip32PublicKey_1 = require("./getBip32PublicKey");
var dialog_2 = require("./dialog");
Object.defineProperty(exports, "DialogType", { enumerable: true, get: function () { return dialog_2.DialogType; } });
var manageState_2 = require("./manageState");
Object.defineProperty(exports, "ManageStateOperation", { enumerable: true, get: function () { return manageState_2.ManageStateOperation; } });
var notify_2 = require("./notify");
Object.defineProperty(exports, "NotificationType", { enumerable: true, get: function () { return notify_2.NotificationType; } });
exports.restrictedMethodPermissionBuilders = {
    [confirm_1.confirmBuilder.targetKey]: confirm_1.confirmBuilder,
    [dialog_1.dialogBuilder.targetKey]: dialog_1.dialogBuilder,
    [getBip32Entropy_1.getBip32EntropyBuilder.targetKey]: getBip32Entropy_1.getBip32EntropyBuilder,
    [getBip32PublicKey_1.getBip32PublicKeyBuilder.targetKey]: getBip32PublicKey_1.getBip32PublicKeyBuilder,
    [getBip44Entropy_1.getBip44EntropyBuilder.targetKey]: getBip44Entropy_1.getBip44EntropyBuilder,
    [invokeSnap_1.invokeSnapBuilder.targetKey]: invokeSnap_1.invokeSnapBuilder,
    [manageState_1.manageStateBuilder.targetKey]: manageState_1.manageStateBuilder,
    [notify_1.notifyBuilder.targetKey]: notify_1.notifyBuilder,
};
exports.caveatSpecifications = Object.assign(Object.assign({}, getBip32Entropy_1.getBip32EntropyCaveatSpecifications), getBip44Entropy_1.getBip44EntropyCaveatSpecifications);
exports.caveatMappers = {
    [getBip32Entropy_1.getBip32EntropyBuilder.targetKey]: getBip32Entropy_1.getBip32EntropyCaveatMapper,
    [getBip32PublicKey_1.getBip32PublicKeyBuilder.targetKey]: getBip32Entropy_1.getBip32EntropyCaveatMapper,
    [getBip44Entropy_1.getBip44EntropyBuilder.targetKey]: getBip44Entropy_1.getBip44EntropyCaveatMapper,
};
//# sourceMappingURL=index.js.map