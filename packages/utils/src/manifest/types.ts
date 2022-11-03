import { valid as validSemver } from 'semver';
import {
  array,
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
  type,
} from 'superstruct';
import { assertStruct } from '../assert';
import { NamespacesStruct } from '../namespace';

/**
 * A struct for validating a base64 string.
 *
 * NOTE: This is basic validation to reduce computation time.
 */
export const Base64Struct = pattern(string(), /^[A-Za-z0-9+\\/]*={0,2}$/);

/**
 * A struct for validating a version string.
 */
export const VersionStruct = refine(string(), 'Version', (value) => {
  const isValid = validSemver(value) !== null;
  if (!isValid) {
    return `Expected valid SemVer version, got ${value}`;
  }
  return true;
});

export const NameStruct = size(
  pattern(
    string(),
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u,
  ),
  1,
  214,
);

const EnginesStruct = type({ snaps: VersionStruct });

const INDEX_REGEX = /^\d+'?$/u;
// Used outside @metamask/snap-utils
export const Bip32ParametersStruct = refine(
  object({
    path: refine(array(string()), 'BIP-32 path', (path) => {
      if (path.length === 0) {
        return 'Path must be a non-empty BIP-32 derivation path array';
      }

      if (path[0] !== 'm') {
        return 'Path must start with "m".';
      }

      if (path.length < 3) {
        return 'Paths must have a length of at least three.';
      }

      if (path.slice(1).some((e) => !INDEX_REGEX.test(e))) {
        return 'Path must be a valid BIP-32 derivation path array.';
      }

      return true;
    }),
    curve: enums(['ed25519', 'secp256k1']),
  }),
  'BIP-32',
  (value) => {
    if (
      value.curve === 'ed25519' &&
      value.path.slice(1).some((e) => !e.endsWith("'"))
    ) {
      return 'Ed25519 does not support unhardened paths.';
    }

    return true;
  },
);
export type Bip32Parameters = Infer<typeof Bip32ParametersStruct>;

const PermissionsStruct = type({
  'endowment:long-running': optional(literal({})),
  'endowment:network-access': optional(literal({})),
  'endowment:transaction-insight': optional(literal({})),
  snap_confirm: optional(literal({})),
  snap_manageState: optional(literal({})),
  snap_notify: optional(literal({})),
  snap_getBip32Entropy: optional(Bip32ParametersStruct),
  snap_getBip44Entropy: optional(
    array(object({ coinType: size(integer(), 0, 2 ** 32) })),
  ),
  'endowment:keyring': optional(
    object({
      namespaces: NamespacesStruct,
    }),
  ),
});
export type SnapPermissions = Infer<typeof PermissionsStruct>;

export const SnapMetaStruct = type({
  proposedName: size(
    pattern(
      string(),
      /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u,
    ),
    1,
    214,
  ),
  checksum: object({
    algorithm: literal('sha-256'),
    hash: size(Base64Struct, 44, 44),
  }),
  permissions: PermissionsStruct,
  icon: optional(size(string(), 1, Infinity)),
});
export type SnapMeta = Infer<typeof SnapMetaStruct>;

// Note we use `type` instead of `object` here, because the latter does not
// allow unknown keys.
export const SnapPackageJsonStruct = type({
  version: VersionStruct,
  name: NameStruct,
  description: string(),
  main: size(string(), 1, Infinity),
  engines: EnginesStruct,
  snap: SnapMetaStruct,
});

export type SnapPackageJson = Infer<typeof SnapPackageJsonStruct>;

/**
 * Check if the given value is a valid {@link SnapPackageJson} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link SnapPackageJson} object.
 */
export function isSnapPackageJson(value: unknown): value is SnapPackageJson {
  return is(value, SnapPackageJsonStruct);
}

/**
 * Asserts that the given value is a valid {@link SnapPackageJson} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link SnapPackageJson} object.
 */
export function assertIsSnapPackageJson(
  value: unknown,
): asserts value is SnapPackageJson {
  assertStruct(value, SnapPackageJsonStruct, `"package.json" is invalid`);
}
