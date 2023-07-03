import {
  validateDirPath,
  validateFilePath,
  validateOutfileName,
} from '@metamask/snaps-utils';
import { resolve } from 'path';

import { ProcessedBrowserifyConfig } from '../../../config';
import { evaluate } from '../../eval';
import { manifest } from '../../manifest';
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
  const { cliOptions } = config;
  if (cliOptions.outfileName) {
    validateOutfileName(cliOptions.outfileName);
  }

  await validateFilePath(cliOptions.src);
  await validateDirPath(cliOptions.dist, true);

  const result = await bundle(config);
  if (result && cliOptions.eval) {
    const bundlePath = resolve(
      process.cwd(),
      cliOptions.dist,
      cliOptions.outfileName,
    );

    await evaluate(bundlePath);
  }

  if (cliOptions.manifest) {
    const manifestPath = resolve(process.cwd(), 'snap.manifest.json');
    await manifest(manifestPath, cliOptions.writeManifest);
  }
}
