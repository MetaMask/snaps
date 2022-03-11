import { createHash } from 'crypto';
import type { Writable } from 'stream';
import { Readable } from 'stream';
import { Json } from '@metamask/controllers';
import concat from 'concat-stream';
import fetch from 'cross-fetch';
import deepEqual from 'fast-deep-equal';
import createGunzipStream from 'gunzip-maybe';
import pump from 'pump';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { maxSatisfying as maxSatisfyingSemver } from 'semver';
import { extract as tarExtract } from 'tar-stream';
import { isPlainObject } from '../utils';
import {
  NpmSnapPackageJson,
  SnapManifest,
  validateSnapJsonFile,
} from './json-schemas';

export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
}

export enum NpmSnapFileNames {
  PackageJson = 'package.json',
  Manifest = 'snap.manifest.json',
}

export const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1', '::1']);
export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

export const DEFAULT_REQUESTED_SNAP_VERSION = '*';

const SVG_MAX_BYTE_SIZE = 100_000;
const SVG_MAX_BYTE_SIZE_TEXT = `${Math.floor(SVG_MAX_BYTE_SIZE / 1000)}kb`;

// This RegEx matches valid npm package names (with some exceptions) and space-
// separated alphanumerical words, optionally with dashes and underscores.
// The RegEx consists of two parts. The first part matches space-separated
// words. It is based on the following Stackoverflow answer:
// https://stackoverflow.com/a/34974982
// The second part, after the pipe operator, is the same RegEx used for the
// `name` field of the official package.json JSON Schema, except that we allow
// mixed-case letters. It was originally copied from:
// https://github.com/SchemaStore/schemastore/blob/81a16897c1dabfd98c72242a5fd62eb080ff76d8/src/schemas/json/package.json#L132-L138
export const PROPOSED_NAME_REGEX =
  /^(?:[A-Za-z0-9-_]+( [A-Za-z0-9-_]+)*)|(?:(?:@[A-Za-z0-9-*~][A-Za-z0-9-*._~]*\/)?[A-Za-z0-9-~][A-Za-z0-9-._~]*)$/u;

export const fetchContent = fetch;

/**
 * Calculates the Base64-econded SHA-256 digest of a Snap source code string.
 *
 * @param sourceCode - The UTF-8 string source code of a Snap.
 * @returns The Base64-encoded SHA-256 digest of the source code.
 */
export function getSnapSourceShasum(sourceCode: string): string {
  return createHash('sha256').update(sourceCode, 'utf8').digest('base64');
}

export type ValidatedSnapId = `local:${string}` | `npm:${string}`;

// npm fetch stuff

const ExpectedSnapFiles = ['manifest', 'packageJson', 'sourceCode'] as const;

const SnapFileNameFromKey = {
  manifest: NpmSnapFileNames.Manifest,
  packageJson: NpmSnapFileNames.PackageJson,
  sourceCode: 'source code bundle',
} as const;

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
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param version - The version of the package to fetch, or the string `latest`
 * to fetch the latest version.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetchContent}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export async function fetchNpmSnap(
  packageName: string,
  version: string,
  registryUrl = DEFAULT_NPM_REGISTRY,
  fetchFunction = fetchContent,
): Promise<SnapFiles> {
  const [tarballResponse, actualVersion] = await fetchNpmTarball(
    packageName,
    version,
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
 * Snap validation failure reason codes that are programmatically fixable
 * if validation occurs during development.
 */
export enum SnapValidationFailureReason {
  NameMismatch = '"name" field mismatch',
  VersionMismatch = '"version" field mismatch',
  RepositoryMismatch = '"repository" field mismatch',
  ShasumMismatch = '"shasum" field mismatch',
}

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
 * Validates the files extracted from an npm Snap package tarball by ensuring
 * that they're non-empty and that the Json files match their respective schemas
 * and the Snaps publishing specification.
 *
 * @param snapFiles - The object containing the expected Snap file contents,
 * if any.
 * @param packageName - The name of the package whose tarball to fetch.
 * @param version - The version of the package to fetch, or the string `latest`.
 * @param errorPrefix - The prefix of the error message.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export function validateNpmSnap(
  snapFiles: UnvalidatedSnapFiles,
  errorPrefix: `${string}: `,
): SnapFiles {
  ExpectedSnapFiles.forEach((key) => {
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
 * @param manifest - The npm Snap manifest to validate.
 * @param packageJson - The npm Snap's `package.json`.
 * @param sourceCode - The Snap's source code.
 * @param errorPrefix - The prefix for error messages.
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
 * @param version - The semver range of the package to fetch, max satisfying will be fetched
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetchContent}. Useful for Node.js compatibility.
 * @returns A tuple of the {@link Response} for the package tarball and the
 * actual version of the package.
 */
async function fetchNpmTarball(
  packageName: string,
  version: string,
  registryUrl = DEFAULT_NPM_REGISTRY,
  fetchFunction = fetchContent,
): Promise<[ReadableStream, string]> {
  const packageMetadata = await (
    await fetchFunction(new URL(packageName, registryUrl).toString())
  ).json();

  if (!isPlainObject(packageMetadata)) {
    throw new Error(
      `Failed to fetch package "${packageName}" metadata from npm.`,
    );
  }

  const targetVersion = maxSatisfyingSemver(
    Object.keys((packageMetadata as any)?.versions ?? {}),
    version,
  );

  if (targetVersion === null) {
    throw new Error(
      `Failed to find a matching version in npm metadata for package "${packageName}" and requested semver range "${version}"`,
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

// The paths of files within npm tarballs appear to always be prefixed with
// "package/".
const NPM_TARBALL_PATH_PREFIX = /^package\//u;

/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param snapFiles - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */
function createTarballExtractionStream(
  snapFiles: UnvalidatedSnapFiles,
): Writable {
  // `tar-stream` is pretty old-school, so we create it first and then
  // instrument it by adding event listeners.
  const extractStream = tarExtract();

  // `tar-stream` reads every file in the tarball serially. We already know
  // where to look for package.json and the Snap manifest, but we don't know
  // where the source code is. Therefore, we cache the contents of each .js
  // file in the tarball and pick out the correct one when the stream has ended.
  const jsFileCache = new Map<string, Buffer>();

  // "entry" is fired for every discreet entity in the tarball. This includes
  // files and folders.
  extractStream.on('entry', (header, entryStream, next) => {
    const { name: headerName, type: headerType } = header;
    if (headerType === 'file') {
      // The name is a path if the header type is "file".
      const filePath = headerName.replace(NPM_TARBALL_PATH_PREFIX, '');

      // Note the use of `concat-stream` since the data for each file may be
      // chunked.
      if (filePath === NpmSnapFileNames.PackageJson) {
        return entryStream.pipe(
          concat((data) => {
            try {
              snapFiles.packageJson = JSON.parse(data.toString());
            } catch (_error) {
              return extractStream.destroy(
                new Error(`Failed to parse "${NpmSnapFileNames.PackageJson}".`),
              );
            }

            return next();
          }),
        );
      } else if (filePath === NpmSnapFileNames.Manifest) {
        return entryStream.pipe(
          concat((data) => {
            try {
              snapFiles.manifest = JSON.parse(data.toString());
            } catch (_error) {
              return extractStream.destroy(
                new Error(`Failed to parse "${NpmSnapFileNames.Manifest}".`),
              );
            }

            return next();
          }),
        );
      } else if (/\w+\.(?:js|svg)$/u.test(filePath)) {
        return entryStream.pipe(
          concat((data) => {
            jsFileCache.set(filePath, data);
            return next();
          }),
        );
      }
    }

    // If we get here, the entry is not a file, and we want to ignore. The entry
    // stream must be drained, or the extractStream will stop reading. This is
    // effectively a no-op for the current entry.
    entryStream.on('end', () => next());
    return entryStream.resume();
  });

  // When we've read the entire tarball, attempt to grab the bundle file
  // contents from the .js file cache.
  extractStream.on('finish', () => {
    if (isPlainObject(snapFiles.manifest)) {
      /* istanbul ignore next: optional chaining */
      const { filePath: bundlePath, iconPath } =
        (snapFiles.manifest as unknown as Partial<SnapManifest>).source
          ?.location?.npm ?? {};

      if (bundlePath) {
        snapFiles.sourceCode = jsFileCache.get(bundlePath)?.toString('utf8');
      }

      if (typeof iconPath === 'string' && iconPath.endsWith('.svg')) {
        snapFiles.svgIcon = jsFileCache.get(iconPath)?.toString('utf8');
      }
    }
    jsFileCache.clear();
  });

  return extractStream;
}

/**
 * Checks whether the source.shasum property of the specified Snap manifest
 * matches the shasum of the specified snap source code string.
 *
 * @param manifest - The manifest whose shasum to validate.
 * @param sourceCode - The source code of the snap.
 */
export function validateSnapShasum(
  manifest: SnapManifest,
  sourceCode: string,
  errorMessage = 'Invalid Snap manifest: manifest shasum does not match computed shasum.',
): void {
  if (manifest.source.shasum !== getSnapSourceShasum(sourceCode)) {
    throw new ProgrammaticallyFixableSnapError(
      errorMessage,
      SnapValidationFailureReason.ShasumMismatch,
    );
  }
}

/**
 * Converts a {@link ReadableStream} to a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param response - The response whose body stream to get.
 * @returns The response body stream, as a Node.js Readable stream.
 */
function getNodeStream(stream: ReadableStream): Readable {
  if (typeof stream.getReader !== 'function') {
    return stream as unknown as Readable;
  }

  return new ReadableWebToNodeStream(stream);
}

/**
 * @param maybeUrl - The string to check.
 * @returns Whether the specified string is a valid URL.
 */
function isValidUrl(maybeUrl: string): maybeUrl is string {
  try {
    return Boolean(new URL(maybeUrl));
  } catch (_error) {
    return false;
  }
}

/**
 * Parse a version received by some subject attempting to access a snap.
 * @param version - The received version value.
 * @returns `*` if the version is `undefined` or `latest", otherwise returns
 * the specified version.
 */
export function resolveVersion(version?: Json): Json {
  if (version === undefined || version === 'latest') {
    return DEFAULT_REQUESTED_SNAP_VERSION;
  }
  return version;
}
