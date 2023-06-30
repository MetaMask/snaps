import { evalBundle, isFile, SnapEvalError } from '@metamask/snaps-utils';
import { red } from 'chalk';
import { Ora } from 'ora';
import { resolve as pathResolve } from 'path';

import { ProcessedConfig, ProcessedWebpackConfig } from '../../config';
import { CommandError } from '../../errors';
import { executeSteps, indent, Steps } from '../../utils';
import { getCompiler } from '../../webpack';
import { legacyBuild } from './legacy';

type BuildContext = {
  config: ProcessedWebpackConfig;
};

const steps: Steps<BuildContext & { spinner: Ora }> = [
  {
    name: 'Checking the input file.',
    task: async ({ config }) => {
      const { input } = config;

      if (!(await isFile(input))) {
        throw new CommandError(
          `Input file not found: "${input}". Make sure that the "input" field in your snap config is correct.`,
        );
      }
    },
  },
  {
    name: 'Building the snap bundle.',
    task: async ({ config, spinner }) => {
      const compiler = getCompiler(config, { evaluate: false, spinner });
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
    },
  },
  {
    name: 'Evaluating the snap bundle.',
    task: async ({ config }) => {
      const path = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename,
      );

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
    },
  },
] as const;

/**
 * Build all files in the given source directory to the given destination
 * directory.
 *
 * This creates the destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export async function build(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    return await legacyBuild(config);
  }

  return await executeSteps(steps, {
    config,
  });
}
