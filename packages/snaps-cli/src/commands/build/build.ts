import { evalBundle, isFile } from '@metamask/snaps-utils';
import { Ora } from 'ora';
import { resolve as pathResolve } from 'path';

import { ProcessedConfig, ProcessedWebpackConfig } from '../../config';
import { CommandError } from '../../logging';
import { executeSteps, Steps } from '../../utils';
import { getCompiler } from '../../webpack';
import { legacyBuild } from './legacy';

type BuildContext = {
  config: ProcessedWebpackConfig;
};

const steps: Steps<BuildContext & { spinner: Ora }> = [
  {
    name: 'Checking input file.',
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
    name: 'Building snap bundle.',
    task: async ({ config, spinner }) => {
      const compiler = getCompiler(config, { evaluate: false, spinner });
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
    },
  },
  {
    name: 'Evaluating snap bundle.',
    task: async ({ config }) => {
      const path = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename,
      );

      try {
        await evalBundle(path);
      } catch {
        throw new CommandError(
          `Failed to evaluate snap bundle in SES. This is likely due to an incompatibility with the SES environment in your snap.`,
        );
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
