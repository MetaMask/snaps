import { assert, assertStruct } from '@metamask/utils';
import {
  array,
  boolean,
  coerce,
  create,
  enums,
  Infer,
  integer,
  is,
  literal,
  object,
  optional,
  pattern,
  refine,
  size,
  string,
  Struct,
  type,
} from 'superstruct';

import { CronjobSpecificationArrayStruct } from '../cronjob';
import { RpcOriginsStruct } from '../json-rpc';
import { NamespacesStruct } from '../namespace';
import { normalizeRelative } from '../path';
import { NpmSnapFileNames } from '../types';
import { VersionStruct } from '../versions';

// 0xd36e6170 - 0x80000000
export const SIP_6_MAGIC_VALUE = `1399742832'` as `${number}'`;

// BIP-43 purposes that cannot be used for entropy derivation. These are in the
// string form, ending with `'`.
const FORBIDDEN_PURPOSES: string[] = [SIP_6_MAGIC_VALUE];

export type Base64Opts = {
  /**
   * Is the `=` padding at the end required or not.
   *
   * @default false
   */
  // Padding is optional in RFC 4648, that's why the default value is false
  paddingRequired?: boolean;
  /**
   * Which character set should be used.
   * The sets are based on {@link https://datatracker.ietf.org/doc/html/rfc4648 RFC 4648}.
   *
   * @default 'base64'
   */
  characterSet?: 'base64' | 'base64url';
};

/**
 * Ensure that a provided string-based struct is valid base64.
 *
 * @param struct - The string based struct.
 * @param opts - Optional options to specialize base64 validation. See {@link Base64Opts} documentation.
 * @returns A superstruct validating base64.
 */
export const base64 = <T extends string, S>(
  struct: Struct<T, S>,
  opts: Base64Opts = {},
) => {
  const paddingRequired = opts.paddingRequired ?? false;
  const characterSet = opts.characterSet ?? 'base64';

  let letters: string;
  if (characterSet === 'base64') {
    letters = String.raw`[A-Za-z0-9+\/]`;
  } else {
    assert(characterSet === 'base64url');
    letters = String.raw`[-_A-Za-z0-9]`;
  }

  let re: RegExp;
  if (paddingRequired) {
    re = new RegExp(
      `^(?:${letters}{4})*(?:${letters}{3}=|${letters}{2}==)?$`,
      'u',
    );
  } else {
    re = new RegExp(
      `^(?:${letters}{4})*(?:${letters}{2,3}|${letters}{3}=|${letters}{2}==)?$`,
      'u',
    );
  }

  return pattern(struct, re);
};

const BIP32_INDEX_REGEX = /^\d+'?$/u;
export const Bip32PathStruct = refine(
  array(string()),
  'BIP-32 path',
  (path) => {
    if (path.length === 0) {
      return 'Path must be a non-empty BIP-32 derivation path array';
    }

    if (path[0] !== 'm') {
      return 'Path must start with "m".';
    }

    if (path.length < 3) {
      return 'Paths must have a length of at least three.';
    }

    if (path.slice(1).some((part) => !BIP32_INDEX_REGEX.test(part))) {
      return 'Path must be a valid BIP-32 derivation path array.';
    }

    if (FORBIDDEN_PURPOSES.includes(path[1])) {
      return `The purpose "${path[1]}" is not allowed for entropy derivation.`;
    }

    return true;
  },
);

export const bip32entropy = <T extends { path: string[]; curve: string }, S>(
  struct: Struct<T, S>,
) =>
  refine(struct, 'BIP-32 entropy', (value) => {
    if (
      value.curve === 'ed25519' &&
      value.path.slice(1).some((part) => !part.endsWith("'"))
    ) {
      return 'Ed25519 does not support unhardened paths.';
    }

    return true;
  });

// Used outside @metamask/snap-utils
export const Bip32EntropyStruct = bip32entropy(
  type({
    path: Bip32PathStruct,
    curve: enums(['ed25519', 'secp256k1']),
  }),
);

export type Bip32Entropy = Infer<typeof Bip32EntropyStruct>;

export const SnapGetBip32EntropyPermissionsStruct = size(
  array(Bip32EntropyStruct),
  1,
  Infinity,
);

/* eslint-disable @typescript-eslint/naming-convention */
export const PermissionsStruct = type({
  'endowment:long-running': optional(object({})),
  'endowment:network-access': optional(object({})),
  'endowment:transaction-insight': optional(
    object({
      allowTransactionOrigin: optional(boolean()),
    }),
  ),
  'endowment:cronjob': optional(
    object({ jobs: CronjobSpecificationArrayStruct }),
  ),
  'endowment:rpc': optional(RpcOriginsStruct),
  snap_confirm: optional(object({})),
  snap_manageState: optional(object({})),
  snap_notify: optional(object({})),
  snap_getBip32Entropy: optional(SnapGetBip32EntropyPermissionsStruct),
  snap_getBip32PublicKey: optional(SnapGetBip32EntropyPermissionsStruct),
  snap_getBip44Entropy: optional(
    size(
      array(object({ coinType: size(integer(), 0, 2 ** 32 - 1) })),
      1,
      Infinity,
    ),
  ),
  snap_getEntropy: optional(object({})),
  'endowment:keyring': optional(
    object({
      namespaces: NamespacesStruct,
    }),
  ),
});
/* eslint-enable @typescript-eslint/naming-convention */

const relativePath = <Type extends string>(struct: Struct<Type>) =>
  coerce(struct, struct, (value) => normalizeRelative(value));

export type SnapPermissions = Infer<typeof PermissionsStruct>;

export const SnapManifestStruct = object({
  name: size(
    pattern(
      string(),
      /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u,
    ),
    1,
    214,
  ),
  description: size(string(), 1, 280),
  checksum: size(base64(string(), { paddingRequired: true }), 44, 44),
  source: relativePath(size(string(), 1, Infinity)),
  icon: optional(relativePath(size(string(), 1, Infinity))),
  permissions: PermissionsStruct,
  version: VersionStruct,
  manifestVersion: literal(2),
});

export type SnapManifest = Infer<typeof SnapManifestStruct>;

/**
 * Check if the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link SnapManifest} object.
 */
export function isSnapManifest(value: unknown): value is SnapManifest {
  return is(value, SnapManifestStruct);
}

/**
 * Assert that the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link SnapManifest} object.
 */
export function assertIsSnapManifest(
  value: unknown,
): asserts value is SnapManifest {
  assertStruct(
    value,
    SnapManifestStruct,
    `"${NpmSnapFileNames.Manifest}" is invalid`,
  );
}

/**
 * Creates a {@link SnapManifest} object from JSON.
 *
 *
 * @param value - The value to check.
 * @throws If the value cannot be coerced to a {@link SnapManifest} object.
 * @returns The created {@link SnapManifest} object.
 */
export function createSnapManifest(value: unknown): SnapManifest {
  // TODO: Add a utility to prefix these errors similar to assertStruct
  return create(value, SnapManifestStruct);
}
