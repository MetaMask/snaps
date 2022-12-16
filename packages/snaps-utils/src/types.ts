import {
  SnapFunctionExports,
  SnapKeyring as Keyring,
} from '@metamask/snaps-types';
import { assertStruct, Json } from '@metamask/utils';
import {
  Infer,
  instance,
  is,
  object,
  optional,
  pattern,
  refine,
  size,
  string,
  Struct,
  type,
  union,
  assert as assertSuperstruct,
} from 'superstruct';

import { SnapManifest } from './manifest/validation';
import { VersionStruct } from './versions';

export enum NpmSnapFileNames {
  PackageJson = 'package.json',
  Manifest = 'snap.manifest.json',
}

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

/**
 * The possible prefixes for snap ids.
 */
/* eslint-disable @typescript-eslint/naming-convention */
export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
}
/* eslint-enable @typescript-eslint/naming-convention */

export type SnapId = string;

/**
 * Snap validation failure reason codes that are programmatically fixable
 * if validation occurs during development.
 */
export enum SnapValidationFailureReason {
  NameMismatch = '"name" field mismatch',
  VersionMismatch = '"version" field mismatch',
  RepositoryMismatch = '"repository" field mismatch',
  ChecksumMismatch = '"shasum" field mismatch',
}

/* eslint-disable @typescript-eslint/naming-convention */
export enum SNAP_STREAM_NAMES {
  JSON_RPC = 'jsonRpc',
  COMMAND = 'command',
}
/* eslint-enable @typescript-eslint/naming-convention */

export enum HandlerType {
  OnRpcRequest = 'onRpcRequest',
  OnTransaction = 'onTransaction',
  SnapKeyring = 'keyring',
  OnCronjob = 'onCronjob',
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

// We use a symbol property name instead of { _type: Brand }, because that would show up in IDE suggestions,
// while internal symbols do not.
declare const brand: unique symbol;
export type Opaque<Base, Brand extends symbol> = Base & { [brand]: Brand };

type UriOptions<T extends string> = {
  protocol?: Struct<T>;
  hash?: Struct<T>;
  port?: Struct<T>;
  hostname?: Struct<T>;
  pathname?: Struct<T>;
  search?: Struct<T>;
};
export const uri = (opts: UriOptions<any> = {}) =>
  refine(union([string(), instance(URL)]), 'uri', (value) => {
    try {
      const url = new URL(value);

      const UrlStruct = type(opts);
      assertSuperstruct(url, UrlStruct);
      return true;
    } catch {
      return `Expected URL, got "${value.toString()}".`;
    }
  });

/**
 * Returns whether a given value is a valid URL.
 *
 * @param url - The value to check.
 * @param opts - Optional constraints for url checking.
 * @returns Whether `url` is valid URL or not.
 */
export function isValidUrl(
  url: unknown,
  opts: UriOptions<any> = {},
): url is string | URL {
  return is(url, uri(opts));
}
