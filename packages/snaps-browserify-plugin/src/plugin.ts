import {
  checkManifest,
  evalBundle,
  logWarning,
  postProcessBundle,
  PostProcessOptions,
} from '@metamask/snaps-utils';
import { BrowserifyObject } from 'browserify';
import { fromSource } from 'convert-source-map';
import { promises as fs } from 'fs';
import os from 'os';
import pathUtils from 'path';
import { Transform, TransformCallback } from 'stream';

const TEMP_BUNDLE_PATH = pathUtils.join(os.tmpdir(), 'snaps-bundle.js');

type PluginOptions = {
  eval?: boolean;
  manifestPath?: string;
  writeManifest?: boolean;
};

export type Options = PluginOptions &
  Omit<PostProcessOptions, 'sourceMap' | 'inputSourceMap'>;

/**
 * Run eval on the processed bundle and fix the manifest, if configured.
 *
 * @param options - The plugin options.
 * @param code - The code to eval, if the eval option is enabled.
 */
async function postBundle(options: Partial<Options>, code: string) {
  if (options.eval) {
    await fs.mkdir(pathUtils.dirname(TEMP_BUNDLE_PATH), { recursive: true });
    await fs.writeFile(TEMP_BUNDLE_PATH, code);

    await evalBundle(TEMP_BUNDLE_PATH)
      .catch((error) => {
        throw new Error(`Snap evaluation error: ${error.toString()}`);
      })
      .finally(async () => fs.unlink(TEMP_BUNDLE_PATH));
  }

  if (options.manifestPath) {
    const { errors, warnings } = await checkManifest(
      pathUtils.dirname(options.manifestPath),
      options.writeManifest,
      code,
    );

    if (!options.writeManifest && errors.length > 0) {
      throw new Error(
        `Manifest Error: The manifest is invalid.\n${errors.join('\n')}`,
      );
    }

    if (warnings.length > 0) {
      logWarning(
        'Manifest Warning: Validation of snap.manifest.json completed with warnings.',
      );

      warnings.forEach((warning) => logWarning(`Manifest Warning: ${warning}`));
    }
  }
}

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

    if (result.warnings.length > 0) {
      logWarning(
        `Bundle Warning: Processing of the Snap bundle completed with warnings.\n${result.warnings.join(
          '\n',
        )}`,
      );
    }

    postBundle(this.#options, result.code)
      .catch((error) => {
        callback(error);
      })
      .finally(() => {
        this.push(result.code);
        callback();
      });
  }
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
 * @param options.manifestPath - The path to the manifest file. If provided,
 * the manifest will be validated. Defaults to
 * `process.cwd() + '/snap.manifest.json'`.
 * @param options.writeManifest - Whether to fix the manifest.
 * Defaults to `true`.
 */
export default function plugin(
  browserifyInstance: BrowserifyObject,
  options?: Partial<Options>,
): void {
  const defaultOptions = {
    eval: true,
    manifestPath: pathUtils.join(process.cwd(), 'snap.manifest.json'),
    writeManifest: true,
    ...options,
  };

  // Pushes the transform stream at the end of Browserify's pipeline. This
  // ensures that the transform is run on the entire bundle.
  browserifyInstance.pipeline.push(
    new SnapsBrowserifyTransform(defaultOptions),
  );
}
