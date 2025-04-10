import { webpack } from 'webpack';

import type { WebpackOptions } from './config';
import { getDefaultConfiguration } from './config';
import type { ProcessedConfig } from '../config';

/**
 * Get a Webpack compiler for the given config.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns The Webpack compiler.
 */
export async function getCompiler(
  config: ProcessedConfig,
  options?: WebpackOptions,
) {
  const baseWebpackConfig = await getDefaultConfiguration(config, options);
  const webpackConfig =
    config.customizeWebpackConfig?.(baseWebpackConfig) ?? baseWebpackConfig;

  return webpack(webpackConfig);
}
