import { Json } from '@metamask/utils';
import { NpmSnapPackageJson, SnapManifest } from './json-schemas';

/**
 * An object for sending
 */
export type SnapData = {
  snapId: string;
  sourceCode: string;
};

export type SnapExecutionData = SnapData & {
  endowments?: Json;
};

export type ErrorJSON = {
  message: string;
  code: number;
  data?: Json;
};

export type SnapId = string;

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
