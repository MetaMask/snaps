import { isFile } from '@metamask/snaps-utils/node';
import type { Ora } from 'ora';
import { resolve as pathResolve } from 'path';

import type { ManifestStats } from './implementation';
import { manifest } from './implementation';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { error, success, info, executeSteps } from '../../utils';
import { pluralize } from '../../webpack/utils';
import { evaluate } from '../eval';

type ManifestOptions = {
  fix?: boolean;
};

type ManifestContext = {
  input: string;
  config: ProcessedConfig;
  options: ManifestOptions;
  exports?: string[];
};

/**
 * Show the message to display for the manifest validation.
 *
 * @param stats - The stats object returned by the manifest function.
 * @param fix - Whether to attempt to fix the manifest.
 * @param spinner - The spinner to use for logging.
 * @returns The message to display.
 */
export function showManifestMessage(
  stats: ManifestStats,
  fix: boolean,
  spinner?: Ora,
) {
  const { valid, errors, warnings, fixed } = stats;

  if (valid) {
    const message = [];

    message.push(
      warnings > 0
        ? `The Snap manifest file is valid, but contains ${warnings} ${pluralize(
            warnings,
            'warning',
          )}.`
        : 'The Snap manifest file is valid.',
    );

    if (fixed > 0) {
      message.push(
        `${fixed} ${pluralize(fixed, 'issue')} ${pluralize(fixed, 'was', 'were')} automatically fixed.`,
      );
    }

    return success(message.join(' '), spinner);
  }

  const message = [
    'The Snap manifest contains',
    `${errors} ${pluralize(errors, 'error')}`,
    `and ${warnings} ${pluralize(warnings, 'warning')}.`,
  ];

  if (!fix) {
    message.push('Use the `--fix` option to attempt to fix the manifest.');
  }

  if (fixed > 0) {
    message.push(
      `${fixed} ${pluralize(fixed, 'issue')} ${pluralize(fixed, 'was', 'were')} automatically fixed.`,
    );
  }

  return error(message.join(' '), spinner);
}

const steps: Steps<ManifestContext> = [
  {
    name: 'Checking the input file.',
    task: async ({ input }) => {
      if (!(await isFile(input))) {
        throw new CommandError(
          `Manifest file not found: "${input}". Make sure that the \`snap.manifest.json\` file exists.`,
        );
      }
    },
  },
  {
    name: 'Evaluating the Snap bundle.',
    condition: ({ config }) => config.evaluate,
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
  {
    name: 'Validating the Snap manifest.',
    task: async ({ config, input, options, exports, spinner }) => {
      const write = getWriteManifest(options);
      const stats = await manifest(config, input, write, exports, spinner);

      showManifestMessage(stats, write, spinner);
      spinner.stop();

      if (!stats.valid) {
        process.exitCode = 1;
      }
    },
  },
];

/**
 * Get whether to write the manifest to disk.
 *
 * @param options - The options object.
 * @returns Whether to write the manifest to disk.
 */
function getWriteManifest(options: ManifestOptions) {
  if (typeof options.fix === 'boolean') {
    return options.fix;
  }

  return false;
}

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param config - The config object.
 * @param options - The options object.
 */
export async function manifestHandler(
  config: ProcessedConfig,
  options: ManifestOptions,
) {
  await executeSteps(steps, {
    input: config.manifest.path,
    config,
    options,
  });
}
