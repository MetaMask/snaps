import type { Watching } from 'webpack';
import type { ProcessedWebpackConfig } from '../../config';
import type { WebpackOptions } from '../../webpack';
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
export declare function watch(config: ProcessedWebpackConfig, options?: WebpackOptions): Promise<Watching>;
