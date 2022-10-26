import {
  SnapFunctionExports,
  SnapKeyring as Keyring,
} from '@metamask/snap-types';
import { Json } from '@metamask/utils';
import {
  any,
  Infer,
  is,
  literal,
  object,
  optional,
  pattern,
  record,
  refine,
  size,
  string,
  type,
  union,
} from 'superstruct';
import { valid as validSemver } from 'semver';
import { assertStruct } from './assert';

export enum NpmSnapFileNames {
  PackageJson = 'package.json',
  Manifest = 'snap.manifest.json',
}

/**
 * A struct for validating a version string.
 */
export const VersionStruct = refine(string(), 'Version', (value) => {
  return validSemver(value) !== null;
});

export const NameStruct = size(
  pattern(
    string(),
    /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/u,
  ),
  1,
  214,
);

// Note we use `type` instead of `object` here, because the latter does not
// allow unknown keys.
export const NpmSnapPackageJsonStruct = type({
  version: VersionStruct,
  name: NameStruct,
  main: optional(size(string(), 1, Infinity)),
  repository: optional(
    object({
      type: size(string(), 1, Infinity),
      url: size(string(), 1, Infinity),
    }),
  ),
});

export type NpmSnapPackageJson = Infer<typeof NpmSnapPackageJsonStruct> &
  Record<string, any>;

/**
 * Check if the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link NpmSnapPackageJson} object.
 */
export function isNpmSnapPackageJson(
  value: unknown,
): value is NpmSnapPackageJson {
  return is(value, NpmSnapPackageJsonStruct);
}

/**
 * Asserts that the given value is a valid {@link NpmSnapPackageJson} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link NpmSnapPackageJson} object.
 */
export function assertIsNpmSnapPackageJson(
  value: unknown,
): asserts value is NpmSnapPackageJson {
  assertStruct(
    value,
    NpmSnapPackageJsonStruct,
    `"${NpmSnapFileNames.PackageJson}" is invalid`,
  );
}

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
    shasum: size(
      pattern(
        string(),
        /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/u,
      ),
      44,
      44,
    ),
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
  initialPermissions: record(string(), any()),
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

/**
 * An object for storing parsed but unvalidated Snap file contents.
 */
export type UnvalidatedSnapFiles = {
  manifest?: Json;
  packageJson?: Json;
  sourceCode?: string;
  svgIcon?: string;
};

/**
 * An object for storing the contents of Snap files that have passed JSON
 * Schema validation, or are non-empty if they are strings.
 */
export type SnapFiles = {
  manifest: SnapManifest;
  packageJson: NpmSnapPackageJson;
  sourceCode: string;
  svgIcon?: string;
};

/**
 * The possible prefixes for snap ids.
 */
export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
}

export type SnapId = string;

/**
 * Snap validation failure reason codes that are programmatically fixable
 * if validation occurs during development.
 */
export enum SnapValidationFailureReason {
  NameMismatch = '"name" field mismatch',
  VersionMismatch = '"version" field mismatch',
  RepositoryMismatch = '"repository" field mismatch',
  ShasumMismatch = '"shasum" field mismatch',
}

export enum SNAP_STREAM_NAMES {
  JSON_RPC = 'jsonRpc',
  COMMAND = 'command',
}

export enum HandlerType {
  OnRpcRequest = 'onRpcRequest',
  OnTransaction = 'onTransaction',
  SnapKeyring = 'keyring',
}

export const SNAP_EXPORT_NAMES = Object.values(HandlerType);

export type SnapRpcHookArgs = {
  origin: string;
  handler: HandlerType;
  request: Record<string, unknown>;
};

// The snap is the callee
export type SnapRpcHook = (options: SnapRpcHookArgs) => Promise<unknown>;

type ObjectParameters<
  Type extends Record<string, (...args: any[]) => unknown>,
> = Parameters<Type[keyof Type]>;

type KeyringParameter<Fn> = Fn extends (...args: any[]) => unknown
  ? Parameters<Fn>
  : never;

type KeyringParameters = KeyringParameter<Keyring[keyof Keyring]>;

export type SnapExportsParameters =
  | ObjectParameters<SnapFunctionExports>
  | KeyringParameters;
