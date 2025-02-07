import { isFile } from '@metamask/snaps-utils/node';
import { assert } from '@metamask/utils';
import { resolve as pathResolve } from 'path';

import type { ProcessedConfig, ProcessedWebpackConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { success, executeSteps, info } from '../../utils';
import { evaluate } from '../eval';
import { build } from './implementation';
import { getBundleAnalyzerPort } from './utils';

type BuildContext = {
  analyze: boolean;
  config: ProcessedWebpackConfig;
  port?: number;
};

const steps: Steps<BuildContext> = [
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
    task: async ({ analyze, config, spinner }) => {
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
    condition: ({ config }) => config.evaluate,
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
    config,
    analyze,
  });
}
