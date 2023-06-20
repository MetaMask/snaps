import { evalBundle, isFile } from '@metamask/snaps-utils';
import { underline } from 'chalk';
import { resolve } from 'path';

import { ProcessedConfig } from '../../config';
import { CommandError, success } from '../../logging';
import { getRelativePath } from '../../utils';

export type EvalOptions = {
  input?: string;
};

/**
 * Returns the path to the bundle, based on the bundler.
 *
 * - If the bundler is Browserify, the bundle path is the `cliOptions.bundle`
 * value.
 * - If the bundler is Webpack, the bundle path is the `output.path` and
 * `output.filename` values.
 *
 * @param config - The processed config object.
 * @param options - The eval options.
 * @returns The path to the bundle.
 */
function getBundlePath(config: ProcessedConfig, options: EvalOptions): string {
  if (options.input) {
    return resolve(process.cwd(), options.input);
  }

  if (config.bundler === 'browserify') {
    return resolve(process.cwd(), config.cliOptions.bundle);
  }

  return resolve(process.cwd(), config.output.path, config.output.filename);
}

/**
 * Runs the snap in a worker, to ensure SES compatibility.
 *
 * @param config - The processed config object.
 * @param options - The eval options.
 * @returns A promise that resolves once the eval has finished.
 * @throws If the eval failed.
 */
export async function evaluate(
  config: ProcessedConfig,
  options: EvalOptions = {},
): Promise<void> {
  const bundlePath = getBundlePath(config, options);
  const relativePath = getRelativePath(bundlePath);

  if (!(await isFile(bundlePath))) {
    throw new CommandError(
      `Failed to evaluate snap bundle "${underline(
        relativePath,
      )}" in SES: The specified file does not exist.`,
    );
  }

  try {
    await evalBundle(bundlePath);
    success(
      `Snap bundle "${underline(relativePath)}" successfully evaluated in SES.`,
    );
  } catch (error) {
    throw new CommandError(
      `Failed to evaluate snap bundle "${relativePath}" in SES: ${error.message}`,
    );
  }
}
