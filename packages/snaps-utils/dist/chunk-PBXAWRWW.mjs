import {
  isEqual
} from "./chunk-P252LKUT.mjs";

// src/derivation-paths.ts
import slip44 from "@metamask/slip44";
var SNAPS_DERIVATION_PATHS = [
  {
    path: ["m", `44'`, `0'`],
    curve: "ed25519",
    name: "Test BIP-32 Path (ed25519)"
  },
  {
    path: ["m", `44'`, `1'`],
    curve: "secp256k1",
    name: "Testnet"
  },
  {
    path: ["m", `44'`, `0'`],
    curve: "secp256k1",
    name: "Bitcoin Legacy"
  },
  {
    path: ["m", `49'`, `0'`],
    curve: "secp256k1",
    name: "Bitcoin Nested SegWit"
  },
  {
    path: ["m", `49'`, `1'`],
    curve: "secp256k1",
    name: "Bitcoin Testnet Nested SegWit"
  },
  {
    path: ["m", `84'`, `0'`],
    curve: "secp256k1",
    name: "Bitcoin Native SegWit"
  },
  {
    path: ["m", `84'`, `1'`],
    curve: "secp256k1",
    name: "Bitcoin Testnet Native SegWit"
  },
  {
    path: ["m", `44'`, `501'`],
    curve: "ed25519",
    name: "Solana"
  },
  {
    path: ["m", `44'`, `501'`, "0'", "0'"],
    curve: "ed25519",
    name: "Solana"
  },
  {
    path: ["m", `44'`, `2'`],
    curve: "secp256k1",
    name: "Litecoin"
  },
  {
    path: ["m", `44'`, `3'`],
    curve: "secp256k1",
    name: "Dogecoin"
  },
  {
    path: ["m", `44'`, `60'`],
    curve: "secp256k1",
    name: "Ethereum"
  },
  {
    path: ["m", `44'`, `118'`],
    curve: "secp256k1",
    name: "Atom"
  },
  {
    path: ["m", `44'`, `145'`],
    curve: "secp256k1",
    name: "Bitcoin Cash"
  },
  {
    path: ["m", `44'`, `637'`],
    curve: "ed25519",
    name: "Aptos"
  },
  {
    path: ["m", `44'`, `714'`],
    curve: "secp256k1",
    name: "Binance (BNB)"
  },
  {
    path: ["m", `44'`, `784'`],
    curve: "ed25519",
    name: "Sui"
  },
  {
    path: ["m", `44'`, `931'`],
    curve: "secp256k1",
    name: "THORChain (RUNE)"
  },
  {
    path: ["m", `44'`, `330'`],
    curve: "secp256k1",
    name: "Terra (LUNA)"
  },
  {
    path: ["m", `44'`, `459'`],
    curve: "secp256k1",
    name: "Kava"
  },
  {
    path: ["m", `44'`, `529'`],
    curve: "secp256k1",
    name: "Secret Network"
  },
  {
    path: ["m", `44'`, `397'`, `0'`],
    curve: "ed25519",
    name: "NEAR Protocol"
  },
  {
    path: ["m", `44'`, `1'`, `0'`],
    curve: "ed25519",
    name: "Testnet"
  },
  {
    path: ["m", `44'`, `472'`],
    curve: "ed25519",
    name: "Arweave"
  },
  {
    path: ["m", `44'`, `12586'`],
    curve: "secp256k1",
    name: "Mina"
  },
  {
    path: ["m", `44'`, `242'`],
    curve: "ed25519",
    name: "Nimiq"
  },
  {
    path: ["m", `44'`, `1729'`, `0'`, `0'`],
    curve: "ed25519",
    name: "Tezos"
  },
  {
    path: ["m", `1789'`, `0'`],
    curve: "ed25519",
    name: "Vega"
  }
];
function getSnapDerivationPathName(path, curve) {
  const pathMetadata = SNAPS_DERIVATION_PATHS.find(
    (derivationPath) => derivationPath.curve === curve && isEqual(derivationPath.path, path)
  );
  if (pathMetadata) {
    return pathMetadata.name;
  }
  if (curve === "secp256k1" && path[0] === "m" && path[1] === `44'` && path[2].endsWith(`'`)) {
    const coinType = path[2].slice(0, -1);
    return getSlip44ProtocolName(coinType) ?? null;
  }
  return null;
}
function getSlip44ProtocolName(coinType) {
  if (String(coinType) === "1") {
    return "Test Networks";
  }
  return slip44[coinType]?.name ?? null;
}

export {
  SNAPS_DERIVATION_PATHS,
  getSnapDerivationPathName,
  getSlip44ProtocolName
};
//# sourceMappingURL=chunk-PBXAWRWW.mjs.map