import { getErrorMessage } from '@metamask/snaps-sdk';
import {
  is,
  optional,
  refine,
  size,
  string,
  type,
  assert as assertSuperstruct,
  StructError,
} from '@metamask/superstruct';
import type { Infer, Struct } from '@metamask/superstruct';
import type { Json } from '@metamask/utils';
import { definePattern, VersionStruct } from '@metamask/utils';

import type { SnapCaveatType } from './caveats';
import type { SnapFunctionExports, SnapRpcHookArgs } from './handlers';
import type { LocalizationFile } from './localization';
import type { SnapManifest } from './manifest';
import type { VirtualFile } from './virtual-file';

export enum NpmSnapFileNames {
  PackageJson = 'package.json',
  Manifest = 'snap.manifest.json',
}

export const NameStruct = size(
  definePattern(
    'Snap Name',
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
    type({
      type: size(string(), 1, Infinity),
      url: size(string(), 1, Infinity),
    }),
  ),
});

export type NpmSnapPackageJson = Infer<typeof NpmSnapPackageJsonStruct> &
  Record<string, any>;

/**
 * An object for storing parsed but unvalidated Snap file contents.
 */
export type UnvalidatedSnapFiles = {
  manifest?: VirtualFile<Json>;
  packageJson?: VirtualFile<Json>;
  sourceCode?: VirtualFile;
  svgIcon?: VirtualFile;
  auxiliaryFiles: VirtualFile[];
  localizationFiles: VirtualFile[];
};

/**
 * An object for storing the contents of Snap files that have passed JSON
 * Schema validation, or are non-empty if they are strings.
 */
export type SnapFiles = {
  manifest: VirtualFile<SnapManifest>;
  packageJson: VirtualFile<NpmSnapPackageJson>;
  sourceCode: VirtualFile;
  svgIcon?: VirtualFile;
  auxiliaryFiles: VirtualFile[];
  localizationFiles: VirtualFile<LocalizationFile>[];
};

/**
 * A subset of snap files extracted from a fetched snap.
 */
export type FetchedSnapFiles = Pick<
  SnapFiles,
  'manifest' | 'sourceCode' | 'svgIcon' | 'auxiliaryFiles' | 'localizationFiles'
>;

/**
 * The possible prefixes for snap ids.
 */
/* eslint-disable @typescript-eslint/naming-convention */
export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
}
/* eslint-enable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/naming-convention */
export enum SNAP_STREAM_NAMES {
  JSON_RPC = 'jsonRpc',
  COMMAND = 'command',
}
/* eslint-enable @typescript-eslint/naming-convention */

// The snap is the callee
export type SnapRpcHook = (options: SnapRpcHookArgs) => Promise<unknown>;

type ObjectParameters<
  Type extends Record<string, (...args: any[]) => unknown>,
> = Parameters<Type[keyof Type]>;

export type SnapExportsParameters = ObjectParameters<SnapFunctionExports>;

type UriOptions<Type extends string> = {
  protocol?: Struct<Type>;
  hash?: Struct<Type>;
  port?: Struct<Type>;
  hostname?: Struct<Type>;
  pathname?: Struct<Type>;
  search?: Struct<Type>;
};

export const uri = (opts: UriOptions<any> = {}) =>
  refine(string(), 'uri', (value) => {
    try {
      const url = new URL(value);

      const UrlStruct = type(opts);
      assertSuperstruct(url, UrlStruct);
      return true;
    } catch (error) {
      if (error instanceof StructError) {
        return getErrorMessage(error);
      }
      return `Expected URL, got "${value.toString()}"`;
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
): url is string {
  return is(url, uri(opts));
}

// redefining here to avoid circular dependency
export const WALLET_SNAP_PERMISSION_KEY = 'wallet_snap';

export type SnapsPermissionRequest = {
  [WALLET_SNAP_PERMISSION_KEY]: {
    caveats: [
      {
        type: SnapCaveatType.SnapIds;
        value: Record<string, Json>;
      },
    ];
  };
};
