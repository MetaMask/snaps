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
    getBip44EntropyBuilder: function() {
        return getBip44EntropyBuilder;
    },
    getBip44EntropyImplementation: function() {
        return getBip44EntropyImplementation;
    }
});
const _keytree = require("@metamask/key-tree");
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _ethrpcerrors = require("eth-rpc-errors");
const targetName = 'snap_getBip44Entropy';
/**
 * The specification builder for the `snap_getBip44Entropy` permission.
 * `snap_getBip44Entropy_*` lets the Snap control private keys for a particular
 * BIP-32 coin type.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification for the `snap_getBip44Entropy` permission.
 */ const specificationBuilder = ({ methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.PermittedCoinTypes
        ],
        methodImplementation: getBip44EntropyImplementation(methodHooks),
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.PermittedCoinTypes) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.PermittedCoinTypes}" caveat.`
                });
            }
        },
        subjectTypes: [
            _permissioncontroller.SubjectType.Snap
        ]
    };
};
const methodHooks = {
    getMnemonic: true,
    getUnlockPromise: true
};
const getBip44EntropyBuilder = Object.freeze({
    targetName,
    specificationBuilder,
    methodHooks
});
function getBip44EntropyImplementation({ getMnemonic, getUnlockPromise }) {
    return async function getBip44Entropy(args) {
        await getUnlockPromise(true);
        // `args.params` is validated by the decorator, so it's safe to assert here.
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const params = args.params;
        const node = await _keytree.BIP44CoinTypeNode.fromDerivationPath([
            await getMnemonic(),
            `bip32:44'`,
            `bip32:${params.coinType}'`
        ]);
        return node.toJSON();
    };
}

//# sourceMappingURL=getBip44Entropy.js.map