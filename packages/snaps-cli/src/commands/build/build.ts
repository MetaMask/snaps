import { isFile } from '@metamask/snaps-utils/node';
import { assert } from '@metamask/utils';
import { resolve as pathResolve } from 'path';

import { build } from './implementation';
import { getBundleAnalyzerPort } from './utils';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { success, executeSteps, info } from '../../utils';
import { evaluate } from '../eval';

export type BuildContext = {
  analyze: boolean;
  build: boolean;
  config: ProcessedConfig;
  port?: number;
};

export const steps: Steps<BuildContext> = [
  {
    name: 'Checking the input file.',
    condition: ({ build }) => build,
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
    condition: ({ build }) => build,
    task: async ({ analyze, build: enableBuild, config, spinner }) => {
      // We don't evaluate the bundle here, because it's done in a separate
      // step.
      const compiler = await build(config, {
        analyze,
        evaluate: false,
        spinner,
      });

      if (analyze) {
        return {
          analyze,
          build: enableBuild,
          config,
          spinner,
          port: await getBundleAnalyzerPort(compiler),
        };
      }

      return undefined;
    },
  },
  {
    name: 'Evaluating the snap bundle.',
    condition: ({ build, config }) => build && config.evaluate,
    task: async ({ config, spinner }) => {
      const path = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename,
      );

      await evaluate(path);

      info(`Snap bundle evaluated successfully.`, spinner);
    },
  },
  {
    name: 'Running analyser.',
    condition: ({ analyze }) => analyze,
    task: async ({ spinner, port }) => {
      assert(port, 'Port is not defined.');
      success(`Bundle analyzer running at http://localhost:${port}.`, spinner);

      spinner.stop();
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
 * @param analyze - Whether to analyze the bundle.
 * @returns Nothing.
 */
export async function buildHandler(
  config: ProcessedConfig,
  analyze = false,
): Promise<void> {
  return await executeSteps(steps, {
    build: true,
    config,
    analyze,
  });
}
