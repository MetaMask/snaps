import { Transform, TransformCallback } from 'stream';
import fs from 'fs';
import os from 'os';
import pathUtils from 'path';
import { BrowserifyObject } from 'browserify';
import {
  evalBundle,
  postProcessBundle,
  PostProcessOptions,
} from '@metamask/snap-utils';
import { fromSource } from 'convert-source-map';
import ReadableStream = NodeJS.ReadableStream;

const TEMP_BUNDLE_PATH = pathUtils.join(os.tmpdir(), 'snaps-bundle.js');

export type PluginOptions = {
  eval?: boolean;
  fixManifest?: boolean;
};

export type Options = PluginOptions & PostProcessOptions;

/**
 * A transform stream which can be used in the Browserify pipeline. It accepts a
 * string input, which is post-processed and pushed to the output stream.
 */
export class SnapsBrowserifyTransform extends Transform {
  readonly #data: Buffer[] = [];

  readonly #options: Partial<Options>;

  /**
   * Construct an instance of the transform stream.
   *
   * @param options - The post-processing options.
   * @param options.stripComments - Whether to strip comments. Defaults to `true`.
   * @param options.transformHtmlComments - Whether to transform HTML comments.
   * Defaults to `true`.
   */
  constructor(options: Partial<Options> = {}) {
    super();
    this.#options = { ...options };
  }

  /**
   * Takes a chunk of data and pushes it into an internal array, for later
   * processing.
   *
   * @param chunk - The chunk of data to transform.
   * @param _encoding - The encoding of the chunk.
   * @param callback - The callback to call when the chunk is processed.
   */
  _transform(
    chunk: Buffer,
    _encoding: BufferEncoding,
    callback: TransformCallback,
  ) {
    // Collects all the chunks into an array.
    this.#data.push(chunk);
    callback();
  }

  /**
   * Takes the internal array of chunks and processes them. The processed code
   * is pushed to the output stream.
   *
   * @param callback - The callback to call when the stream is finished.
   */
  _flush(callback: TransformCallback) {
    // Merges all the chunks into a single string and processes it.
    const code = Buffer.concat(this.#data).toString('utf-8');

    // Browserify uses inline source maps, so we attempt to read it here, and
    // convert it to an object.
    const inputSourceMap = fromSource(code)?.toObject() ?? undefined;

    const result = postProcessBundle(code, {
      ...this.#options,
      sourceMap: Boolean(inputSourceMap) && 'inline',
      inputSourceMap,
    });

    if (result) {
      this.push(result.code);
    }

    callback();
  }
}

/**
 * Write a bundle to a temporary file.
 *
 * @param path - The path to write the bundle to.
 * @param bundleStream - The Browserify bundle stream.
 * @returns A promise that resolves once the stream has finished writing.
 */
async function writeBundle(
  path: string,
  bundleStream: ReadableStream,
): Promise<void> {
  const tempStream = fs.createWriteStream(path);

  bundleStream.pipe(tempStream);

  return new Promise((resolve, reject) => {
    tempStream.on('finish', resolve);
    tempStream.on('error', reject);
  });
}

/**
 * Asynchronously wait for the `bundle` event to be emitted by the given
 * Browserify instance.
 *
 * @param browserifyInstance - The Browserify instance.
 * @returns A promise that resolves with the emitted bundle stream.
 */
async function waitForBundle(
  browserifyInstance: BrowserifyObject,
): Promise<ReadableStream> {
  return new Promise<ReadableStream>((resolve, reject) => {
    browserifyInstance.on('bundle', resolve);
    browserifyInstance.on('error', reject);
  });
}

/**
 * The Browserify plugin function. Can be passed to the Browserify `plugin`
 * function, or used by simply passing the package name to `plugin`.
 *
 * @param browserifyInstance - The Browserify instance.
 * @param options - The plugin options.
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.eval - Whether to evaluate the bundle to test SES
 * compatibility. Defaults to `true`.
 * @param options.fixManifest - Whether to fix the manifest. Defaults to `true`.
 * Defaults to `true`.
 */
export default async function plugin(
  browserifyInstance: BrowserifyObject,
  options: Partial<Options>,
): Promise<void> {
  const defaultOptions = { eval: true, fixManifest: true, ...options };

  // Pushes the transform stream at the end of Browserify's pipeline. This
  // ensures that the transform is run on the entire bundle.
  browserifyInstance.pipeline.push(new SnapsBrowserifyTransform(options));

  if (defaultOptions.eval) {
    const bundleStream = await waitForBundle(browserifyInstance);

    await writeBundle(TEMP_BUNDLE_PATH, bundleStream);
    await evalBundle(TEMP_BUNDLE_PATH);
    await fs.promises.unlink(TEMP_BUNDLE_PATH);
  }
}
