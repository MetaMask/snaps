import {
  checkManifest,
  evalBundle,
  SnapEvalError,
} from '@metamask/snaps-utils';
import { red, yellow } from 'chalk';
import type { Ora } from 'ora';
import { dirname } from 'path';

import type { ProcessedWebpackConfig } from '../config';
import { CommandError } from '../errors';
import { error, indent, warn } from '../utils';
import type { WebpackOptions } from '../webpack';
import { getCompiler } from '../webpack';

/**
 * Build the snap bundle. This uses Webpack to build the bundle.
 *
 * @param config - The config object.
 * @param options - The Webpack options.
 * @returns A promise that resolves when the bundle is built.
 */
export async function build(
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
  } catch (evalError) {
    if (evalError instanceof SnapEvalError) {
      throw new CommandError(
        `Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.\nReceived the following error from the SES environment:\n\n${indent(
          red(evalError.output.stderr),
          2,
        )}`,
      );
    }

    // If the error is not a `SnapEvalError`, we don't know what it is, so
    // we just throw it.
    throw evalError;
  }
}

/**
 * Check the snap manifest file at the given path. If `write` is `true`, the
 * manifest will be written to disk if it is invalid. If `write` is `false`,
 * the manifest will not be written to disk, and the function will log any
 * errors and warnings to the console.
 *
 * @param path - The path to the manifest file.
 * @param write - Whether to write the manifest to disk if it is invalid.
 * @param spinner - An optional spinner to use for logging.
 */
export async function manifest(
  path: string,
  write: boolean,
  spinner?: Ora,
): Promise<void> {
  const { warnings, errors } = await checkManifest(dirname(path), write);

  if (!write && errors.length > 0) {
    const formattedErrors = errors
      .map((manifestError) => indent(red(`• ${manifestError}`)))
      .join('\n');

    error(
      `The snap manifest file is invalid.\n\n${formattedErrors}\n\nRun the command with the \`--fix\` flag to attempt to fix the manifest.`,
      spinner,
    );

    spinner?.stop();
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    const formattedWarnings = warnings.map((manifestWarning) =>
      indent(yellow(`• ${manifestWarning}`)),
    );

    warn(
      `The snap manifest file has warnings.\n\n${formattedWarnings.join('\n')}`,
      spinner,
    );
  }
}
