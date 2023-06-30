import { evalBundle, isFile, SnapEvalError } from '@metamask/snaps-utils';
import { red } from 'chalk';
import { Ora } from 'ora';
import { resolve } from 'path';

import { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import { executeSteps, getRelativePath, indent, Steps } from '../../utils';

export type EvalOptions = {
  input?: string;
};

export type EvalContext = {
  input: string;
  spinner: Ora;
};

const steps: Steps<EvalContext> = [
  {
    name: 'Checking the input file.',
    task: async ({ input }) => {
      if (!(await isFile(input))) {
        const relativePath = getRelativePath(input);
        throw new CommandError(
          `Input file not found: "${relativePath}". Make sure that the "input" field in your snap config or the specified input file is correct.`,
        );
      }
    },
  },
  {
    name: 'Evaluating the snap bundle.',
    task: async ({ input, spinner }) => {
      try {
        await evalBundle(input);
        spinner.succeed('Successfully evaluated snap bundle.');
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
    },
  },
];

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
  const input = getBundlePath(config, options);
  await executeSteps(steps, { input });
}
