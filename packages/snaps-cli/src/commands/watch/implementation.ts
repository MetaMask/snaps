import { join } from 'path';
import { Watching } from 'webpack';

import { ProcessedWebpackConfig } from '../../config';
import { getCompiler, WebpackOptions } from '../../webpack';

/**
 * Build the snap bundle and watch for changes. This uses Webpack to build the
 * bundle.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns A promise that resolves when the bundle is built for the first time.
 * The promise resolves with a Webpack watching instance that can be used to
 * close the watcher.
 */
export async function watch(
  config: ProcessedWebpackConfig,
  options?: WebpackOptions,
) {
  const compiler = getCompiler(config, {
    evaluate: config.evaluate,
    watch: true,
    spinner: options?.spinner,
  });

  return new Promise<Watching>((resolve, reject) => {
    compiler.watch(
      {
        ignored: [
          '**/node_modules/**/*',
          join(process.cwd(), config.output.path, '**/*'),
        ],
      },
      (watchError) => {
        if (watchError) {
          reject(watchError);
          return;
        }

        resolve(compiler.watching);
      },
    );
  });
}
