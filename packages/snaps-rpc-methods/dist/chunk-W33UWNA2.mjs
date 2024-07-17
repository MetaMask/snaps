// src/utils.ts
import { SLIP10Node } from "@metamask/key-tree";
import {
  assertExhaustive,
  add0x,
  assert,
  concatBytes,
  createDataView,
  stringToBytes
} from "@metamask/utils";
import { keccak_256 as keccak256 } from "@noble/hashes/sha3";
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
  const view = createDataView(hash);
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
  const inputBytes = stringToBytes(input);
  const saltBytes = stringToBytes(salt);
  const hash = keccak256(concatBytes([inputBytes, keccak256(saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);
  const { privateKey } = await SLIP10Node.fromDerivationPath({
    derivationPath: [
      mnemonicPhrase,
      `bip32:${magic}`,
      ...computedDerivationPath
    ],
    curve: "secp256k1"
  });
  assert(privateKey, "Failed to derive the entropy.");
  return add0x(privateKey);
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
      return assertExhaustive(curve);
  }
}
async function getNode({
  curve,
  secretRecoveryPhrase,
  path
}) {
  const prefix = getPathPrefix(curve);
  return await SLIP10Node.fromDerivationPath({
    curve,
    derivationPath: [
      secretRecoveryPhrase,
      ...path.slice(1).map((index) => `${prefix}:${index}`)
    ]
  });
}

export {
  selectHooks,
  deriveEntropy,
  getPathPrefix,
  getNode
};
//# sourceMappingURL=chunk-W33UWNA2.mjs.map