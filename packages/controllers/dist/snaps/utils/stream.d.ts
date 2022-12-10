/// <reference types="node" />
import { Readable, Writable } from 'stream';
import { UnvalidatedSnapFiles } from '@metamask/snap-utils';
/**
 * Strips the leading `./` from a string, or does nothing if no string is
 * provided.
 *
 * @param pathString - The path string to normalize.
 * @returns The specified path without a `./` prefix, or `undefined` if no
 * string was provided.
 */
export declare function stripDotSlash(pathString?: string): string | undefined;
/**
 * Converts a {@link ReadableStream} to a Node.js {@link Readable}
 * stream. Returns the stream directly if it is already a Node.js stream.
 * We can't use the native Web {@link ReadableStream} directly because the
 * other stream libraries we use expect Node.js streams.
 *
 * @param stream - The stream to convert.
 * @returns The given stream as a Node.js Readable stream.
 */
export declare function getNodeStream(stream: ReadableStream): Readable;
/**
 * Creates a `tar-stream` that will get the necessary files from an npm Snap
 * package tarball (`.tgz` file).
 *
 * @param snapFiles - An object to write target file contents to.
 * @returns The {@link Writable} tarball extraction stream.
 */
export declare function createTarballExtractionStream(snapFiles: UnvalidatedSnapFiles): Writable;
