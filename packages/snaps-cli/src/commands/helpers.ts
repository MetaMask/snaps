import { evalBundle, SnapEvalError } from '@metamask/snaps-utils';
import { red } from 'chalk';

import { ProcessedWebpackConfig } from '../config';
import { CommandError } from '../errors';
import { indent } from '../utils';
import { getCompiler, WebpackOptions } from '../webpack';

/**
 * Build the snap bundle. This uses Webpack to build the bundle.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns A promise that resolves when the bundle is built.
 */
export async function compile(
  config: ProcessedWebpackConfig,
  options?: WebpackOptions,
) {
  const compiler = getCompiler(config, options);
  return await new Promise<void>((resolve, reject) => {
    compiler.run(() => {
      compiler.close((closeError) => {
        if (closeError) {
          reject(closeError);
          return;
        }

        resolve();
      });
    });
  });
}

/**
 * Evaluate the given bundle in the SES environment. This is a wrapper around
 * {@link evalBundle} that throws a {@link CommandError} if the bundle cannot be
 * evaluated.
 *
 * @param path - The path to the bundle.
 * @throws If the bundle cannot be evaluated.
 */
export async function evaluate(path: string): Promise<void> {
  try {
    await evalBundle(path);
  } catch (error) {
    if (error instanceof SnapEvalError) {
      throw new CommandError(
        `Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.\nReceived the following error from the SES environment:\n\n${indent(
          red(error.output.stderr),
          2,
        )}`,
      );
    }

    // If the error is not a `SnapEvalError`, we don't know what it is, so
    // we just throw it.
    throw error;
  }
}
