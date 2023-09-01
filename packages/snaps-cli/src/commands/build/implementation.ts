import type { ProcessedWebpackConfig } from '../../config';
import type { WebpackOptions } from '../../webpack';
import { getCompiler } from '../../webpack';

/**
 * Build the snap bundle. This uses Webpack to build the bundle.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns A promise that resolves when the bundle is built.
 */
export async function build(
  config: ProcessedWebpackConfig,
  options?: WebpackOptions,
) {
  const compiler = await getCompiler(config, options);
  return await new Promise<void>((resolve, reject) => {
    compiler.run((runError) => {
      if (runError) {
        reject(runError);
        return;
      }

      compiler.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve();
      });
    });
  });
}
