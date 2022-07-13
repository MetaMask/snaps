import { isObject } from '@metamask/utils';
import pump from 'pump';
import createGunzipStream from 'gunzip-maybe';
import deepEqual from 'fast-deep-equal';
import { validateSnapShasum } from './snaps';
import {
  NpmSnapPackageJson,
  SnapManifest,
  validateSnapJsonFile,
} from './json-schemas';
import { createTarballExtractionStream, getNodeStream } from './stream';
import {
  NpmSnapFileNames,
  SnapFiles,
  SnapValidationFailureReason,
  UnvalidatedSnapFiles,
} from './types';
import { isValidUrl } from './url';
import { getTargetVersion } from './versions';

export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

const SVG_MAX_BYTE_SIZE = 100_000;
const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(SVG_MAX_BYTE_SIZE / 1000)}kb`;

const EXPECTED_SNAP_FILES = ['manifest', 'packageJson', 'sourceCode'] as const;

const SnapFileNameFromKey = {
  manifest: NpmSnapFileNames.Manifest,
  packageJson: NpmSnapFileNames.PackageJson,
  sourceCode: 'source code bundle',
} as const;

/**
 * An error indicating that a Snap validation failure is programmatically
 * fixable during development.
 */
export class ProgrammaticallyFixableSnapError extends Error {
  reason: SnapValidationFailureReason;

  constructor(message: string, reason: SnapValidationFailureReason) {
    super(message);
    this.reason = reason;
  }
}

/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export async function fetchNpmSnap(
  packageName: string,
  versionRange: string,
  registryUrl = DEFAULT_NPM_REGISTRY,
  fetchFunction = fetch,
): Promise<SnapFiles> {
  const [tarballResponse, actualVersion] = await fetchNpmTarball(
    packageName,
    versionRange,
    registryUrl,
    fetchFunction,
  );

  // Extract the tarball and get the necessary files from it.
  const snapFiles: UnvalidatedSnapFiles = {};
  await new Promise<void>((resolve, reject) => {
    pump(
      getNodeStream(tarballResponse),
      // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
      // before we can actually grab any files from it.
      createGunzipStream(),
      createTarballExtractionStream(snapFiles),
      (error) => {
        error ? reject(error) : resolve();
      },
    );
  });

  // At this point, the necessary files will have been added to the snapFiles
  // object if they exist.
  return validateNpmSnap(
    snapFiles,
    `npm Snap "${packageName}@${actualVersion}" validation error: `,
  );
}

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
  errorPrefix: `${string}: `,
): SnapFiles {
  EXPECTED_SNAP_FILES.forEach((key) => {
    if (!snapFiles[key]) {
      throw new Error(
        `${errorPrefix}Missing file "${SnapFileNameFromKey[key]}".`,
      );
    }
  });

  // Typecast: We are assured that the required files exist if we get here.
  const { manifest, packageJson, sourceCode, svgIcon } = snapFiles as SnapFiles;
  try {
    validateSnapJsonFile(NpmSnapFileNames.Manifest, manifest);
  } catch (error) {
    throw new Error(
      `${errorPrefix}"${NpmSnapFileNames.Manifest}" is invalid:\n${error.message}`,
    );
  }
  const validatedManifest = manifest as SnapManifest;

  const { iconPath } = validatedManifest.source.location.npm;
  if (iconPath && !svgIcon) {
    throw new Error(`${errorPrefix}Missing file "${iconPath}".`);
  }

  try {
    validateSnapJsonFile(NpmSnapFileNames.PackageJson, packageJson);
  } catch (error) {
    throw new Error(
      `${errorPrefix}"${NpmSnapFileNames.PackageJson}" is invalid:\n${error.message}`,
    );
  }
  const validatedPackageJson = packageJson as NpmSnapPackageJson;

  validateNpmSnapManifest(
    {
      manifest: validatedManifest,
      packageJson: validatedPackageJson,
      sourceCode,
    },
    errorPrefix,
  );

  if (svgIcon) {
    if (Buffer.byteLength(svgIcon, 'utf8') > SVG_MAX_BYTE_SIZE) {
      throw new Error(
        `${errorPrefix}The specified SVG icon exceeds the maximum size of ${SVG_MAX_BYTE_SIZE_TEXT}.`,
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
 * @param errorPrefix - The prefix for error messages.
 * @returns A tuple containing the validated snap manifest, snap source code,
 * and `package.json`.
 */
export function validateNpmSnapManifest(
  { manifest, packageJson, sourceCode }: SnapFiles,
  errorPrefix: `${string}: `,
): [SnapManifest, string, NpmSnapPackageJson] {
  const packageJsonName = packageJson.name;
  const packageJsonVersion = packageJson.version;
  const packageJsonRepository = packageJson.repository;

  const manifestPackageName = manifest.source.location.npm.packageName;
  const manifestPackageVersion = manifest.version;
  const manifestRepository = manifest.repository;

  if (packageJsonName !== manifestPackageName) {
    throw new ProgrammaticallyFixableSnapError(
      `${errorPrefix}"${NpmSnapFileNames.Manifest}" npm package name ("${manifestPackageName}") does not match the "${NpmSnapFileNames.PackageJson}" "name" field ("${packageJsonName}").`,
      SnapValidationFailureReason.NameMismatch,
    );
  }

  if (packageJsonVersion !== manifestPackageVersion) {
    throw new ProgrammaticallyFixableSnapError(
      `${errorPrefix}"${NpmSnapFileNames.Manifest}" npm package version ("${manifestPackageVersion}") does not match the "${NpmSnapFileNames.PackageJson}" "version" field ("${packageJsonVersion}").`,
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
      `${errorPrefix}"${NpmSnapFileNames.Manifest}" "repository" field does not match the "${NpmSnapFileNames.PackageJson}" "repository" field.`,
      SnapValidationFailureReason.RepositoryMismatch,
    );
  }

  validateSnapShasum(
    manifest,
    sourceCode,
    `${errorPrefix}"${NpmSnapFileNames.Manifest}" "shasum" field does not match computed shasum.`,
  );
  return [manifest, sourceCode, packageJson];
}

/**
 * Fetches the tarball (`.tgz` file) of the specified package and version from
 * the public npm registry. Throws an error if fetching fails.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param versionRange - The SemVer range of the package to fetch. The highest
 * version satisfying the range will be fetched.
 * @param registryUrl - The URL of the npm registry to fetch the tarball from.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the {@link Response} for the package tarball and the
 * actual version of the package.
 */
async function fetchNpmTarball(
  packageName: string,
  versionRange: string,
  registryUrl = DEFAULT_NPM_REGISTRY,
  fetchFunction = fetch,
): Promise<[ReadableStream, string]> {
  const packageMetadata = await (
    await fetchFunction(new URL(packageName, registryUrl).toString())
  ).json();

  if (!isObject(packageMetadata)) {
    throw new Error(
      `Failed to fetch package "${packageName}" metadata from npm.`,
    );
  }

  const targetVersion = getTargetVersion(
    Object.keys((packageMetadata as any)?.versions ?? {}),
    versionRange,
  );

  if (targetVersion === null) {
    throw new Error(
      `Failed to find a matching version in npm metadata for package "${packageName}" and requested semver range "${versionRange}"`,
    );
  }

  const tarballUrlString = (packageMetadata as any).versions?.[targetVersion]
    ?.dist?.tarball;

  if (!isValidUrl(tarballUrlString) || !tarballUrlString.endsWith('.tgz')) {
    throw new Error(
      `Failed to find valid tarball URL in npm metadata for package "${packageName}".`,
    );
  }

  // Override the tarball hostname/protocol with registryUrl hostname/protocol
  const newRegistryUrl = new URL(registryUrl);
  const newTarballUrl = new URL(tarballUrlString);
  newTarballUrl.hostname = newRegistryUrl.hostname;
  newTarballUrl.protocol = newRegistryUrl.protocol;

  // Perform a raw fetch because we want the Response object itself.
  const tarballResponse = await fetchFunction(newTarballUrl.toString());
  if (!tarballResponse.ok) {
    throw new Error(`Failed to fetch tarball for package "${packageName}".`);
  }
  const stream = await tarballResponse.blob().then((blob) => blob.stream());

  return [stream, targetVersion];
}
