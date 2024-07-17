import type { ProcessedWebpackConfig } from '../../config';
import type { WebpackOptions } from '../../webpack';
/**
 * Build the snap bundle. This uses Webpack to build the bundle.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns A promise that resolves when the bundle is built.
 */
export declare function build(config: ProcessedWebpackConfig, options?: WebpackOptions): Promise<void>;
