import type { SupportedCurve } from '@metamask/key-tree';
import slip44 from '@metamask/slip44';

import { isEqual } from './array';

export type SnapsDerivationPath = {
  path: ['m', ...string[]];
  curve: SupportedCurve;
  name: string;
};

export const SNAPS_DERIVATION_PATHS: SnapsDerivationPath[] = [
  {
    path: ['m', `44'`, `0'`],
    curve: 'ed25519',
    name: 'Test BIP-32 Path (ed25519)',
  },
  {
    path: ['m', `44'`, `1'`],
    curve: 'secp256k1',
    name: 'Testnet',
  },
  {
    path: ['m', `44'`, `0'`],
    curve: 'secp256k1',
    name: 'Bitcoin Legacy',
  },
  {
    path: ['m', `49'`, `0'`],
    curve: 'secp256k1',
    name: 'Bitcoin Nested SegWit',
  },
  {
    path: ['m', `49'`, `1'`],
    curve: 'secp256k1',
    name: 'Bitcoin Testnet Nested SegWit',
  },
  {
    path: ['m', `84'`, `0'`],
    curve: 'secp256k1',
    name: 'Bitcoin Native SegWit',
  },
  {
    path: ['m', `84'`, `1'`],
    curve: 'secp256k1',
    name: 'Bitcoin Testnet Native SegWit',
  },
  {
    path: ['m', `44'`, `501'`],
    curve: 'ed25519',
    name: 'Solana',
  },
  {
    path: ['m', `44'`, `501'`, "0'", "0'"],
    curve: 'ed25519',
    name: 'Solana',
  },
  {
    path: ['m', `44'`, `2'`],
    curve: 'secp256k1',
    name: 'Litecoin',
  },
  {
    path: ['m', `44'`, `3'`],
    curve: 'secp256k1',
    name: 'Dogecoin',
  },
  {
    path: ['m', `44'`, `60'`],
    curve: 'secp256k1',
    name: 'Ethereum',
  },
  {
    path: ['m', `44'`, `118'`],
    curve: 'secp256k1',
    name: 'Atom',
  },
  {
    path: ['m', `44'`, `145'`],
    curve: 'secp256k1',
    name: 'Bitcoin Cash',
  },
  {
    path: ['m', `44'`, `637'`],
    curve: 'ed25519',
    name: 'Aptos',
  },
  {
    path: ['m', `44'`, `714'`],
    curve: 'secp256k1',
    name: 'Binance (BNB)',
  },
  {
    path: ['m', `44'`, `784'`],
    curve: 'ed25519',
    name: 'Sui',
  },
  {
    path: ['m', `44'`, `931'`],
    curve: 'secp256k1',
    name: 'THORChain (RUNE)',
  },
  {
    path: ['m', `44'`, `330'`],
    curve: 'secp256k1',
    name: 'Terra (LUNA)',
  },
  {
    path: ['m', `44'`, `459'`],
    curve: 'secp256k1',
    name: 'Kava',
  },
  {
    path: ['m', `44'`, `529'`],
    curve: 'secp256k1',
    name: 'Secret Network',
  },
  {
    path: ['m', `44'`, `397'`, `0'`],
    curve: 'ed25519',
    name: 'NEAR Protocol',
  },
  {
    path: ['m', `44'`, `1'`, `0'`],
    curve: 'ed25519',
    name: 'Testnet',
  },
  {
    path: ['m', `44'`, `472'`],
    curve: 'ed25519',
    name: 'Arweave',
  },
  {
    path: ['m', `44'`, `12586'`],
    curve: 'secp256k1',
    name: 'Mina',
  },
  {
    path: ['m', `44'`, `1729'`, `0'`, `0'`],
    curve: 'ed25519',
    name: 'Tezos',
  },
  {
    path: ['m', `1789'`, `0'`],
    curve: 'ed25519',
    name: 'Vega',
  },
];

/**
 * Gets the name of a derivation path supported by snaps.
 *
 * @param path - The derivation path.
 * @param curve - The curve used to derive the keys.
 * @returns The name of the derivation path, otherwise null.
 */
export function getSnapDerivationPathName(
  path: SnapsDerivationPath['path'],
  curve: SupportedCurve,
): string | null {
  const pathMetadata = SNAPS_DERIVATION_PATHS.find(
    (derivationPath) =>
      derivationPath.curve === curve && isEqual(derivationPath.path, path),
  );

  if (pathMetadata) {
    return pathMetadata.name;
  }

  // If the curve is secp256k1 and the path is a valid BIP44 path
  // we try looking for the network/protocol name in SLIP44
  if (
    curve === 'secp256k1' &&
    path[0] === 'm' &&
    path[1] === `44'` &&
    path[2].endsWith(`'`)
  ) {
    const coinType = path[2].slice(0, -1);
    return getSlip44ProtocolName(coinType) ?? null;
  }

  return null;
}

/**
 * Gets the name of the SLIP-44 protocol corresponding to the specified
 * `coin_type`.
 *
 * @param coinType - The SLIP-44 `coin_type` value whose name
 * to retrieve.
 * @returns The name of the protocol, otherwise null.
 */
export function getSlip44ProtocolName(coinType: number | string) {
  if (String(coinType) === '1') {
    return 'Test Networks';
  }

  return slip44[coinType as keyof typeof slip44]?.name ?? null;
}
