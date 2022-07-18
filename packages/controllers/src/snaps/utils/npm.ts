import { isObject } from '@metamask/utils';
import pump from 'pump';
import createGunzipStream from 'gunzip-maybe';
import {
  SnapFiles,
  UnvalidatedSnapFiles,
  isValidUrl,
  getTargetVersion,
  validateNpmSnap,
} from '@metamask/snap-utils';

import { createTarballExtractionStream, getNodeStream } from './stream';

export const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

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
