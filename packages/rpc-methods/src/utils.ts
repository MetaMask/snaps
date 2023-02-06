import { HardenedBIP32Node, SLIP10Node } from '@metamask/key-tree';
import { MagicValue } from '@metamask/snaps-utils';
import {
  add0x,
  assert,
  concatBytes,
  createDataView,
  Hex,
  stringToBytes,
} from '@metamask/utils';
import { keccak_256 as keccak256 } from '@noble/hashes/sha3';
import { literal, Struct } from 'superstruct';

const HARDENED_VALUE = 0x80000000;

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
 * Checks if array `a` is equal to array `b`. Note that this does not do a deep
 * equality check. It only checks if the arrays are the same length and if each
 * element in `a` is equal to (`===`) the corresponding element in `b`.
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare.
 * @returns `true` if the arrays are equal, `false` otherwise.
 */
export function isEqual(a: unknown[], b: unknown[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
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

type DeriveEntropyOptions = {
  /**
   * The input value to derive entropy from.
   */
  input: string;

  /**
   * An optional salt to use when deriving entropy.
   */
  salt?: string;

  /**
   * The mnemonic phrase to use for entropy derivation.
   */
  mnemonicPhrase: Uint8Array;

  /**
   * A hardened BIP-32 index, which is used to derive the root key from the
   * mnemonic phrase.
   */
  magic: MagicValue;
};

/**
 * Derive entropy from the given mnemonic phrase and salt.
 *
 * This is based on the reference implementation of
 * [SIP-6](https://metamask.github.io/SIPs/SIPS/sip-6).
 *
 * @param options - The options for entropy derivation.
 * @param options.input - The input value to derive entropy from.
 * @param options.salt - An optional salt to use when deriving entropy.
 * @param options.mnemonicPhrase - The mnemonic phrase to use for entropy
 * derivation.
 * @param options.magic - A hardened BIP-32 index, which is used to derive the
 * root key from the mnemonic phrase.
 * @returns The derived entropy.
 */
export async function deriveEntropy({
  input,
  salt = '',
  mnemonicPhrase,
  magic,
}: DeriveEntropyOptions): Promise<Hex> {
  const inputBytes = stringToBytes(input);
  const saltBytes = stringToBytes(salt);

  // Get the derivation path from the snap ID.
  const hash = keccak256(concatBytes([inputBytes, keccak256(saltBytes)]));
  const computedDerivationPath = getDerivationPathArray(hash);

  // Derive the private key using BIP-32.
  const { privateKey } = await SLIP10Node.fromDerivationPath({
    derivationPath: [
      mnemonicPhrase,
      `bip32:${magic}`,
      ...computedDerivationPath,
    ],
    curve: 'secp256k1',
  });

  // This should never happen, but this keeps TypeScript happy.
  assert(privateKey, 'Failed to derive the entropy.');

  return add0x(privateKey);
}

/**
 * Get the enum values as union type. This allows using both the enum string
 * values and the enum itself as values.
 *
 * Note: This only works for string enums.
 *
 * @example
 * ```typescript
 * enum Foo {
 *   Bar = 'bar',
 *   Baz = 'baz',
 * }
 *
 * type FooValue = EnumToUnion<Foo>;
 * // FooValue is 'bar' | 'baz'
 *
 * const foo: FooValue = Foo.Bar; // Works
 * const foo: FooValue = 'bar'; // Also works
 * ```
 */
export type EnumToUnion<Type extends string> = `${Type}`;

/**
 * Superstruct struct for validating an enum value. This allows using both the
 * enum string values and the enum itself as values.
 *
 * @param constant - The enum to validate against.
 * @returns The superstruct struct.
 */
export function enumValue<T extends string>(
  constant: T,
): Struct<EnumToUnion<T>, EnumToUnion<T>> {
  return literal(constant as EnumToUnion<T>);
}
