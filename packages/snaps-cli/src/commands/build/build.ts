import { isFile } from '@metamask/snaps-utils/node';
import { assert } from '@metamask/utils';

import { build } from './implementation';
import { getBundleAnalyzerPort } from './utils';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { success, executeSteps } from '../../utils';

export type BuildContext = {
  build: boolean;
  config: ProcessedConfig;
  exports?: string[];
  options: BuildOptions;
  port?: number;
};

/**
 * The options for {@link buildHandler}.
 */
export type BuildOptions = {
  /**
   * Whether to analyze the bundle.
   */
  analyze?: boolean;

  /**
   * Whether to build the Snap as a preinstalled Snap.
   */
  preinstalled?: boolean;
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
      const { options, config, spinner } = context;

      const compiler = await build(config, {
        analyze: options.analyze,
        evaluate: config.evaluate,
        preinstalled: options.preinstalled,
        preinstalledOptions: config.preinstalled,
        spinner,
      });

      if (options.analyze) {
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
    condition: ({ options }) => options.analyze === true,
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
 * @param options - The build options.
 * @param options.analyze - Whether to analyze the bundle.
 * @param options.preinstalled - Whether to build the Snap as a preinstalled
 * Snap.
 * @returns Nothing.
 */
export async function buildHandler(
  config: ProcessedConfig,
  options: BuildOptions = {},
): Promise<void> {
  return await executeSteps(steps, {
    build: true,
    config,
    options,
  });
}
