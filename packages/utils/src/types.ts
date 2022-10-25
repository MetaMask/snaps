import {
  SnapFunctionExports,
  SnapKeyring as Keyring,
} from '@metamask/snap-types';
import { Json } from '@metamask/utils';
import { NpmSnapPackageJson, SnapManifest } from './manifest';

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

export enum NpmSnapFileNames {
  PackageJson = 'package.json',
  Manifest = 'snap.manifest.json',
}

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
