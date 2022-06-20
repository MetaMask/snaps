import { Transform, TransformCallback } from 'stream';
import { BrowserifyObject } from 'browserify';
import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';

export type Options = PostProcessOptions;

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
    const transformedCode = postProcessBundle(code, this.#options);

    this.push(transformedCode);
    callback();
  }
}

/**
 * The Browserify plugin function. Can be passed to the Browserify `plugin`
 * function, or used by simply passing the package name to `plugin`.
 *
 * @param browserify
 * @param options
 * @param options.stripComments - Whether to strip comments. Defaults to `true`.
 * @param options.transformHtmlComments - Whether to transform HTML comments.
 * Defaults to `true`.
 */
export default function plugin(
  browserify: BrowserifyObject,
  options: Partial<Options>,
) {
  // Pushes the transform stream at the end of Browserify's pipeline. This
  // ensures that the transform is run on the entire bundle.
  browserify.pipeline.push(new SnapsBrowserifyTransform(options));
}
