import { evalBundle, logInfo } from '@metamask/snaps-utils';
import { resolve } from 'path';

import { ProcessedConfig } from '../../config';
import { getRelativePath } from '../../utils';

/**
 * Returns the path to the bundle, based on the bundler.
 *
 * - If the bundler is Browserify, the bundle path is the `cliOptions.bundle`
 * value.
 * - If the bundler is Webpack, the bundle path is the `output.path` and
 * `output.filename` values.
 *
 * @param config - The processed config object.
 * @param config.cliOptions - The CLI options object.
 * @returns The path to the bundle.
 */
function getBundlePath(config: ProcessedConfig) {
  if (config.bundler === 'browserify') {
    return config.cliOptions.bundle;
  }

  return resolve(config.output.path, config.output.filename);
}

/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param config - The processed config object.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export async function evaluate(config: ProcessedConfig): Promise<void> {
  const bundlePath = getBundlePath(config);
  const relativePath = getRelativePath(bundlePath);

  try {
    await evalBundle(bundlePath);

    logInfo(`Snap bundle "${relativePath}" successfully evaluated in SES.`);
  } catch (error) {
    throw new Error(
      `Failed to evaluate snap bundle "${relativePath}" in SES: ${error.message}`,
    );
  }
}
