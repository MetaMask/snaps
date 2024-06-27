import type { ProcessedWebpackConfig } from '../config';
import type { WebpackOptions } from './config';
/**
 * Get a Webpack compiler for the given config.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns The Webpack compiler.
 */
export declare function getCompiler(config: ProcessedWebpackConfig, options?: WebpackOptions): Promise<import("webpack").Compiler>;
