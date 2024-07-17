import type { SupportedCurve } from '@metamask/key-tree';
export declare type SnapsDerivationPath = {
    path: ['m', ...string[]];
    curve: SupportedCurve;
    name: string;
};
export declare const SNAPS_DERIVATION_PATHS: SnapsDerivationPath[];
/**
 * Gets the name of a derivation path supported by snaps.
 *
 * @param path - The derivation path.
 * @param curve - The curve used to derive the keys.
 * @returns The name of the derivation path, otherwise null.
 */
export declare function getSnapDerivationPathName(path: SnapsDerivationPath['path'], curve: SupportedCurve): string | null;
/**
 * Gets the name of the SLIP-44 protocol corresponding to the specified
 * `coin_type`.
 *
 * @param coinType - The SLIP-44 `coin_type` value whose name
 * to retrieve.
 * @returns The name of the protocol, otherwise null.
 */
export declare function getSlip44ProtocolName(coinType: number | string): string;
