import deepMerge from 'deepmerge';

import type {
  LegacyOptions,
  ProcessedBrowserifyConfig,
  ProcessedWebpackConfig,
} from '../config';
import { getConfig } from '../config';

const DEFAULT_OPTIONS = {
  browserify: {},
  webpack: {
    input: 'src/index.ts',
  },
};

type MockConfigResult<Bundler extends 'browserify' | 'webpack'> =
  Bundler extends 'browserify'
    ? Omit<ProcessedWebpackConfig, 'legacy'> & {
        legacy: LegacyOptions;
      }
    : ProcessedWebpackConfig;

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
>(bundler: Bundler, options?: Partial<Result>): MockConfigResult<Bundler> {
  return getConfig(
    deepMerge(
      { bundler },
      options ?? (DEFAULT_OPTIONS[bundler] as Partial<Result>),
    ),
    // @ts-expect-error - Invalid `argv` type, but it's not used in tests.
    {},
  ) as MockConfigResult<Bundler>;
}
