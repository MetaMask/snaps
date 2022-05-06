import { Transform, TransformCallback } from 'stream';
import { BrowserifyObject } from 'browserify';
import { postProcessBundle, PostProcessOptions } from '@metamask/snap-utils';

export type Options = PostProcessOptions;

/**
 * A transform stream which can be used a the Browserify pipeline. It accepts a
 * string input, which is post-processed and pushed to the output stream.
 */
export class SnapsBrowserifyTransform extends Transform {
  readonly #data: Buffer[] = [];

  readonly #options: Partial<Options>;

  /**
   * @param options - The post-processing options.
   */
  constructor(options: Partial<Options> = {}) {
    super();
    this.#options = { ...options };
  }

  _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
    // Collects all the chunks into an array.
    this.#data.push(chunk);
    callback();
  }

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
 */
export default function plugin(
  browserify: BrowserifyObject,
  options: Partial<Options>,
) {
  // Pushes the transform stream at the end of Browserify's pipeline. This
  // ensures that the transform is run on the entire bundle.
  browserify.pipeline.push(new SnapsBrowserifyTransform(options));
}
