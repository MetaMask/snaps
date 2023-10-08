import { SLIP10Node } from '@metamask/key-tree';
import type { MagicValue } from '@metamask/snaps-utils';
import type { Hex } from '@metamask/utils';
/**
 * Maps an interface with method hooks to an object, using the keys of the
 * interface, and `true` as value. This ensures that the `methodHooks` object
 * has the same values as the interface.
 */
export declare type MethodHooksObject<HooksType extends Record<string, unknown>> = {
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
export declare function selectHooks<Hooks extends Record<string, unknown>, HookName extends keyof Hooks>(hooks: Hooks, hookNames?: Record<HookName, boolean>): Pick<Hooks, HookName> | undefined;
declare type DeriveEntropyOptions = {
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
export declare function deriveEntropy({ input, salt, mnemonicPhrase, magic, }: DeriveEntropyOptions): Promise<Hex>;
/**
 * Get the path prefix to use for key derivation in `key-tree`. This assumes the
 * following:
 *
 * - The Secp256k1 curve always use the BIP-32 specification.
 * - The Ed25519 curve always use the SLIP-10 specification.
 *
 * While this does not matter in most situations (no known case at the time of
 * writing), `key-tree` requires a specific specification to be used.
 *
 * @param curve - The curve to get the path prefix for. The curve is NOT
 * validated by this function.
 * @returns The path prefix, i.e., `secp256k1` or `ed25519`.
 */
export declare function getPathPrefix(curve: 'secp256k1' | 'ed25519'): 'bip32' | 'slip10';
declare type GetNodeArgs = {
    curve: 'secp256k1' | 'ed25519';
    secretRecoveryPhrase: Uint8Array;
    path: string[];
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
 */
export declare function getNode({ curve, secretRecoveryPhrase, path, }: GetNodeArgs): Promise<SLIP10Node>;
export {};
