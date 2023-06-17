import {
  getOutfilePath,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '@metamask/snaps-utils';

import { ProcessedBrowserifyConfig } from '../../../config';
import { evalHandler } from '../../eval/evalHandler';
import { manifestHandler } from '../../manifest/manifestHandler';
import { bundle } from './bundle';

/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param config - The config object.
 * @param config.cliOptions - The CLI options.
 * @param config.bundlerCustomizer - A function that customizes the bundler.
 * @deprecated
 */
export async function legacyBuild(
  config: ProcessedBrowserifyConfig,
): Promise<void> {
  const { cliOptions, bundlerCustomizer } = config;
  if (cliOptions.outfileName) {
    validateOutfileName(cliOptions.outfileName);
  }

  await validateFilePath(cliOptions.src);
  await validateDirPath(cliOptions.dist, true);

  const outfilePath = getOutfilePath(cliOptions.dist, cliOptions.outfileName);
  const result = await bundle(
    cliOptions.src,
    outfilePath,
    config,
    bundlerCustomizer,
  );

  if (result && cliOptions.eval) {
    await evalHandler({ ...config, bundle: outfilePath });
  }

  if (cliOptions.manifest) {
    await manifestHandler(config);
  }
}
