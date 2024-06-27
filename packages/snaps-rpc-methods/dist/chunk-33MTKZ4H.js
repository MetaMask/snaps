"use strict";Object.defineProperty(exports, "__esModule", {value: true});// src/utils.ts
var _keytree = require('@metamask/key-tree');







var _utils = require('@metamask/utils');
var _sha3 = require('@noble/hashes/sha3');
var HARDENED_VALUE = 2147483648;
function selectHooks(hooks, hookNames) {
  if (hookNames) {
    return Object.keys(hookNames).reduce(
      (hookSubset, _hookName) => {
        const hookName = _hookName;
        hookSubset[hookName] = hooks[hookName];
        return hookSubset;
      },
      {}
    );
  }
  return void 0;
}
function getDerivationPathArray(hash) {
  const array = [];
  const view = _utils.createDataView.call(void 0, hash);
  for (let index = 0; index < 8; index++) {
    const uint32 = view.getUint32(index * 4);
    const pathIndex = (uint32 | HARDENED_VALUE) >>> 0;
    array.push(`bip32:${pathIndex - HARDENED_VALUE}'`);
  }
  return array;
}
async function deriveEntropy({
  input,
  salt = "",
  mnemonicPhrase,
  magic
}) {
  const inputBytes = _utils.stringToBytes.call(void 0, input);
  const saltBytes = _utils.stringToBytes.call(void 0, salt);
  const hash = _sha3.keccak_256.call(void 0, _utils.concatBytes.call(void 0, [inputBytes, _sha3.keccak_256.call(void 0, saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);
  const { privateKey } = await _keytree.SLIP10Node.fromDerivationPath({
    derivationPath: [
      mnemonicPhrase,
      `bip32:${magic}`,
      ...computedDerivationPath
    ],
    curve: "secp256k1"
  });
  _utils.assert.call(void 0, privateKey, "Failed to derive the entropy.");
  return _utils.add0x.call(void 0, privateKey);
}
function getPathPrefix(curve) {
  switch (curve) {
    case "secp256k1":
      return "bip32";
    case "ed25519":
      return "slip10";
    case "ed25519Bip32":
      return "cip3";
    default:
      return _utils.assertExhaustive.call(void 0, curve);
  }
}
async function getNode({
  curve,
  secretRecoveryPhrase,
  path
}) {
  const prefix = getPathPrefix(curve);
  return await _keytree.SLIP10Node.fromDerivationPath({
    curve,
    derivationPath: [
      secretRecoveryPhrase,
      ...path.slice(1).map((index) => `${prefix}:${index}`)
    ]
  });
}






exports.selectHooks = selectHooks; exports.deriveEntropy = deriveEntropy; exports.getPathPrefix = getPathPrefix; exports.getNode = getNode;
//# sourceMappingURL=chunk-33MTKZ4H.js.map