import { Readable, Writable } from 'stream';
import { ReadableWebToNodeStream } from 'readable-web-to-node-stream';
import { extract as tarExtract } from 'tar-stream';
import concat from 'concat-stream';
import { isObject } from '@metamask/utils';
import { SnapManifest } from './json-schemas';
import { NpmSnapFileNames, UnvalidatedSnapFiles } from './types';

// The paths of files within npm tarballs appear to always be prefixed with
// "package/".
const NPM_TARBALL_PATH_PREFIX = /^package\//u;

/**
 * Strips the leading `./` from a string, or does nothing if no string is
 * provided.
 *
 * @param pathString - The path string to normalize.
 * @returns The specified path without a `./` prefix, or `undefined` if no
 * string was provided.
 */
export function stripDotSlash(pathString?: string): string | undefined {
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
export function getNodeStream(stream: ReadableStream): Readable {
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
export function createTarballExtractionStream(
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

  // Once we've read the entire tarball, attempt to grab the bundle file
  // contents from the .js file cache.
  extractStream.once('finish', () => {
    if (isObject(snapFiles.manifest)) {
      /* istanbul ignore next: optional chaining */
      const { filePath: _bundlePath, iconPath: _iconPath } =
        (snapFiles.manifest as unknown as Partial<SnapManifest>).source
          ?.location?.npm ?? {};

      const bundlePath = stripDotSlash(_bundlePath);
      const iconPath = stripDotSlash(_iconPath);

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
