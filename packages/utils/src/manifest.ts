import { promises as fs } from 'fs';
import pathUtils from 'path';
import { Json } from '@metamask/utils';
import { validateNpmSnap, validateNpmSnapManifest } from './npm';
import {
  NpmSnapFileNames,
  SnapFiles,
  SnapManifest,
  SnapValidationFailureReason,
  UnvalidatedSnapFiles,
} from './types';
import { readSnapJsonFile } from './fs';
import { getSnapSourceShasum, ProgrammaticallyFixableSnapError } from './snaps';
import { deepClone } from './deep-clone';

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

  const unvalidatedManifest = await readSnapJsonFile(
    basePath,
    NpmSnapFileNames.Manifest,
  );

  const iconPath =
    unvalidatedManifest && typeof unvalidatedManifest === 'object'
      ? /* istanbul ignore next */
        (unvalidatedManifest as Partial<SnapManifest>).source?.location?.npm
          ?.iconPath
      : /* istanbul ignore next */
        undefined;

  const snapFiles: UnvalidatedSnapFiles = {
    manifest: unvalidatedManifest,
    packageJson: await readSnapJsonFile(basePath, NpmSnapFileNames.PackageJson),
    sourceCode:
      sourceCode ?? (await getSnapSourceCode(basePath, unvalidatedManifest)),
    svgIcon:
      iconPath &&
      (await fs.readFile(pathUtils.join(basePath, iconPath), 'utf8')),
  };

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

    case SnapValidationFailureReason.ShasumMismatch:
      manifestCopy.source.shasum = getSnapSourceShasum(sourceCode);
      break;

    /* istanbul ignore next */
    default: {
      const failureReason: never = error.reason;
      throw new Error(
        `Unrecognized validation failure reason: '${failureReason}'`,
      );
    }
  }

  return manifestCopy;
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param basePath - The path to the folder with the manifest files.
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the bundle file, if any.
 */
export async function getSnapSourceCode(
  basePath: string,
  manifest: Json,
): Promise<string | undefined> {
  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    const sourceFilePath = (manifest as Partial<SnapManifest>).source?.location
      ?.npm?.filePath;

    try {
      return sourceFilePath
        ? await fs.readFile(pathUtils.join(basePath, sourceFilePath), 'utf8')
        : undefined;
    } catch (error) {
      throw new Error(`Failed to read Snap bundle file: ${error.message}`);
    }
  }

  return undefined;
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

  return keys
    .sort((a, b) => MANIFEST_SORT_ORDER[a] - MANIFEST_SORT_ORDER[b])
    .reduce(
      (result, key) => ({
        ...result,
        [key]: manifest[key],
      }),
      {} as SnapManifest,
    );
}
