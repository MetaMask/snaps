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
    getBip32EntropyBuilder: function() {
        return getBip32EntropyBuilder;
    },
    getBip32EntropyImplementation: function() {
        return getBip32EntropyImplementation;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _utils1 = require("../utils");
const targetName = 'snap_getBip32Entropy';
/**
 * The specification builder for the `snap_getBip32Entropy` permission.
 * `snap_getBip32Entropy` lets the Snap control private keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32Entropy` permission.
 */ const specificationBuilder = ({ methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.PermittedDerivationPaths
        ],
        methodImplementation: getBip32EntropyImplementation(methodHooks),
        validator: ({ caveats })=>{
            if (caveats?.length !== 1 || caveats[0].type !== _snapsutils.SnapCaveatType.PermittedDerivationPaths) {
                throw _ethrpcerrors.ethErrors.rpc.invalidParams({
                    message: `Expected a single "${_snapsutils.SnapCaveatType.PermittedDerivationPaths}" caveat.`
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
const getBip32EntropyBuilder = Object.freeze({
    targetName,
    specificationBuilder,
    methodHooks
});
function getBip32EntropyImplementation({ getMnemonic, getUnlockPromise }) {
    return async function getBip32Entropy(args) {
        await getUnlockPromise(true);
        const { params } = args;
        (0, _utils.assert)(params);
        const node = await (0, _utils1.getNode)({
            curve: params.curve,
            path: params.path,
            secretRecoveryPhrase: await getMnemonic()
        });
        return node.toJSON();
    };
}

//# sourceMappingURL=getBip32Entropy.js.map