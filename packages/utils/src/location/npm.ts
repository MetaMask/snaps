import { assert, isObject } from '@metamask/utils';
import concat from 'concat-stream';
import createGunzipStream from 'gunzip-maybe';
import pump from 'pump';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { Readable, Writable } from 'stream';
import { extract as tarExtract } from 'tar-stream';
import { isValidUrl } from '../url';
import { getTargetVersion } from '../versions';
import { SnapLocation } from './location';

const DEFAULT_NPM_REGISTRY = 'https://registry.npmjs.org';

export class NpmLocation implements SnapLocation {
  static async create(
    root: string | URL,
    versionRange: string,
    opts = { fetch: fetch },
  ): Promise<NpmLocation> {
    root = new URL(root);
    assert(root.protocol === 'npm:');

    let registry;
    if (
      root.host === '' &&
      root.port === '' &&
      root.username === '' &&
      root.password === ''
    ) {
      registry = new URL(DEFAULT_NPM_REGISTRY);
    } else {
      registry = 'https://';
      if (root.username) {
        registry += root.username;
        if (root.password) {
          registry += `:${root.password}`;
        }
        registry += '@';
      }
      registry += root.host;
      registry = new URL(registry);
    }

    assert(
      root.pathname !== '' && root.pathname !== '/',
      new TypeError('The package name in NPM location is empty'),
    );
    let packageName = root.pathname;
    if (packageName[0] === '/') {
      packageName = packageName.slice(1);
    }

    const [tarballResponse, actualVersion] = await fetchNpmTarball(
      packageName,
      versionRange,
      registry,
      opts.fetch,
    );

    // TODO(ritave): Lazily extract tar instead of up-front
    const data = new Map<string, Blob>();
    await new Promise<void>((resolve, reject) => {
      pump(
        getNodeStream(tarballResponse),
        // The "gz" in "tgz" stands for "gzip". The tarball needs to be decompressed
        // before we can actually grab any files from it.
        createGunzipStream(),
        createTarballStream(data),
        (error) => {
          error ? reject(error) : resolve();
        },
      );
    });

    return new NpmLocation(
      { registry, packageName, requestedRange: versionRange, actualVersion },
      data,
    );
  }

  private validatedManifest?: any;

  private constructor(
    private meta: {
      registry: URL;
      packageName: string;
      requestedRange: string;
      actualVersion: string;
    },
    private data: Map<string, Blob>,
  ) {}

  async manifest(): Promise<unknown> {
    if (this.validatedManifest) {
      return this.validatedManifest;
    }

    const file = JSON.parse(await (await this.fetch('/package.json')).text());
    this.validatedManifest = file;
    return file;
  }

  async fetch(path: string): Promise<Blob> {
    if (path[0] === '/') {
      path = path.slice(1);
    }
    const contents = this.data.get(path);
    assert(contents !== undefined);
    return contents;
  }

  get packageName(): string {
    return this.meta.packageName;
  }
  get version(): string {
    return this.meta.actualVersion;
  }
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
  registryUrl: URL | string,
  fetchFunction: typeof fetch,
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

/**
 * The paths of files within npm tarballs appear to always be prefixed with
 * "package/".
 */
const NPM_TARBALL_PATH_PREFIX = /^package\//u;

/**
 * Strips the leading `./` from a string, or does nothing if no string is
 * provided.
 *
 * @param pathString - The path string to normalize.
 * @returns The specified path without a `./` prefix, or `undefined` if no
 * string was provided.
 */
function stripDotSlash(pathString?: string): string | undefined {
  return pathString?.replace(/^\.\//u, '');
}

/**
 * Converts a {@link ReadableStream} to a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param stream - The stream to convert.
 * @returns The given stream as a Node.js Readable stream.
 */
function getNodeStream(stream: ReadableStream): Readable {
  if (typeof stream.getReader !== 'function') {
    return stream as unknown as Readable;
  }

  return new ReadableWebToNodeStream(stream);
}

/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param snapFiles - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */
function createTarballStream(files: Map<string, Blob>): Writable {
  // `tar-stream` is pretty old-school, so we create it first and then
  // instrument it by adding event listeners.
  const extractStream = tarExtract();

  // "entry" is fired for every discreet entity in the tarball. This includes
  // files and folders.
  extractStream.on('entry', (header, entryStream, next) => {
    const { name: headerName, type: headerType } = header;
    if (headerType === 'file') {
      // The name is a path if the header type is "file".
      const filePath = headerName.replace(NPM_TARBALL_PATH_PREFIX, '');
      return entryStream.pipe(
        concat((data) => {
          files.set(filePath, new Blob([data]));
          return next();
        }),
      );
    }

    // If we get here, the entry is not a file, and we want to ignore. The entry
    // stream must be drained, or the extractStream will stop reading. This is
    // effectively a no-op for the current entry.
    entryStream.on('end', () => next());
    return entryStream.resume();
  });
  return extractStream;
}
