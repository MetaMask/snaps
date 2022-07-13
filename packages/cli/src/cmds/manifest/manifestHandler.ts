import { promises as fs } from 'fs';
import { NpmSnapFileNames, SnapManifest } from '@metamask/snap-utils';
import {
  Json,
  UnvalidatedSnapFiles,
  validateNpmSnap,
  validateNpmSnapManifest,
  getSnapSourceShasum,
  ProgrammaticallyFixableSnapError,
  SnapValidationFailureReason,
  SnapFiles,
} from '@metamask/snap-controllers';
import { deepClone, readJsonFile } from '../../utils';
import { YargsArgs } from '../../types/yargs';

const errorPrefix = 'Manifest Error: ';

const ManifestSortOrder: Record<keyof SnapManifest, number> = {
  version: 1,
  proposedName: 2,
  description: 2,
  repository: 3,
  source: 4,
  initialPermissions: 5,
  manifestVersion: 6,
};

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param argv - The Yargs `argv` object.
 * @param argv.writeManifest - Whether to write the fixed manifest to disk.
 */
export async function manifestHandler({
  writeManifest,
}: YargsArgs): Promise<void> {
  let didUpdate = false;
  let hasWarnings = false;

  const unvalidatedManifest = await readSnapJsonFile(NpmSnapFileNames.Manifest);

  const iconPath =
    unvalidatedManifest && typeof unvalidatedManifest === 'object'
      ? (unvalidatedManifest as Partial<SnapManifest>).source?.location?.npm
          ?.iconPath
      : undefined;

  const snapFiles: UnvalidatedSnapFiles = {
    manifest: unvalidatedManifest,
    packageJson: await readSnapJsonFile(NpmSnapFileNames.PackageJson),
    sourceCode: await getSnapSourceCode(unvalidatedManifest),
    svgIcon: iconPath && (await fs.readFile(iconPath, 'utf8')),
  };

  let manifest: SnapManifest | undefined;
  try {
    ({ manifest } = validateNpmSnap(snapFiles, errorPrefix));
  } catch (error) {
    if (writeManifest && error instanceof ProgrammaticallyFixableSnapError) {
      // If we get here, the files at least have the correct shape.
      const partiallyValidatedFiles = snapFiles as SnapFiles;

      let isInvalid = true;
      const maxAttempts = Object.keys(SnapValidationFailureReason).length;

      // Attempt to fix all fixable validation failure reasons. All such reasons
      // are enumerated by the SnapValidationFailureReason enum, so we only
      for (let attempts = 1; isInvalid && attempts <= maxAttempts; attempts++) {
        manifest = fixManifest(partiallyValidatedFiles, error);

        try {
          validateNpmSnapManifest(
            { ...partiallyValidatedFiles, manifest },
            errorPrefix,
          );

          isInvalid = false;
        } catch (nextValidationError) {
          /* istanbul ignore next: this should be impossible */
          if (
            !(
              nextValidationError instanceof ProgrammaticallyFixableSnapError
            ) ||
            (attempts === maxAttempts && !isInvalid)
          ) {
            throw new Error(
              `Internal Error: Failed to fix manifest. This is a bug, please report it. Reason:\n${error.message}`,
            );
          }
        }
      }

      didUpdate = true;
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
    logManifestWarning(
      `Missing recommended package.json properties:\n${missingRecommendedFields.reduce(
        (allMissing, currentField) => {
          return `${allMissing}\t${currentField}\n`;
        },
        '',
      )}`,
    );
  }

  // Validation complete, finish work and notify user.

  if (writeManifest) {
    try {
      await fs.writeFile(
        NpmSnapFileNames.Manifest,
        `${JSON.stringify(getWritableManifest(validatedManifest), null, 2)}\n`,
      );

      if (didUpdate) {
        console.log(`Manifest: Updated snap.manifest.json`);
      }
    } catch (error) {
      throw new Error(
        `${errorPrefix}Failed to update snap.manifest.json: ${error.message}`,
      );
    }
  }

  if (hasWarnings) {
    console.log(
      `Manifest Warning: Validation of snap.manifest.json completed with warnings. See above.`,
    );
  } else {
    console.log(`Manifest Success: Validated snap.manifest.json!`);
  }

  /**
   * Logs a manifest warning, if `suppressWarnings` is not enabled.
   *
   * @param message - The message to log.
   */
  function logManifestWarning(message: string) {
    if (!global.snaps.suppressWarnings) {
      hasWarnings = true;
      console.warn(`Manifest Warning: ${message}`);
    }
  }
}

/**
 * Utility function for reading `package.json` or the Snap manifest file.
 * These are assumed to be in the current working directory.
 *
 * @param snapJsonFileName - The name of the file to read.
 * @returns The parsed JSON file.
 */
async function readSnapJsonFile(
  snapJsonFileName: NpmSnapFileNames,
): Promise<Json> {
  try {
    return await readJsonFile(snapJsonFileName);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `${errorPrefix}Could not find '${snapJsonFileName}'. Please ensure that ` +
          `you are running the command in the project root directory.`,
      );
    }
    throw new Error(`${errorPrefix}${error.message}`);
  }
}

/**
 * Given an unvalidated Snap manifest, attempts to extract the location of the
 * bundle source file location and read the file.
 *
 * @param manifest - The unvalidated Snap manifest file contents.
 * @returns The contents of the bundle file, if any.
 */
async function getSnapSourceCode(manifest: Json): Promise<string | undefined> {
  if (manifest && typeof manifest === 'object' && !Array.isArray(manifest)) {
    /* istanbul ignore next: optional chaining */
    const sourceFilePath = (manifest as Partial<SnapManifest>).source?.location
      ?.npm?.filePath;

    try {
      return sourceFilePath
        ? await fs.readFile(sourceFilePath, 'utf8')
        : undefined;
    } catch (error) {
      throw new Error(
        `Manifest Error: Failed to read Snap bundle file: ${error.message}`,
      );
    }
  }
  return undefined;
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
function fixManifest(
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
        : null;
      break;

    case SnapValidationFailureReason.ShasumMismatch:
      manifestCopy.source.shasum = getSnapSourceShasum(sourceCode);
      break;

    /* istanbul ignore next */
    default:
      // eslint-disable-next-line no-case-declarations
      const failureReason: never = error.reason;
      throw new Error(
        `Unrecognized validation failure reason: '${failureReason}'`,
      );
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
  return (
    Object.keys(
      repository ? { ...remaining, repository } : remaining,
    ) as (keyof SnapManifest)[]
  )
    .sort((a, b) => ManifestSortOrder[a] - ManifestSortOrder[b])
    .reduce((outManifest, key) => {
      (outManifest as any)[key] = manifest[key];
      return outManifest;
    }, {} as SnapManifest);
}
