import type { UriOptions } from '@metamask/snaps-sdk';
import { uri } from '@metamask/snaps-sdk';
import { is, optional, size, string, type } from '@metamask/superstruct';
import type { Infer } from '@metamask/superstruct';
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
 * An extendable manifest, which consists of a base manifest, an optional
 * extended manifest, and the merged manifest, all unvalidated.
 */
export type UnvalidatedExtendableManifest = {
  /**
   * The base manifest, i.e., the manifest at the given path. This may extend
   * another manifest, and can be partial.
   */
  mainManifest: VirtualFile<Json>;

  /**
   * The extended manifest, if any. This is the manifest that the base manifest
   * extends. This can be partial.
   */
  extendedManifest?: Json;

  /**
   * The result of deep merging the base and extended manifests. This should
   * always be a complete manifest.
   */
  mergedManifest: Json;

  /**
   * The set of file paths that were involved in creating this extendable
   * manifest, including the base and extended manifests.
   */
  files: Set<string>;
};

/**
 * A utility type that makes all properties of a type optional, recursively.
 */
export type DeepPartial<Type> = Type extends string
  ? Type
  : {
      [Property in keyof Type]?: Type[Property] extends (infer Value)[]
        ? DeepPartial<Value>[]
        : Type[Property] extends readonly (infer Value)[]
          ? readonly DeepPartial<Value>[]
          : Type[Property] extends object
            ? DeepPartial<Type[Property]>
            : Type[Property];
    };

/**
 * An extendable manifest, which consists of a main manifest, an optional
 * extended manifest, and the merged manifest.
 */
export type ExtendableManifest = {
  /**
   * The main manifest, i.e., the manifest at the given path. This may extend
   * another manifest, and can be partial.
   */
  mainManifest: VirtualFile<DeepPartial<SnapManifest>>;

  /**
   * The extended manifest, if any. This is the manifest that the base manifest
   * extends. This can be partial.
   */
  extendedManifest?: DeepPartial<SnapManifest>;

  /**
   * The result of deep merging the main and extended manifests. This should
   * always be a complete manifest.
   */
  mergedManifest: SnapManifest;

  /**
   * The set of file paths that were involved in creating this extendable
   * manifest, including the main and extended manifests.
   */
  files: Set<string>;
};

/**
 * An object for storing parsed but unvalidated Snap file contents.
 */
export type UnvalidatedSnapFiles = {
  manifest?: UnvalidatedExtendableManifest;
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
 * The same as {@link SnapFiles} except that the manifest is an
 * {@link ExtendableManifest}.
 */
export type ExtendableSnapFiles = Omit<SnapFiles, 'manifest'> & {
  manifest: ExtendableManifest;
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

export { uri } from '@metamask/snaps-sdk';

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
