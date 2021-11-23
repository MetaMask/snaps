import { createHash } from 'crypto';
import { pipeline as _pipeline, Readable } from 'stream';
import type { Writable } from 'stream';
import { promisify } from 'util';
import { Json } from '@metamask/controllers';
import concat from 'concat-stream';
import deepEqual from 'fast-deep-equal';
import createGunzipStream from 'gunzip-maybe';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { extract as tarExtract } from 'tar-stream';
import { isPlainObject } from '../utils';
import {
  NpmSnapPackageJson,
  SnapManifest,
  validateSnapManifest,
  validateNpmSnapPackageJson,
} from './json-schemas';

const pipeline = promisify(_pipeline);

export enum SnapIdPrefixes {
  npm = 'npm:',
  local = 'local:',
}

export const PACKAGE_JSON = 'package.json';

export const SNAP_MANIFEST_FILE = 'snap.manifest.json';

export const LOCALHOST_HOSTNAMES = new Set(['localhost', '127.0.0.1']);

type FetchContentTypes = 'text' | 'json' | 'arrayBuffer';

/**
 * @param url - The URL to fetch.
 * @param contentType - The content type of the response body.
 * @returns The response body as the specified content type.
 */
export async function fetchContent<ContentType extends FetchContentTypes>(
  url: URL | string,
  contentType: ContentType,
  fetchFunction = fetch,
): Promise<ReturnType<Response[ContentType]>> {
  const response = await fetchFunction(
    typeof url === 'string' ? url : url.toString(),
  );
  return await response[contentType]();
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
    throw new Error(errorMessage);
  }
}

/**
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
  manifest: SNAP_MANIFEST_FILE,
  packageJson: PACKAGE_JSON,
  sourceCode: 'source code bundle',
} as const;

/**
 * An object for storing parsed but unvalidated Snap data.
 */
type InterimSnapData = {
  manifest?: Json;
  packageJson?: Json;
  sourceCode?: string;
};

/**
 * Fetches a Snap from the public npm registry.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param version - The version of the package to fetch, or the string `latest`
 * to fetch the latest version.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export async function fetchNpmSnap(
  packageName: string,
  version: string,
  fetchFunction = fetch,
): Promise<[SnapManifest, string]> {
  const [tarballResponse, actualVersion] = await fetchNpmTarball(
    packageName,
    version,
    fetchFunction,
  );

  // Extract the tarball and get the necessary files from it.
  const snapData: InterimSnapData = {};
  await pipeline([
    getResponseBodyStream(tarballResponse),
    // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
    // before we can actually grab any files from it.
    createGunzipStream(),
    createTarballExtractionStream(snapData),
  ]);

  // At this point, the necessary files will have been added to the snapData
  // object if they exist.
  return validateNpmSnap(snapData, packageName, actualVersion);
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
 * @returns A tuple of the Snap manifest object and the Snap source code.
 */
export function validateNpmSnap(
  snapFiles: InterimSnapData,
  packageName: string,
  version: string,
): [SnapManifest, string] {
  const errorPrefix = `npm Snap "${packageName}@${version}"`;

  ExpectedSnapFiles.forEach((key) => {
    if (!snapFiles[key]) {
      throw new Error(
        `${errorPrefix} contains no ${SnapFileNameFromKey[key]}.`,
      );
    }
  });

  const { manifest, packageJson, sourceCode } =
    snapFiles as Required<InterimSnapData>;
  try {
    validateSnapManifest(manifest);
  } catch (error) {
    throw new Error(
      `${errorPrefix} "${SNAP_MANIFEST_FILE}" is invalid: ${error.message}`,
    );
  }
  const validatedManifest = manifest as SnapManifest;
  const manifestPackageName = validatedManifest.source.location.npm.packageName;
  const manifestPackageVersion = validatedManifest.version;
  const manifestRepository = validatedManifest.repository;

  try {
    validateNpmSnapPackageJson(packageJson);
  } catch (error) {
    throw new Error(
      `${errorPrefix} "${PACKAGE_JSON}" is invalid: ${error.message}`,
    );
  }
  const validatedPackageJson = packageJson as NpmSnapPackageJson;
  const packageJsonName = validatedPackageJson.name;
  const packageJsonVersion = validatedPackageJson.version;
  const packageJsonRepository = validatedPackageJson.repository;

  if (manifestPackageName !== packageJsonName) {
    throw new Error(
      `${errorPrefix} "${SNAP_MANIFEST_FILE}" npm package name ("${manifestPackageName}") does not match the "${PACKAGE_JSON}" "name" field ("${packageJsonName}").`,
    );
  }

  if (manifestPackageVersion !== packageJsonVersion) {
    throw new Error(
      `${errorPrefix} "${SNAP_MANIFEST_FILE}" npm package version ("${manifestPackageVersion}") does not match the "${PACKAGE_JSON}" "version" field ("${packageJsonVersion}").`,
    );
  }

  if (!deepEqual(manifestRepository, packageJsonRepository)) {
    throw new Error(
      `${errorPrefix} "${SNAP_MANIFEST_FILE}" "repository" field does not match the "${PACKAGE_JSON}" "repository" field.`,
    );
  }

  validateSnapShasum(
    validatedManifest,
    sourceCode,
    `${errorPrefix} "${SNAP_MANIFEST_FILE}" "shasum" field does not match computed shasum.`,
  );

  return [validatedManifest, sourceCode];
}

/**
 * Like {@link Response}, but with a non-null {@link Response.body}.
 */
type ResponseWithBody = Omit<Response, 'body'> & { body: ReadableStream };

/**
 * Fetches the tarball (`.tgz` file) of the specified package and version from
 * the public npm registry. Throws an error if fetching fails.
 *
 * @param packageName - The name of the package whose tarball to fetch.
 * @param version - The version of the package to fetch, or the string `latest`
 * to fetch the latest version.
 * @param fetchFunction - The fetch function to use. Defaults to the global
 * {@link fetch}. Useful for Node.js compatibility.
 * @returns A tuple of the {@link Response} for the package tarball and the
 * actual version of the package.
 */
async function fetchNpmTarball(
  packageName: string,
  version: string,
  fetchFunction = fetch,
): Promise<[ResponseWithBody, string]> {
  const packageMetadata = await fetchContent(
    new URL(packageName, 'https://registry.npmjs.org'),
    'json',
    fetchFunction,
  );

  if (!isPlainObject(packageMetadata)) {
    throw new Error(
      `Failed to fetch package "${packageName}" metadata from npm.`,
    );
  }

  const targetVersion =
    version === 'latest'
      ? (packageMetadata as any)['dist-tags']?.latest
      : version;

  const tarballUrlString = (packageMetadata as any).versions?.[targetVersion]
    ?.dist?.tarball;

  if (!isValidUrl(tarballUrlString) || !tarballUrlString.endsWith('.tgz')) {
    throw new Error(
      `Failed to find valid tarball URL in npm metadata for package "${packageName}".`,
    );
  }

  // Perform a raw fetch because we want the Response object itself.
  const tarballResponse = await fetchFunction(tarballUrlString);
  if (!tarballResponse.ok || !tarballResponse.body) {
    throw new Error(`Failed to fetch tarball for package "${packageName}".`);
  }

  return [tarballResponse as ResponseWithBody, targetVersion];
}

// The paths of files within npm tarballs appear to always be prefixed with
// "package/".
const NPM_TARBALL_PATH_PREFIX = /^package\//u;

/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param snapData - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */
function createTarballExtractionStream(snapData: InterimSnapData): Writable {
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
      if (filePath === PACKAGE_JSON) {
        return entryStream.pipe(
          concat((data) => {
            try {
              snapData.packageJson = JSON.parse(data.toString());
            } catch (_error) {
              return extractStream.destroy(
                new Error(`Failed to parse "${PACKAGE_JSON}".`),
              );
            }

            return next();
          }),
        );
      } else if (filePath === SNAP_MANIFEST_FILE) {
        return entryStream.pipe(
          concat((data) => {
            try {
              snapData.manifest = JSON.parse(data.toString());
            } catch (_error) {
              return extractStream.destroy(
                new Error(`Failed to parse "${SNAP_MANIFEST_FILE}".`),
              );
            }

            return next();
          }),
        );
      } else if (/\w+\.js$/u.test(filePath)) {
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
    if (snapData.manifest) {
      const bundlePath = (snapData as any).manifest.source?.location?.npm
        ?.filePath;

      if (bundlePath) {
        snapData.sourceCode = jsFileCache.get(bundlePath)?.toString('utf8');
      }
    }
    jsFileCache.clear();
  });

  return extractStream;
}

/**
 * Gets the body of a {@link fetch} response as a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param response - The response whose body stream to get.
 * @returns The response body stream, as a Node.js Readable stream.
 */
function getResponseBodyStream(response: ResponseWithBody): Readable {
  const { body } = response;
  if (typeof body.getReader !== 'function') {
    return body as unknown as Readable;
  }

  return new ReadableWebToNodeStream(response.body);
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
