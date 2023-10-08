"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SnapCaveatType", {
    enumerable: true,
    get: function() {
        return SnapCaveatType;
    }
});
var SnapCaveatType;
(function(SnapCaveatType) {
    SnapCaveatType[/**
   * Permitted derivation paths, used by `snap_getBip32Entropy`.
   */ "PermittedDerivationPaths"] = 'permittedDerivationPaths';
    SnapCaveatType[/**
   * Permitted coin types, used by `snap_getBip44Entropy`.
   */ "PermittedCoinTypes"] = 'permittedCoinTypes';
    SnapCaveatType[/**
   * Caveat specifying a snap cronjob.
   */ "SnapCronjob"] = 'snapCronjob';
    SnapCaveatType[/**
   * Caveat specifying access to the transaction origin, used by `endowment:transaction-insight`.
   */ "TransactionOrigin"] = 'transactionOrigin';
    SnapCaveatType[/**
   * The origins that a Snap can receive JSON-RPC messages from.
   */ "RpcOrigin"] = 'rpcOrigin';
    SnapCaveatType[/**
   * The origins that a Snap can receive keyring messages from.
   */ "KeyringOrigin"] = 'keyringOrigin';
    SnapCaveatType[/**
   * Caveat specifying the snap IDs that can be interacted with.
   */ "SnapIds"] = 'snapIds';
    SnapCaveatType[/**
   * Caveat specifying the CAIP-2 chain IDs that a snap can service, currently limited to `endowment:name-lookup`.
   */ "ChainIds"] = 'chainIds';
})(SnapCaveatType || (SnapCaveatType = {}));

//# sourceMappingURL=caveats.js.map