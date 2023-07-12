import { isValidBIP32PathSegment } from '@metamask/key-tree';
import {
  assertStruct,
  ChecksumStruct,
  VersionStruct,
  isValidSemVerRange,
} from '@metamask/utils';
import type { Infer, Struct } from 'superstruct';
import {
  array,
  boolean,
  create,
  enums,
  integer,
  is,
  literal,
  object,
  optional,
  pattern,
  refine,
  record,
  size,
  string,
  type,
  union,
} from 'superstruct';

import { isEqual } from '../array';
import { CronjobSpecificationArrayStruct } from '../cronjob';
import { SIP_6_MAGIC_VALUE, STATE_ENCRYPTION_MAGIC_VALUE } from '../entropy';
import { RpcOriginsStruct } from '../json-rpc';
import { SnapIdStruct } from '../snaps';
import { NameStruct, NpmSnapFileNames } from '../types';

// BIP-43 purposes that cannot be used for entropy derivation. These are in the
// string form, ending with `'`.
const FORBIDDEN_PURPOSES: string[] = [
  SIP_6_MAGIC_VALUE,
  STATE_ENCRYPTION_MAGIC_VALUE,
];

export const FORBIDDEN_COIN_TYPES: number[] = [60];
const FORBIDDEN_PATHS: string[][] = FORBIDDEN_COIN_TYPES.map((coinType) => [
  'm',
  "44'",
  `${coinType}'`,
]);

export const Bip32PathStruct = refine(
  array(string()),
  'BIP-32 path',
  (path: string[]) => {
    if (path.length === 0) {
      return 'Path must be a non-empty BIP-32 derivation path array';
    }

    if (path[0] !== 'm') {
      return 'Path must start with "m".';
    }

    if (path.length < 3) {
      return 'Paths must have a length of at least three.';
    }

    if (path.slice(1).some((part) => !isValidBIP32PathSegment(part))) {
      return 'Path must be a valid BIP-32 derivation path array.';
    }

    if (FORBIDDEN_PURPOSES.includes(path[1])) {
      return `The purpose "${path[1]}" is not allowed for entropy derivation.`;
    }

    if (
      FORBIDDEN_PATHS.some((forbiddenPath) =>
        isEqual(path.slice(0, forbiddenPath.length), forbiddenPath),
      )
    ) {
      return `The path "${path.join(
        '/',
      )}" is not allowed for entropy derivation.`;
    }

    return true;
  },
);

export const bip32entropy = <
  Type extends { path: string[]; curve: string },
  Schema,
>(
  struct: Struct<Type, Schema>,
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

export const SemVerRangeStruct = refine(string(), 'SemVer range', (value) => {
  if (isValidSemVerRange(value)) {
    return true;
  }
  return 'Expected a valid SemVer range.';
});

export const SnapIdsStruct = refine(
  record(SnapIdStruct, object({ version: optional(SemVerRangeStruct) })),
  'SnapIds',
  (value) => {
    if (Object.keys(value).length === 0) {
      return false;
    }

    return true;
  },
);

export type SnapIds = Infer<typeof SnapIdsStruct>;

/* eslint-disable @typescript-eslint/naming-convention */
export const PermissionsStruct = type({
  'endowment:long-running': optional(object({})),
  'endowment:network-access': optional(object({})),
  'endowment:webassembly': optional(object({})),
  'endowment:transaction-insight': optional(
    object({
      allowTransactionOrigin: optional(boolean()),
    }),
  ),
  'endowment:cronjob': optional(
    object({ jobs: CronjobSpecificationArrayStruct }),
  ),
  'endowment:rpc': optional(RpcOriginsStruct),
  snap_dialog: optional(object({})),
  // TODO: Remove
  snap_confirm: optional(object({})),
  snap_manageState: optional(object({})),
  snap_manageAccounts: optional(object({})),
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
  wallet_snap: optional(SnapIdsStruct),
});
/* eslint-enable @typescript-eslint/naming-convention */

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
    shasum: ChecksumStruct,
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
  $schema: optional(string()), // enables JSON-Schema linting in VSC and other IDEs
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
 * @param value - The value to check.
 * @throws If the value cannot be coerced to a {@link SnapManifest} object.
 * @returns The created {@link SnapManifest} object.
 */
export function createSnapManifest(value: unknown): SnapManifest {
  // TODO: Add a utility to prefix these errors similar to assertStruct
  return create(value, SnapManifestStruct);
}
