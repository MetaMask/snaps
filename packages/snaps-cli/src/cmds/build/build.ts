import { webpack } from 'webpack';

import { YargsArgs } from '../../types/yargs';
import { getDefaultConfiguration } from '../../webpack';
import { legacyBuild } from './legacy';

/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param argv - Argv from Yargs.
 */
export async function build(argv: YargsArgs): Promise<void> {
  const {
    context: { config },
  } = argv;

  if (config.bundler === 'browserify') {
    return await legacyBuild(config);
  }

  const baseWebpackConfig = getDefaultConfiguration(config);
  const webpackConfig =
    config.customizeWebpackConfig?.(baseWebpackConfig) ?? baseWebpackConfig;

  const compiler = webpack(webpackConfig);
  return await new Promise<void>((resolve, reject) => {
    compiler.run((error, stats) => {
      if (error) {
        reject(error);
        return;
      }

      if (stats?.hasErrors()) {
        reject(stats.toString());
        return;
      }

      resolve();
    });
  });
}
