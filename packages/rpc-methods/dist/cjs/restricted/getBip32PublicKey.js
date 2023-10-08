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
    Bip32PublicKeyArgsStruct: function() {
        return Bip32PublicKeyArgsStruct;
    },
    getBip32PublicKeyBuilder: function() {
        return getBip32PublicKeyBuilder;
    },
    getBip32PublicKeyImplementation: function() {
        return getBip32PublicKeyImplementation;
    }
});
const _permissioncontroller = require("@metamask/permission-controller");
const _snapsutils = require("@metamask/snaps-utils");
const _utils = require("@metamask/utils");
const _ethrpcerrors = require("eth-rpc-errors");
const _superstruct = require("superstruct");
const _utils1 = require("../utils");
const targetName = 'snap_getBip32PublicKey';
const Bip32PublicKeyArgsStruct = (0, _snapsutils.bip32entropy)((0, _superstruct.object)({
    path: _snapsutils.Bip32PathStruct,
    curve: (0, _superstruct.enums)([
        'ed25519',
        'secp256k1'
    ]),
    compressed: (0, _superstruct.optional)((0, _superstruct.boolean)())
}));
/**
 * The specification builder for the `snap_getBip32PublicKey` permission.
 * `snap_getBip32PublicKey` lets the Snap retrieve public keys for a particular
 * BIP-32 node.
 *
 * @param options - The specification builder options.
 * @param options.methodHooks - The RPC method hooks needed by the method implementation.
 * @returns The specification for the `snap_getBip32PublicKey` permission.
 */ const specificationBuilder = ({ methodHooks })=>{
    return {
        permissionType: _permissioncontroller.PermissionType.RestrictedMethod,
        targetName,
        allowedCaveats: [
            _snapsutils.SnapCaveatType.PermittedDerivationPaths
        ],
        methodImplementation: getBip32PublicKeyImplementation(methodHooks),
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
const getBip32PublicKeyBuilder = Object.freeze({
    targetName,
    specificationBuilder,
    methodHooks
});
function getBip32PublicKeyImplementation({ getMnemonic, getUnlockPromise }) {
    return async function getBip32PublicKey(args) {
        await getUnlockPromise(true);
        (0, _utils.assertStruct)(args.params, Bip32PublicKeyArgsStruct, 'Invalid BIP-32 public key params', _ethrpcerrors.ethErrors.rpc.invalidParams);
        const { params } = args;
        const node = await (0, _utils1.getNode)({
            curve: params.curve,
            path: params.path,
            secretRecoveryPhrase: await getMnemonic()
        });
        if (params.compressed) {
            return node.compressedPublicKey;
        }
        return node.publicKey;
    };
}

//# sourceMappingURL=getBip32PublicKey.js.map