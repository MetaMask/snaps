import deepEqual from 'fast-deep-equal';
import {
  NpmSnapFileNames,
  SnapFiles,
  SnapValidationFailureReason,
  UnvalidatedSnapFiles,
  assertIsNpmSnapPackageJson,
  assertIsSnapManifest,
  NpmSnapPackageJson,
  SnapManifest,
} from './types';
import { ProgrammaticallyFixableSnapError, validateSnapShasum } from './snaps';

export const SVG_MAX_BYTE_SIZE = 100_000;
export const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(
  SVG_MAX_BYTE_SIZE / 1000,
)}kb`;

export const EXPECTED_SNAP_FILES = [
  'manifest',
  'packageJson',
  'sourceCode',
] as const;

export const SnapFileNameFromKey = {
  manifest: NpmSnapFileNames.Manifest,
  packageJson: NpmSnapFileNames.PackageJson,
  sourceCode: 'source code bundle',
} as const;

/**
 * Validates the files extracted from an npm Snap package tarball by ensuring
 * that they're non-empty and that the Json files match their respective schemas
 * and the Snaps publishing specification.
 *
 * @param snapFiles - The object containing the expected Snap file contents,
 * if any.
 * @param errorPrefix - The prefix of the error message.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export function validateNpmSnap(
  snapFiles: UnvalidatedSnapFiles,
  errorPrefix?: `${string}: `,
): SnapFiles {
  EXPECTED_SNAP_FILES.forEach((key) => {
    if (!snapFiles[key]) {
      throw new Error(
        `${errorPrefix ?? ''}Missing file "${SnapFileNameFromKey[key]}".`,
      );
    }
  });

  // Typecast: We are assured that the required files exist if we get here.
  const { manifest, packageJson, sourceCode, svgIcon } = snapFiles as SnapFiles;
  try {
    assertIsSnapManifest(manifest);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ''}${error.message}`);
  }
  const validatedManifest = manifest as SnapManifest;

  const { iconPath } = validatedManifest.source.location.npm;
  if (iconPath && !svgIcon) {
    throw new Error(`Missing file "${iconPath}".`);
  }

  try {
    assertIsNpmSnapPackageJson(packageJson);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ''}${error.message}`);
  }
  const validatedPackageJson = packageJson as NpmSnapPackageJson;

  validateNpmSnapManifest({
    manifest: validatedManifest,
    packageJson: validatedPackageJson,
    sourceCode,
  });

  if (svgIcon) {
    if (Buffer.byteLength(svgIcon, 'utf8') > SVG_MAX_BYTE_SIZE) {
      throw new Error(
        `${
          errorPrefix ?? ''
        }The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`,
      );
    }
  }

  return {
    manifest: validatedManifest,
    packageJson: validatedPackageJson,
    sourceCode,
    svgIcon,
  };
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

  validateSnapShasum(
    manifest,
    sourceCode,
    `"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`,
  );
  return [manifest, sourceCode, packageJson];
}
