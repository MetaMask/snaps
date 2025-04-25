import { handlerEndowments } from '@metamask/snaps-rpc-methods';
import { checkManifest, isFile } from '@metamask/snaps-utils/node';
import { writeManifest } from '@metamask/snaps-webpack-plugin';
import { assert } from '@metamask/utils';
import { red, reset, yellow } from 'chalk';
import { readFile } from 'fs/promises';
import { dirname, resolve as pathResolve } from 'path';

import { build } from './implementation';
import { getBundleAnalyzerPort } from './utils';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { error, success, executeSteps, info, warn } from '../../utils';
import { formatError } from '../../webpack/utils';
import { evaluate } from '../eval';

export type BuildContext = {
  analyze: boolean;
  build: boolean;
  config: ProcessedConfig;
  port?: number;
  exports?: string[];
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
    name: 'Evaluating the Snap bundle.',
    condition: ({ build: enableBuild, config }) =>
      enableBuild && config.evaluate,
    task: async (context) => {
      const { config, spinner } = context;
      const path = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename,
      );

      const { exports } = await evaluate(path);

      info(`Snap bundle evaluated successfully.`, spinner);

      return {
        ...context,
        exports,
      };
    },
  },

  // TODO: Share this between the `build` and `manifest` commands.
  {
    name: 'Validating the Snap manifest.',
    condition: ({ config }) => config.evaluate,
    task: async ({ config, exports, spinner }) => {
      const bundlePath = pathResolve(
        process.cwd(),
        config.output.path,
        config.output.filename,
      );

      const { reports } = await checkManifest(dirname(config.manifest.path), {
        updateAndWriteManifest: config.manifest.update,
        sourceCode: await readFile(bundlePath, 'utf-8'),
        exports,
        handlerEndowments,
        writeFileFn: async (path, data) => {
          return writeManifest(path, data);
        },
      });

      // TODO: Use `Object.groupBy` when available.
      const errors = reports
        .filter((report) => report.severity === 'error' && !report.wasFixed)
        .map((report) => report.message);
      const warnings = reports
        .filter((report) => report.severity === 'warning' && !report.wasFixed)
        .map((report) => report.message);
      const fixed = reports
        .filter((report) => report.wasFixed)
        .map((report) => report.message);

      if (errors.length > 0) {
        error(
          `The following errors were found in the manifest:\n\n${errors
            .map((value) => formatError(value, '', red))
            .join('\n\n')}\n`,
          spinner,
        );
      }

      if (warnings.length > 0) {
        warn(
          `The following warnings were found in the manifest:\n\n${warnings
            .map((value) => formatError(value, '', yellow))
            .join('\n\n')}\n`,
          spinner,
        );
      }

      if (fixed.length > 0) {
        info(
          `The following issues were fixed in the manifest:\n\n${reset(
            fixed.map((value) => formatError(value, '', reset)).join('\n\n'),
          )}\n`,
          spinner,
        );
      }
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
