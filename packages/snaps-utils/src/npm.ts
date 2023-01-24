import { validateNpmSnapManifest } from './manifest/manifest';
import { assertIsSnapManifest } from './manifest/validation';
import {
  assertIsNpmSnapPackageJson,
  NpmSnapFileNames,
  SnapFiles,
  UnvalidatedSnapFiles,
} from './types';

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
    assertIsSnapManifest(manifest.result);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ''}${error.message}`);
  }
  const validatedManifest = manifest;

  const { iconPath } = validatedManifest.result.source.location.npm;
  if (iconPath && !svgIcon) {
    throw new Error(`Missing file "${iconPath}".`);
  }

  try {
    assertIsNpmSnapPackageJson(packageJson.result);
  } catch (error) {
    throw new Error(`${errorPrefix ?? ''}${error.message}`);
  }
  const validatedPackageJson = packageJson;

  validateNpmSnapManifest({
    manifest: validatedManifest,
    packageJson: validatedPackageJson,
    sourceCode,
    svgIcon,
  });

  if (svgIcon) {
    if (Buffer.byteLength(svgIcon.value, 'utf8') > SVG_MAX_BYTE_SIZE) {
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
