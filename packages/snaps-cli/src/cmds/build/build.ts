import {
  getOutfilePath,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '@metamask/snaps-utils';
import { webpack } from 'webpack';

import { ProcessedBrowserifyConfig } from '../../config';
import { YargsArgs } from '../../types/yargs';
import { getDefaultConfiguration } from '../../webpack';
import { evalHandler } from '../eval/evalHandler';
import { manifestHandler } from '../manifest/manifestHandler';
import { bundle } from './bundle';

/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param argv - Argv from Yargs.
 * @param config - The config object.
 * @param config.cliOptions - The CLI options.
 * @param config.bundlerCustomizer - A function that customizes the bundler.
 * @deprecated
 */
async function legacyBuild(
  argv: YargsArgs,
  { cliOptions, bundlerCustomizer }: ProcessedBrowserifyConfig,
): Promise<void> {
  if (cliOptions.outfileName) {
    validateOutfileName(cliOptions.outfileName);
  }

  await validateFilePath(cliOptions.src);
  await validateDirPath(cliOptions.dist, true);

  const outfilePath = getOutfilePath(cliOptions.dist, cliOptions.outfileName);
  const result = await bundle(
    cliOptions.src,
    outfilePath,
    argv,
    bundlerCustomizer,
  );

  if (result && cliOptions.eval) {
    await evalHandler({ ...argv, bundle: outfilePath });
  }

  if (argv.manifest) {
    await manifestHandler(argv);
  }
}

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
    return await legacyBuild(argv, config);
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
