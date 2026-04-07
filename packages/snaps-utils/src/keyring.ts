import type { Infer } from '@metamask/superstruct';
import {
  array,
  boolean,
  enums,
  nonempty,
  object,
  optional,
} from '@metamask/superstruct';
import type { AssertionErrorConstructor } from '@metamask/utils';
import { assertStruct, CaipChainIdStruct } from '@metamask/utils';

/**
 * Supported encoding formats for private keys.
 *
 * Mirrors `PrivateKeyEncoding` from `@metamask/keyring-api` to avoid pulling
 * in that package's Node.js-only transitive dependencies into browser bundles.
 */
const PrivateKeyEncodingStruct = enums(['hexadecimal', 'base58']);

/**
 * Supported account types for keyring accounts.
 *
 * Mirrors `KeyringAccountTypeStruct` from `@metamask/keyring-api`.
 */
const KeyringAccountTypeStruct = enums([
  'eip155:eoa',
  'eip155:erc4337',
  'bip122:p2pkh',
  'bip122:p2sh',
  'bip122:p2wpkh',
  'bip122:p2tr',
  'solana:data-account',
  'tron:eoa',
  'entropy:account',
]);

/**
 * Struct for the capabilities object supported by a keyring Snap.
 *
 * Mirrors `KeyringCapabilitiesStruct` from `@metamask/keyring-api` to avoid
 * pulling in that package's Node.js-only transitive dependencies into browser
 * bundles (via `@ethereumjs/util` → `micro-ftch`). Uses `optional` rather than
 * `exactOptional` to remain compatible with `Describe<InitialPermissions>`.
 *
 * Keep in sync with `KeyringCapabilitiesStruct` in `@metamask/keyring-api`.
 */
const CapabilitiesStruct = object({
  scopes: nonempty(array(CaipChainIdStruct)),
  bip44: optional(
    object({
      derivePath: optional(boolean()),
      deriveIndex: optional(boolean()),
      deriveIndexRange: optional(boolean()),
      discover: optional(boolean()),
    }),
  ),
  privateKey: optional(
    object({
      importFormats: optional(
        array(
          object({
            encoding: PrivateKeyEncodingStruct,
            type: optional(KeyringAccountTypeStruct),
          }),
        ),
      ),
      exportFormats: optional(
        array(object({ encoding: PrivateKeyEncodingStruct })),
      ),
    }),
  ),
  custom: optional(
    object({
      createAccounts: optional(boolean()),
    }),
  ),
});

export const KeyringCapabilitiesStruct = object({
  capabilities: optional(CapabilitiesStruct),
});

export type KeyringCapabilities = Infer<typeof KeyringCapabilitiesStruct>;

/**
 * Assert that the given value is a valid {@link KeyringCapabilities} object.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link KeyringCapabilities} object.
 */
export function assertIsKeyringCapabilities(
  value: unknown,
  ErrorWrapper?: AssertionErrorConstructor,
): asserts value is KeyringCapabilities {
  assertStruct(
    value,
    KeyringCapabilitiesStruct,
    'Invalid keyring capabilities',
    ErrorWrapper,
  );
}
