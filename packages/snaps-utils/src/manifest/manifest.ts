import { Json, assertExhaustive, assert, isPlainObject } from '@metamask/utils';
import deepEqual from 'fast-deep-equal';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { deepClone } from '../deep-clone';
import { readJsonFile } from '../fs';
import { validateNpmSnap } from '../npm';
import {
  getSnapChecksum,
  ProgrammaticallyFixableSnapError,
  validateSnapShasum,
} from '../snaps';
import {
  NpmSnapFileNames,
  SnapFiles,
  SnapValidationFailureReason,
  UnvalidatedSnapFiles,
} from '../types';
import { readVirtualFile, VirtualFile } from '../virtual-file';
import { SnapManifest } from './validation';

const MANIFEST_SORT_ORDER: Record<keyof SnapManifest, number> = {
  version: 1,
  description: 2,
  proposedName: 3,
  repository: 4,
  source: 5,
  initialPermissions: 6,
  manifestVersion: 7,
};

/**
 * The result from the `checkManifest` function.
 *
 * @property manifest - The fixed manifest object.
 * @property updated - Whether the manifest was updated.
 * @property warnings - An array of warnings that were encountered during
 * processing of the manifest files. These warnings are not logged to the
 * console automatically, so depending on the environment the function is called
 * in, a different method for logging can be used.
 * @property errors - An array of errors that were encountered during
 * processing of the manifest files. These errors are not logged to the
 * console automatically, so depending on the environment the function is called
 * in, a different method for logging can be used.
 */
export type CheckManifestResult = {
  manifest: SnapManifest;
  updated?: boolean;
  warnings: string[];
  errors: string[];
};

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param writeManifest - Whether to write the fixed manifest to disk.
 * @param sourceCode - The source code of the Snap.
 * @returns Whether the manifest was updated, and an array of warnings that
 * were encountered during processing of the manifest files.
 */
export async function checkManifest(
  basePath: string,
  writeManifest = true,
  sourceCode?: string,
): Promise<CheckManifestResult> {
  const warnings: string[] = [];
  const errors: string[] = [];

  let updated = false;

  const manifestPath = pathUtils.join(basePath, NpmSnapFileNames.Manifest);
  const manifestFile = await readJsonFile(manifestPath);
  const unvalidatedManifest = manifestFile.result;

  const packageFile = await readJsonFile(
    pathUtils.join(basePath, NpmSnapFileNames.PackageJson),
  );

  const snapFiles: UnvalidatedSnapFiles = {
    manifest: manifestFile,
    packageJson: packageFile,
    sourceCode: await getSnapSourceCode(
      basePath,
      unvalidatedManifest,
      sourceCode,
    ),
    svgIcon: await getSnapIcon(basePath, unvalidatedManifest),
  };

  let manifest: VirtualFile<SnapManifest> | undefined;
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

  // TypeScript assumes `manifest` can still be undefined, that is not the case.
  // But we assert to keep TypeScript happy.
  assert(manifest);

  const validatedManifest = manifest.result;

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
      const newManifest = `${JSON.stringify(
        getWritableManifest(validatedManifest),
        null,
        2,
      )}\n`;

      if (updated || newManifest !== manifestFile.value) {
        await fs.writeFile(
          pathUtils.join(basePath, NpmSnapFileNames.Manifest),
          newManifest,
        );
      }
    } catch (error) {
      // Note: This error isn't pushed to the errors array, because it's not an
      // error in the manifest itself.
      throw new Error(`Failed to update snap.manifest.json: ${error.message}`);
    }
  }

  return { manifest: validatedManifest, updated, warnings, errors };
}

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
): VirtualFile<SnapManifest> {
  const { manifest, packageJson } = snapFiles;
  const clonedFile = manifest.clone();
  const manifestCopy = clonedFile.result;

  switch (error.reason) {
    case SnapValidationFailureReason.NameMismatch:
      manifestCopy.source.location.npm.packageName = packageJson.result.name;
      break;

    case SnapValidationFailureReason.VersionMismatch:
      manifestCopy.version = packageJson.result.version;
      break;

    case SnapValidationFailureReason.RepositoryMismatch:
      manifestCopy.repository = packageJson.result.repository
        ? deepClone(packageJson.result.repository)
        : undefined;
      break;

    case SnapValidationFailureReason.ShasumMismatch:
      manifestCopy.source.shasum = getSnapChecksum(snapFiles);
      break;

    /* istanbul ignore next */
    default:
      assertExhaustive(error.reason);
  }

  clonedFile.result = manifestCopy;
  clonedFile.value = JSON.stringify(manifestCopy);
  return clonedFile;
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @param sourceCode - Override source code for plugins.
 * @returns The contents of the bundle file, if any.
 */
export async function getSnapSourceCode(
  basePath: string,
  manifest: Json,
  sourceCode?: string,
): Promise<VirtualFile | undefined> {
  if (!isPlainObject(manifest)) {
    return undefined;
  }

  const sourceFilePath = (manifest as Partial<SnapManifest>).source?.location
    ?.npm?.filePath;

  if (!sourceFilePath) {
    return undefined;
  }

  if (sourceCode) {
    return new VirtualFile({
      path: pathUtils.join(basePath, sourceFilePath),
      value: sourceCode,
    });
  }

  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, sourceFilePath),
      'utf8',
    );
    return virtualFile;
  } catch (error) {
    throw new Error(`Failed to read Snap bundle file: ${error.message}`);
  }
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * icon and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the icon, if any.
 */
export async function getSnapIcon(
  basePath: string,
  manifest: Json,
): Promise<VirtualFile | undefined> {
  if (!isPlainObject(manifest)) {
    return undefined;
  }

  const iconPath = (manifest as Partial<SnapManifest>).source?.location?.npm
    ?.iconPath;

  if (!iconPath) {
    return undefined;
  }

  try {
    const virtualFile = await readVirtualFile(
      pathUtils.join(basePath, iconPath),
      'utf8',
    );
    return virtualFile;
  } catch (error) {
    throw new Error(`Failed to read Snap icon file: ${error.message}`);
  }
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

  return writableManifest as SnapManifest;
}

/**
 * Validates the fields of an npm Snap manifest that has already passed JSON
 * Schema validation.
 *
 * @param snapFiles - The relevant snap files to validate.
 * @param snapFiles.manifest - The npm Snap manifest to validate.
 * @param snapFiles.packageJson - The npm Snap's `package.json`.
 * @param snapFiles.sourceCode - The Snap's source code.
 * @param snapFiles.svgIcon - The Snap's optional icon.
 */
export function validateNpmSnapManifest({
  manifest,
  packageJson,
  sourceCode,
  svgIcon,
}: SnapFiles) {
  const packageJsonName = packageJson.result.name;
  const packageJsonVersion = packageJson.result.version;
  const packageJsonRepository = packageJson.result.repository;

  const manifestPackageName = manifest.result.source.location.npm.packageName;
  const manifestPackageVersion = manifest.result.version;
  const manifestRepository = manifest.result.repository;

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

  validateSnapShasum(
    { manifest, sourceCode, svgIcon },
    `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`,
  );
}
