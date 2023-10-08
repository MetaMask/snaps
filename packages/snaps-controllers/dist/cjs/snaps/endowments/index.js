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
    endowmentPermissionBuilders: function() {
        return endowmentPermissionBuilders;
    },
    endowmentCaveatSpecifications: function() {
        return endowmentCaveatSpecifications;
    },
    endowmentCaveatMappers: function() {
        return endowmentCaveatMappers;
    },
    handlerEndowments: function() {
        return handlerEndowments;
    },
    getRpcCaveatOrigins: function() {
        return _rpc.getRpcCaveatOrigins;
    },
    getTransactionOriginCaveat: function() {
        return _transactioninsight.getTransactionOriginCaveat;
    },
    getChainIdsCaveat: function() {
        return _namelookup.getChainIdsCaveat;
    },
    getKeyringCaveatOrigins: function() {
        return _keyring.getKeyringCaveatOrigins;
    }
});
const _snapsutils = require("@metamask/snaps-utils");
const _cronjob = require("./cronjob");
const _ethereumprovider = require("./ethereum-provider");
const _keyring = require("./keyring");
const _lifecyclehooks = require("./lifecycle-hooks");
const _namelookup = require("./name-lookup");
const _networkaccess = require("./network-access");
const _rpc = require("./rpc");
const _transactioninsight = require("./transaction-insight");
const _webassembly = require("./web-assembly");
_export_star(require("./enum"), exports);
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
const endowmentPermissionBuilders = {
    [_networkaccess.networkAccessEndowmentBuilder.targetName]: _networkaccess.networkAccessEndowmentBuilder,
    [_transactioninsight.transactionInsightEndowmentBuilder.targetName]: _transactioninsight.transactionInsightEndowmentBuilder,
    [_cronjob.cronjobEndowmentBuilder.targetName]: _cronjob.cronjobEndowmentBuilder,
    [_ethereumprovider.ethereumProviderEndowmentBuilder.targetName]: _ethereumprovider.ethereumProviderEndowmentBuilder,
    [_rpc.rpcEndowmentBuilder.targetName]: _rpc.rpcEndowmentBuilder,
    [_webassembly.webAssemblyEndowmentBuilder.targetName]: _webassembly.webAssemblyEndowmentBuilder,
    [_namelookup.nameLookupEndowmentBuilder.targetName]: _namelookup.nameLookupEndowmentBuilder,
    [_lifecyclehooks.lifecycleHooksEndowmentBuilder.targetName]: _lifecyclehooks.lifecycleHooksEndowmentBuilder,
    [_keyring.keyringEndowmentBuilder.targetName]: _keyring.keyringEndowmentBuilder
};
const endowmentCaveatSpecifications = {
    ..._cronjob.cronjobCaveatSpecifications,
    ..._transactioninsight.transactionInsightCaveatSpecifications,
    ..._rpc.rpcCaveatSpecifications,
    ..._namelookup.nameLookupCaveatSpecifications,
    ..._keyring.keyringCaveatSpecifications
};
const endowmentCaveatMappers = {
    [_cronjob.cronjobEndowmentBuilder.targetName]: _cronjob.getCronjobCaveatMapper,
    [_transactioninsight.transactionInsightEndowmentBuilder.targetName]: _transactioninsight.getTransactionInsightCaveatMapper,
    [_rpc.rpcEndowmentBuilder.targetName]: _rpc.getRpcCaveatMapper,
    [_namelookup.nameLookupEndowmentBuilder.targetName]: _namelookup.getNameLookupCaveatMapper,
    [_keyring.keyringEndowmentBuilder.targetName]: _keyring.getKeyringCaveatMapper
};
const handlerEndowments = {
    [_snapsutils.HandlerType.OnRpcRequest]: _rpc.rpcEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnTransaction]: _transactioninsight.transactionInsightEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnCronjob]: _cronjob.cronjobEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnNameLookup]: _namelookup.nameLookupEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnInstall]: _lifecyclehooks.lifecycleHooksEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnUpdate]: _lifecyclehooks.lifecycleHooksEndowmentBuilder.targetName,
    [_snapsutils.HandlerType.OnKeyringRequest]: _keyring.keyringEndowmentBuilder.targetName
};

//# sourceMappingURL=index.js.map