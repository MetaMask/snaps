import { Transform, TransformCallback } from 'stream';
import { BrowserifyObject } from 'browserify';
import { postProcess, PostProcessOptions } from '@metamask/snap-utils';

export type Options = PostProcessOptions;

/**
 * Get a transformer which can be used with the Browserify `transform` function.
 * It accepts a string input, which is post-processed and pushed to the output
 * stream.
 *
 * @param _file
 * @param options
 */
export function getTransform(
  _file: string,
  options: Partial<Options>,
): Transform {
  // return new Transform({
  //   transform(chunk, _, callback) {
  //     const code = chunk.toString();
  //     const transformedCode = postProcess(code, options);
  //
  //     this.push(transformedCode);
  //
  //     callback();
  //   },
  // });

  const Transformer = class extends Transform {
    readonly #data: Buffer[] = [];

    _transform(chunk: Buffer, _: BufferEncoding, callback: TransformCallback) {
      // Collects all the chunks into an array.
      this.#data.push(chunk);
      callback();
    }

    _flush(callback: TransformCallback) {
      // Merges all the chunks into a single string and processes it.
      const code = Buffer.concat(this.#data).toString('utf-8');
      const transformedCode = postProcess(code, options);

      this.push(transformedCode);
      callback();
    }
  };

  return new Transformer();
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
  browserify.transform(getTransform, options);
}
