import type {
  HardenedBIP32Node,
  BIP32Node,
  SLIP10PathNode,
  SupportedCurve,
  CryptographicFunctions,
} from '@metamask/key-tree';
import { SLIP10Node } from '@metamask/key-tree';
import { rpcErrors } from '@metamask/rpc-errors';
import type { MagicValue } from '@metamask/snaps-utils';
import { refine, string } from '@metamask/superstruct';
import {
  assertExhaustive,
  add0x,
  assert,
  concatBytes,
  createDataView,
  stringToBytes,
} from '@metamask/utils';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';

import { SnapEndowments } from './endowments';

const HARDENED_VALUE = 0x80000000;

export const FORBIDDEN_KEYS = ['constructor', '__proto__', 'prototype'];

/**
 * Maps an interface with method hooks to an object, using the keys of the
 * interface, and `true` as value. This ensures that the `methodHooks` object
 * has the same values as the interface.
 */
export type MethodHooksObject<HooksType extends Record<string, unknown>> = {
  [Key in keyof HooksType]: true;
};

/**
 * Returns the subset of the specified `hooks` that are included in the
 * `hookNames` object. This is a Principle of Least Authority (POLA) measure
 * to ensure that each RPC method implementation only has access to the
 * API "hooks" it needs to do its job.
 *
 * @param hooks - The hooks to select from.
 * @param hookNames - The names of the hooks to select.
 * @returns The selected hooks.
 * @template Hooks - The hooks to select from.
 * @template HookName - The names of the hooks to select.
 */
export function selectHooks<
  Hooks extends Record<string, unknown>,
  HookName extends keyof Hooks,
>(
  hooks: Hooks,
  hookNames?: Record<HookName, boolean>,
): Pick<Hooks, HookName> | undefined {
  if (hookNames) {
    return Object.keys(hookNames).reduce<Partial<Pick<Hooks, HookName>>>(
      (hookSubset, _hookName) => {
        const hookName = _hookName as HookName;
        hookSubset[hookName] = hooks[hookName];
        return hookSubset;
      },
      {},
    ) as Pick<Hooks, HookName>;
  }
  return undefined;
}

/**
 * Get a BIP-32 derivation path array from a hash, which is compatible with
 * `@metamask/key-tree`. The hash is assumed to be 32 bytes long.
 *
 * @param hash - The hash to derive indices from.
 * @returns The derived indices as a {@link HardenedBIP32Node} array.
 */
function getDerivationPathArray(hash: Uint8Array): HardenedBIP32Node[] {
  const array: HardenedBIP32Node[] = [];
  const view = createDataView(hash);

  for (let index = 0; index < 8; index++) {
    const uint32 = view.getUint32(index * 4);

    // This is essentially `index | 0x80000000`. Because JavaScript numbers are
    // signed, we use the bitwise unsigned right shift operator to ensure that
    // the result is a positive number.
    // eslint-disable-next-line no-bitwise
    const pathIndex = (uint32 | HARDENED_VALUE) >>> 0;
    array.push(`bip32:${pathIndex - HARDENED_VALUE}'` as const);
  }

  return array;
}

type BaseDeriveEntropyOptions = {
  /**
   * The input value to derive entropy from.
   */
  input: string;

  /**
   * An optional salt to use when deriving entropy.
   */
  salt?: string;

  /**
   * A hardened BIP-32 index, which is used to derive the root key from the
   * mnemonic phrase.
   */
  magic: MagicValue;

  /**
   * The cryptographic functions to use for the derivation.
   */
  cryptographicFunctions: CryptographicFunctions | undefined;
};

type SeedDeriveEntropyOptions = BaseDeriveEntropyOptions & {
  /**
   * The mnemonic seed to use for entropy derivation.
   */
  seed: Uint8Array;
};

/**
 * Get the derivation path to use for entropy derivation.
 *
 * This is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param options - The options for entropy derivation.
 * @param options.input - The input value to derive entropy from.
 * @param options.salt - An optional salt to use when deriving entropy.
 * @param options.magic - A hardened BIP-32 index, which is used to derive the
 * root key from the mnemonic phrase.
 * @returns The derivation path to be used for entropy key derivation.
 */
function getEntropyDerivationPath({
  input,
  salt,
  magic,
}: Required<Omit<BaseDeriveEntropyOptions, 'cryptographicFunctions'>>):
  | BIP32Node[]
  | SLIP10PathNode[] {
  const inputBytes = stringToBytes(input);
  const saltBytes = stringToBytes(salt);

  // Get the derivation path from the snap ID.
  const hash = keccak256(concatBytes([inputBytes, keccak256(saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);

  return [`bip32:${magic}`, ...computedDerivationPath];
}

/**
 * Derive entropy from the given mnemonic seed and salt.
 *
 * This is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param options - The options for entropy derivation.
 * @param options.input - The input value to derive entropy from.
 * @param options.salt - An optional salt to use when deriving entropy.
 * @param options.seed - The mnemonic seed to use for entropy
 * derivation.
 * @param options.magic - A hardened BIP-32 index, which is used to derive the
 * root key from the mnemonic phrase.
 * @param options.cryptographicFunctions - The cryptographic functions to use
 * for the derivation.
 * @returns The derived entropy.
 */
export async function deriveEntropyFromSeed({
  input,
  salt = '',
  seed,
  magic,
  cryptographicFunctions,
}: SeedDeriveEntropyOptions) {
  const computedDerivationPath = getEntropyDerivationPath({
    input,
    salt,
    magic,
  });

  // Derive the private key using BIP-32.
  const { privateKey } = await SLIP10Node.fromSeed(
    {
      derivationPath: [seed, ...computedDerivationPath],
      curve: 'secp256k1',
    },
    cryptographicFunctions,
  );

  // This should never happen, but this keeps TypeScript happy.
  assert(privateKey, 'Failed to derive the entropy.');

  return add0x(privateKey);
}

/**
 * Get the path prefix to use for key derivation in `key-tree`. This assumes the
 * following:
 *
 * - The Secp256k1 curve always uses the BIP-32 specification.
 * - The Ed25519 curve always uses the SLIP-10 specification.
 * - The BIP-32-Ed25519 curve always uses the CIP-3 specification.
 *
 * While this does not matter in most situations (no known case at the time of
 * writing), `key-tree` requires a specific specification to be used.
 *
 * @param curve - The curve to get the path prefix for. The curve is NOT
 * validated by this function.
 * @returns The path prefix, i.e., `bip32` or `slip10`.
 */
export function getPathPrefix(
  curve: SupportedCurve,
): 'bip32' | 'slip10' | 'cip3' {
  switch (curve) {
    case 'secp256k1':
      return 'bip32';
    case 'ed25519':
      return 'slip10';
    case 'ed25519Bip32':
      return 'cip3';
    default:
      return assertExhaustive(curve);
  }
}

type BaseGetNodeArgs = {
  curve: SupportedCurve;
  path: string[];
  cryptographicFunctions: CryptographicFunctions | undefined;
};

type GetNodeArgsMnemonic = BaseGetNodeArgs & {
  secretRecoveryPhrase: Uint8Array;
};

type GetNodeArgsSeed = BaseGetNodeArgs & {
  seed: Uint8Array;
};

/**
 * Get a `key-tree`-compatible node.
 *
 * Note: This function assumes that all the parameters have been validated
 * beforehand.
 *
 * @param options - The derivation options.
 * @param options.curve - The curve to use for derivation.
 * @param options.secretRecoveryPhrase - The secret recovery phrase to use for
 * derivation.
 * @param options.path - The derivation path to use as array, starting with an
 * "m" as the first item.
 * @param options.cryptographicFunctions - The cryptographic functions to use
 * for the node.
 * @returns The `key-tree` SLIP-10 node.
 */
export async function getNodeFromMnemonic({
  curve,
  secretRecoveryPhrase,
  path,
  cryptographicFunctions,
}: GetNodeArgsMnemonic) {
  const prefix = getPathPrefix(curve);

  return await SLIP10Node.fromDerivationPath(
    {
      curve,
      derivationPath: [
        secretRecoveryPhrase,
        ...(path.slice(1).map((index) => `${prefix}:${index}`) as
          | BIP32Node[]
          | SLIP10PathNode[]),
      ],
    },
    cryptographicFunctions,
  );
}

/**
 * Get a `key-tree`-compatible node.
 *
 * Note: This function assumes that all the parameters have been validated
 * beforehand.
 *
 * @param options - The derivation options.
 * @param options.curve - The curve to use for derivation.
 * @param options.seed - The BIP-39 to use for
 * derivation.
 * @param options.path - The derivation path to use as array, starting with an
 * "m" as the first item.
 * @param options.cryptographicFunctions - The cryptographic functions to use
 * for the node.
 * @returns The `key-tree` SLIP-10 node.
 */
export async function getNodeFromSeed({
  curve,
  seed,
  path,
  cryptographicFunctions,
}: GetNodeArgsSeed) {
  const prefix = getPathPrefix(curve);

  return await SLIP10Node.fromSeed(
    {
      curve,
      derivationPath: [
        seed,
        ...(path.slice(1).map((index) => `${prefix}:${index}`) as
          | BIP32Node[]
          | SLIP10PathNode[]),
      ],
    },
    cryptographicFunctions,
  );
}

/**
 * Validate the key of a state object.
 *
 * @param key - The key to validate.
 * @returns `true` if the key is valid, `false` otherwise.
 */
export function isValidStateKey(key: string | undefined) {
  if (key === undefined) {
    return true;
  }

  return key.split('.').every((part) => part.length > 0);
}

export const StateKeyStruct = refine(string(), 'state key', (value) => {
  if (!isValidStateKey(value)) {
    return 'Invalid state key. Each part of the key must be non-empty.';
  }

  return true;
});

/**
 * Get a value using the entropy source hooks: getMnemonic or getMnemonicSeed.
 * This function calls the passed hook and handles any errors that occur,
 * throwing formatted JSON-RPC errors.
 *
 * @param hook - The hook.
 * @param source - The entropy source to use.
 * @returns The secret recovery phrase.
 */
export async function getValueFromEntropySource(
  hook: (source?: string | undefined) => Promise<Uint8Array>,
  source?: string | undefined,
): Promise<Uint8Array> {
  try {
    return await hook(source);
  } catch (error) {
    if (error instanceof Error) {
      throw rpcErrors.invalidParams({
        message: error.message,
      });
    }

    throw rpcErrors.internal({
      message: 'An unknown error occurred.',
      data: {
        error: error.toString(),
      },
    });
  }
}

/**
 * The permissions that allow a Snap to show UI. Snaps must have at least one
 * of these permissions to use the interface management RPC methods.
 */
export const UI_PERMISSIONS = [
  'snap_dialog',
  'snap_notify',
  SnapEndowments.HomePage,
  SnapEndowments.SettingsPage,
  SnapEndowments.TransactionInsight,
  SnapEndowments.SignatureInsight,
] as const;
