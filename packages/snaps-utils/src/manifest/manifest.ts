import { Json, assertExhaustive } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';
import { promises as fs } from 'fs';
import pathUtils from 'path';
import { validate } from 'superstruct';

import { deepClone } from '../deep-clone';
import { readJsonFile, readSnapJsonFile } from '../fs';
import { validateNpmSnap } from '../npm';
import {
  ProgrammaticallyFixableSnapError,
  validateSnapChecksum,
} from '../snaps';
import {
  NpmSnapFileNames,
  NpmSnapPackageJson,
  SnapValidationFailureReason,
} from '../types';
import { readVirtualFile } from '../virtual-file/toVirtualFile';
import { VirtualFile } from '../virtual-file/VirtualFile';
import { SnapManifest, SnapManifestStruct } from './validation';

const MANIFEST_SORT_ORDER: Record<keyof SnapManifest, number> = {
  name: 1,
  description: 2,
  version: 3,
  source: 4,
  icon: 5,
  permissions: 6,
  checksum: 7,
  manifestVersion: 8,
};

export type VirtualFileMessage = {
  reason: string;
  severity: 'fatal' | 'warning' | 'info';
};

declare module '@metamask/snaps-utils' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface VirtualFileDataMap {
    /**
     * Whether the manifest was stored on disk.
     */
    stored: boolean;
    /**
     * Whether the manifest was updated in any way.
     */
    updated: boolean;
    /**
     * These message are not logged to the console automatically,
     * so depending on the environment the function is called in,
     * a different method for logging can be used.
     */
    messages: VirtualFileMessage[];
  }
}

export type CheckManifestOptions = {
  writeManifest?: boolean;
  overrides?: VirtualFile[];
};

// require-param/check-param-names are buggy when we're destructuring the argument
/* eslint-disable jsdoc/require-param, jsdoc/check-param-names */
/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param writeManifest - Whether to write the fixed manifest to disk.
 * @param overrides - The files to load from memory rather than from disk based on the manifest path.
 * @returns Whether the manifest was updated, and an array of warnings that
 * were encountered during processing of the manifest files.
 */
export async function checkManifest(
  basePath: string,
  { writeManifest = true, overrides = [] }: CheckManifestOptions = {},
): Promise<VirtualFile<SnapManifest | undefined>> {
  const loadPath = async (
    relativePath: string,
    encoding: BufferEncoding | undefined = 'utf8',
  ) => {
    const override = overrides.find((file) => file.path === relativePath);
    if (override !== undefined) {
      return override;
    }
    return await readVirtualFile(
      pathUtils.join(basePath, relativePath),
      encoding,
    );
  };

  let updated = false;

  const manifestPath = pathUtils.join(basePath, NpmSnapFileNames.Manifest);
  // TODO(ritave): Consider making readJsonFile return messages as well instead of throwing.
  let manifestFile: VirtualFile<Json>;
  try {
    manifestFile = await readJsonFile(manifestPath);
  } catch (error) {
    if (error instanceof Error) {
      return new VirtualFile({
        value: '',
        path: manifestPath,
        data: {
          messages: [
            {
              severity: 'fatal',
              reason: error.message,
            },
          ],
        },
      });
    }
    throw error;
  }

  const [error, manifest] = validate(manifestFile.result, SnapManifestStruct, {
    coerce: true,
  });

  const packageFile = await readJsonFile(
    pathUtils.join(basePath, NpmSnapFileNames.PackageJson),
  );

  const iconPath = (manifestFile.result as Partial<SnapManifest>)?.icon;
  const iconFile =
    iconPath === undefined // we're avoiding scenario where iconPath === ""
      ? undefined
      : await readVirtualFile(pathUtils.join(basePath, iconPath), 'utf-8');

  const sourcePath = (manifestFile.result as Partial<SnapManifest>)?.source;
  const sourceFile =
    sourcePath === undefined
      ? undefined
      : await readVirtualFile(pathUtils.join(basePath, sourcePath), 'utf-8');

  let manifest: SnapManifest | undefined;
  try {
    ({ manifest } = validateNpmSnap(snapFiles));
  } catch (error) {
    if (error instanceof ProgrammaticallyFixableSnapError) {
      errors.push(error.message);

      // If we get here, the files at least have the correct shape.
      const partiallyValidatedFiles = snapFiles as SnapFiles;

      let isInvalid = true;
      let currentError = error;
      const maxAttempts = Object.keys(SnapValidationFailureReason).length;

      // Attempt to fix all fixable validation failure reasons. All such reasons
      // are enumerated by the `SnapValidationFailureReason` enum, so we only
      // attempt to fix the manifest the same amount of times as there are
      // reasons in the enum.
      for (let attempts = 1; isInvalid && attempts <= maxAttempts; attempts++) {
        manifest = fixManifest(
          manifest
            ? { ...partiallyValidatedFiles, manifest }
            : partiallyValidatedFiles,
          currentError,
        );

        try {
          validateNpmSnapManifest({ ...partiallyValidatedFiles, manifest });

          isInvalid = false;
        } catch (nextValidationError) {
          currentError = nextValidationError;
          /* istanbul ignore next: this should be impossible */
          if (
            !(
              nextValidationError instanceof ProgrammaticallyFixableSnapError
            ) ||
            (attempts === maxAttempts && !isInvalid)
          ) {
            throw new Error(
              `Internal error: Failed to fix manifest. This is a bug, please report it. Reason:\n${error.message}`,
            );
          }

          errors.push(currentError.message);
        }
      }

      updated = true;
    } else {
      throw error;
    }
  }

  // TypeScript doesn't see that the 'manifest' variable must be of type
  // SnapManifest at this point, so we cast it.
  const validatedManifest = manifest as SnapManifest;

  // Check presence of recommended keys
  const recommendedFields = ['repository'] as const;

  const missingRecommendedFields = recommendedFields.filter(
    (key) => !validatedManifest[key],
  );

  if (missingRecommendedFields.length > 0) {
    warnings.push(
      `Missing recommended package.json properties:\n${missingRecommendedFields.reduce(
        (allMissing, currentField) => {
          return `${allMissing}\t${currentField}\n`;
        },
        '',
      )}`,
    );
  }

  if (writeManifest) {
    try {
      await fs.writeFile(
        pathUtils.join(basePath, NpmSnapFileNames.Manifest),
        `${JSON.stringify(getWritableManifest(validatedManifest), null, 2)}\n`,
      );
    } catch (error) {
      // Note: This error isn't pushed to the errors array, because it's not an
      // error in the manifest itself.
      throw new Error(`Failed to update snap.manifest.json: ${error.message}`);
    }
  }

  return { manifest: validatedManifest, updated, warnings, errors };
}
/* eslint-enable jsdoc/require-param, jsdoc/check-param-names */

/**
 * Given the relevant Snap files (manifest, `package.json`, and bundle) and a
 * Snap manifest validation error, fixes the fault in the manifest that caused
 * the error.
 *
 * @param snapFiles - The contents of all Snap files.
 * @param error - The {@link ProgrammaticallyFixableSnapError} that was thrown.
 * @returns A copy of the manifest file where the cause of the error is fixed.
 */
export function fixManifest(
  snapFiles: SnapFiles,
  error: ProgrammaticallyFixableSnapError,
): SnapManifest {
  const { manifest, packageJson, sourceCode } = snapFiles;
  const manifestCopy = deepClone(manifest);

  switch (error.reason) {
    case SnapValidationFailureReason.NameMismatch:
      manifestCopy.source.location.npm.packageName = packageJson.name;
      break;

    case SnapValidationFailureReason.VersionMismatch:
      manifestCopy.version = packageJson.version;
      break;

    case SnapValidationFailureReason.RepositoryMismatch:
      manifestCopy.repository = packageJson.repository
        ? deepClone(packageJson.repository)
        : undefined;
      break;

    case SnapValidationFailureReason.ChecksumMismatch:
      manifestCopy.source.shasum = getSnapSourceShasum(sourceCode);
      break;

    /* istanbul ignore next */
    default:
      assertExhaustive(error.reason);
  }

  return manifestCopy;
}

/**
 * Sorts the given manifest in our preferred sort order and removes the
 * `repository` field if it is falsy (it may be `null`).
 *
 * @param manifest - The manifest to sort and modify.
 * @returns The disk-ready manifest.
 */
export function getWritableManifest(manifest: SnapManifest): SnapManifest {
  const { repository, ...remaining } = manifest;

  const keys = Object.keys(
    repository ? { ...remaining, repository } : remaining,
  ) as (keyof SnapManifest)[];

  const writableManifest = keys
    .sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b])
    .reduce<Partial<SnapManifest>>(
      (result, key) => ({
        ...result,
        [key]: manifest[key],
      }),
      {},
    );

  return writableManifest;
}

/**
 * Validates the fields of an npm Snap manifest that has already passed JSON
 * Schema validation.
 *
 * @param snapFiles - The relevant snap files to validate.
 * @param snapFiles.manifest - The npm Snap manifest to validate.
 * @param snapFiles.packageJson - The npm Snap's `package.json`.
 * @param snapFiles.sourceCode - The Snap's source code.
 * @returns A tuple containing the validated snap manifest, snap source code,
 * and `package.json`.
 */
export function validateNpmSnapManifest({
  manifest,
  packageJson,
  sourceCode,
}: SnapFiles): [SnapManifest, string, NpmSnapPackageJson] {
  const packageJsonName = packageJson.name;
  const packageJsonVersion = packageJson.version;
  const packageJsonRepository = packageJson.repository;

  const manifestPackageName = manifest.source.location.npm.packageName;
  const manifestPackageVersion = manifest.version;
  const manifestRepository = manifest.repository;

  if (packageJsonName !== manifestPackageName) {
    throw new ProgrammaticallyFixableSnapError(
      `"${NpmSnapFileNames.Manifest}" npm package name ("${manifestPackageName}") does not match the "${NpmSnapFileNames.PackageJson}" "name" field ("${packageJsonName}").`,
      SnapValidationFailureReason.NameMismatch,
    );
  }

  if (packageJsonVersion !== manifestPackageVersion) {
    throw new ProgrammaticallyFixableSnapError(
      `"${NpmSnapFileNames.Manifest}" npm package version ("${manifestPackageVersion}") does not match the "${NpmSnapFileNames.PackageJson}" "version" field ("${packageJsonVersion}").`,
      SnapValidationFailureReason.VersionMismatch,
    );
  }

  if (
    // The repository may be `undefined` in package.json but can only be defined
    // or `null` in the Snap manifest due to TS@<4.4 issues.
    (packageJsonRepository || manifestRepository) &&
    !deepEqual(packageJsonRepository, manifestRepository)
  ) {
    throw new ProgrammaticallyFixableSnapError(
      `"${NpmSnapFileNames.Manifest}" "repository" field does not match the "${NpmSnapFileNames.PackageJson}" "repository" field.`,
      SnapValidationFailureReason.RepositoryMismatch,
    );
  }

  validateSnapChecksum(
    manifest,
    sourceCode,
    `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`,
  );
  return [manifest, sourceCode, packageJson];
}
