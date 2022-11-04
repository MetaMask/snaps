import { assert, assertStruct } from '@metamask/utils';
import {
  array,
  boolean,
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
  union,
} from 'superstruct';
import { CronjobSpecificationArrayStruct } from '../cronjob';
import { NamespacesStruct } from '../namespace';
import { NameStruct, NpmSnapFileNames, VersionStruct } from '../types';

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

    if (path.slice(1).some((e) => !BIP32_INDEX_REGEX.test(e))) {
      return 'Path must be a valid BIP-32 derivation path array.';
    }

    return true;
  },
);

const bip32entropy = <T extends { path: string[]; curve: string }, S>(
  struct: Struct<T, S>,
) =>
  refine(struct, 'BIP-32 entropy', (value) => {
    if (
      value.curve === 'ed25519' &&
      value.path.slice(1).some((e) => !e.endsWith("'"))
    ) {
      return 'Ed25519 does not support unhardened paths.';
    }

    return true;
  });

// Used outside @metamask/snap-utils
export const Bip32EntropyStruct = bip32entropy(
  object({
    path: Bip32PathStruct,
    curve: enums(['ed25519', 'secp256k1']),
  }),
);
export type Bip32Entropy = Infer<typeof Bip32EntropyStruct>;

export const Bip32PublicKeyStruct = bip32entropy(
  object({
    path: Bip32PathStruct,
    curve: enums(['ed225519', 'secp256k1']),
    compressed: optional(boolean()),
  }),
);
export type Bip32PublicKey = Infer<typeof Bip32PublicKeyStruct>;

const PermissionsStruct = type({
  'endowment:long-running': optional(object({})),
  'endowment:network-access': optional(object({})),
  'endowment:transaction-insight': optional(object({})),
  'endowment:cronjob': optional(
    object({ jobs: CronjobSpecificationArrayStruct }),
  ),
  snap_confirm: optional(object({})),
  snap_manageState: optional(object({})),
  snap_notify: optional(object({})),
  snap_getBip32Entropy: optional(array(Bip32EntropyStruct)),
  snap_getBip32PublicKey: optional(array(Bip32PublicKeyStruct)),
  snap_getBip44Entropy: optional(
    array(object({ coinType: size(integer(), 0, 2 ** 32 - 1) })),
  ),
  'endowment:keyring': optional(
    object({
      namespaces: NamespacesStruct,
    }),
  ),
});
export type SnapPermissions = Infer<typeof PermissionsStruct>;

export const SnapManifestStruct = object({
  version: VersionStruct,
  description: size(string(), 1, 280),
  proposedName: size(
    pattern(
      string(),
      /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u,
    ),
    1,
    214,
  ),
  repository: optional(
    object({
      type: size(string(), 1, Infinity),
      url: size(string(), 1, Infinity),
    }),
  ),
  source: object({
    shasum: size(base64(string(), { paddingRequired: true }), 44, 44),
    location: object({
      npm: object({
        filePath: size(string(), 1, Infinity),
        iconPath: optional(size(string(), 1, Infinity)),
        packageName: NameStruct,
        registry: union([
          literal('https://registry.npmjs.org'),
          literal('https://registry.npmjs.org/'),
        ]),
      }),
    }),
  }),
  initialPermissions: PermissionsStruct,
  manifestVersion: literal('0.1'),
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
