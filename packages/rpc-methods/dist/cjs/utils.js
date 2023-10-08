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
    selectHooks: function() {
        return selectHooks;
    },
    deriveEntropy: function() {
        return deriveEntropy;
    },
    getPathPrefix: function() {
        return getPathPrefix;
    },
    getNode: function() {
        return getNode;
    }
});
const _keytree = require("@metamask/key-tree");
const _utils = require("@metamask/utils");
const _sha3 = require("@noble/hashes/sha3");
const HARDENED_VALUE = 0x80000000;
function selectHooks(hooks, hookNames) {
    if (hookNames) {
        return Object.keys(hookNames).reduce((hookSubset, _hookName)=>{
            const hookName = _hookName;
            hookSubset[hookName] = hooks[hookName];
            return hookSubset;
        }, {});
    }
    return undefined;
}
/**
 * Get a BIP-32 derivation path array from a hash, which is compatible with
 * `@metamask/key-tree`. The hash is assumed to be 32 bytes long.
 *
 * @param hash - The hash to derive indices from.
 * @returns The derived indices as a {@link HardenedBIP32Node} array.
 */ function getDerivationPathArray(hash) {
    const array = [];
    const view = (0, _utils.createDataView)(hash);
    for(let index = 0; index < 8; index++){
        const uint32 = view.getUint32(index * 4);
        // This is essentially `index | 0x80000000`. Because JavaScript numbers are
        // signed, we use the bitwise unsigned right shift operator to ensure that
        // the result is a positive number.
        // eslint-disable-next-line no-bitwise
        const pathIndex = (uint32 | HARDENED_VALUE) >>> 0;
        array.push(`bip32:${pathIndex - HARDENED_VALUE}'`);
    }
    return array;
}
async function deriveEntropy({ input, salt = '', mnemonicPhrase, magic }) {
    const inputBytes = (0, _utils.stringToBytes)(input);
    const saltBytes = (0, _utils.stringToBytes)(salt);
    // Get the derivation path from the snap ID.
    const hash = (0, _sha3.keccak_256)((0, _utils.concatBytes)([
        inputBytes,
        (0, _sha3.keccak_256)(saltBytes)
    ]));
    const computedDerivationPath = getDerivationPathArray(hash);
    // Derive the private key using BIP-32.
    const { privateKey } = await _keytree.SLIP10Node.fromDerivationPath({
        derivationPath: [
            mnemonicPhrase,
            `bip32:${magic}`,
            ...computedDerivationPath
        ],
        curve: 'secp256k1'
    });
    // This should never happen, but this keeps TypeScript happy.
    (0, _utils.assert)(privateKey, 'Failed to derive the entropy.');
    return (0, _utils.add0x)(privateKey);
}
function getPathPrefix(curve) {
    if (curve === 'secp256k1') {
        return 'bip32';
    }
    return 'slip10';
}
async function getNode({ curve, secretRecoveryPhrase, path }) {
    const prefix = getPathPrefix(curve);
    return await _keytree.SLIP10Node.fromDerivationPath({
        curve,
        derivationPath: [
            secretRecoveryPhrase,
            ...path.slice(1).map((index)=>`${prefix}:${index}`)
        ]
    });
}

//# sourceMappingURL=utils.js.map