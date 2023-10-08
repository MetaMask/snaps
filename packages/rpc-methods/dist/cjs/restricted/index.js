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
    DialogType: function() {
        return _dialog.DialogType;
    },
    ManageStateOperation: function() {
        return _manageState.ManageStateOperation;
    },
    WALLET_SNAP_PERMISSION_KEY: function() {
        return _invokeSnap.WALLET_SNAP_PERMISSION_KEY;
    },
    NotificationType: function() {
        return _notify.NotificationType;
    },
    restrictedMethodPermissionBuilders: function() {
        return restrictedMethodPermissionBuilders;
    }
});
const _dialog = require("./dialog");
const _getBip32Entropy = require("./getBip32Entropy");
const _getBip32PublicKey = require("./getBip32PublicKey");
const _getBip44Entropy = require("./getBip44Entropy");
const _getEntropy = require("./getEntropy");
const _getLocale = require("./getLocale");
const _invokeSnap = require("./invokeSnap");
const _manageAccounts = require("./manageAccounts");
const _manageState = require("./manageState");
const _notify = require("./notify");
_export_star(require("./caveats"), exports);
function _export_star(from, to) {
    Object.keys(from).forEach(function(k) {
        if (k !== "default" && !Object.prototype.hasOwnProperty.call(to, k)) {
            Object.defineProperty(to, k, {
                enumerable: true,
                get: function() {
                    return from[k];
                }
            });
        }
    });
    return from;
}
const restrictedMethodPermissionBuilders = {
    [_dialog.dialogBuilder.targetName]: _dialog.dialogBuilder,
    [_getBip32Entropy.getBip32EntropyBuilder.targetName]: _getBip32Entropy.getBip32EntropyBuilder,
    [_getBip32PublicKey.getBip32PublicKeyBuilder.targetName]: _getBip32PublicKey.getBip32PublicKeyBuilder,
    [_getBip44Entropy.getBip44EntropyBuilder.targetName]: _getBip44Entropy.getBip44EntropyBuilder,
    [_getEntropy.getEntropyBuilder.targetName]: _getEntropy.getEntropyBuilder,
    [_invokeSnap.invokeSnapBuilder.targetName]: _invokeSnap.invokeSnapBuilder,
    [_manageState.manageStateBuilder.targetName]: _manageState.manageStateBuilder,
    [_notify.notifyBuilder.targetName]: _notify.notifyBuilder,
    [_manageAccounts.manageAccountsBuilder.targetName]: _manageAccounts.manageAccountsBuilder,
    [_getLocale.getLocaleBuilder.targetName]: _getLocale.getLocaleBuilder
};

//# sourceMappingURL=index.js.map