import {
  getConfig,
  ProcessedBrowserifyConfig,
  ProcessedWebpackConfig,
} from '../config';

/**
 * Get a mock config object. The mock config is generated from the given
 * bundler type.
 *
 * @param bundler - The bundler to use.
 * @returns The mock config object for the given bundler.
 */
export function getMockConfig<
  Bundler extends 'browserify' | 'webpack',
  Result = Bundler extends 'browserify'
    ? ProcessedBrowserifyConfig
    : ProcessedWebpackConfig,
>(bundler: Bundler): Result {
  return getConfig({
    bundler,
  }) as Result;
}
