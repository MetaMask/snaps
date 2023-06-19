import deepMerge from 'deepmerge';

import {
  getConfig,
  ProcessedBrowserifyConfig,
  ProcessedWebpackConfig,
} from '../config';

const DEFAULT_OPTIONS = {
  browserify: {},
  webpack: {
    input: 'src/index.ts',
  },
};

/**
 * Get a mock config object. The mock config is generated from the given
 * bundler type.
 *
 * @param bundler - The bundler to use.
 * @param options - The options to use for the mock config.
 * @returns The mock config object for the given bundler.
 */
export function getMockConfig<
  Bundler extends 'browserify' | 'webpack',
  Result = Bundler extends 'browserify'
    ? ProcessedBrowserifyConfig
    : ProcessedWebpackConfig,
>(bundler: Bundler, options?: Partial<Result>): Result {
  return getConfig(
    deepMerge(
      { bundler },
      options ?? (DEFAULT_OPTIONS[bundler] as Partial<Result>),
    ),
  ) as Result;
}
