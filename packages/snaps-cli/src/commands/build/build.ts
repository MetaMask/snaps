import { isFile } from '@metamask/snaps-utils/node';
import { assert } from '@metamask/utils';

import { build } from './implementation';
import { getBundleAnalyzerPort } from './utils';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { success, executeSteps } from '../../utils';

export type BuildContext = {
  analyze: boolean;
  build: boolean;
  config: ProcessedConfig;
  exports?: string[];
  port?: number;
};

export const steps: Steps<BuildContext> = [
  {
    name: 'Checking the input file.',
    condition: ({ build: enableBuild }) => enableBuild,
    task: async ({ config }) => {
      const { input } = config;

      if (!(await isFile(input))) {
        throw new CommandError(
          `Input file not found: "${input}". Make sure that the "input" field in your Snap config is correct.`,
        );
      }
    },
  },
  {
    name: 'Building the Snap bundle.',
    condition: ({ build: enableBuild }) => enableBuild,
    task: async (context) => {
      const { analyze, config, spinner } = context;

      const compiler = await build(config, {
        analyze,
        evaluate: config.evaluate,
        spinner,
      });

      if (analyze) {
        return {
          ...context,
          port: await getBundleAnalyzerPort(compiler),
        };
      }

      return undefined;
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
