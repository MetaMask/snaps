import { checkManifest, isFile } from '@metamask/snaps-utils';
import { red, yellow } from 'chalk';
import type { Ora } from 'ora';
import { dirname, resolve } from 'path';

import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { error, executeSteps, indent, warn } from '../../utils';

type ManifestOptions = {
  fix?: boolean;
};

type ManifestContext = {
  config: ProcessedConfig;
  options: ManifestOptions;
  spinner: Ora;
};

const steps: Steps<ManifestContext> = [
  {
    name: 'Checking the input file.',
    task: async ({ config }) => {
      const input = getManifestPath(config);

      if (!(await isFile(input))) {
        throw new CommandError(
          `Manifest file not found: "${input}". Make sure that the \`snap.manifest.json\` file exists.`,
        );
      }
    },
  },
  {
    name: 'Validating the snap manifest.',
    task: async ({ config, options, spinner }) => {
      const writeManifest = getWriteManifest(config, options);
      const input = getManifestPath(config);

      const { warnings, errors } = await checkManifest(
        dirname(input),
        Boolean(writeManifest),
      );

      if (!writeManifest && errors.length > 0) {
        const formattedErrors = errors
          .map((manifestError) => indent(red(`• ${manifestError}`)))
          .join('\n');

        error(
          `The snap manifest file is invalid.\n\n${formattedErrors}\n\nRun the command with the \`--fix\` flag to attempt to fix the manifest.`,
          spinner,
        );

        spinner.stop();
        process.exitCode = 1;
        return;
      }

      if (warnings.length > 0) {
        const formattedWarnings = warnings.map((manifestWarning) =>
          indent(yellow(`• ${manifestWarning}`)),
        );

        warn(
          `The snap manifest file has warnings.\n\n${formattedWarnings.join(
            '\n',
          )}`,
          spinner,
        );
      }

      spinner.succeed('The snap manifest file is valid.');
    },
  },
];

/**
 * Get whether to write the manifest to disk.
 *
 * @param config - The config object.
 * @param options - The options object.
 * @returns Whether to write the manifest to disk.
 */
function getWriteManifest(config: ProcessedConfig, options: ManifestOptions) {
  if (typeof options.fix === 'boolean') {
    return options.fix;
  }

  if (config.bundler === 'browserify') {
    return config.cliOptions.writeManifest;
  }

  return false;
}

/**
 * Get the path to the manifest file.
 *
 * @param config - The config object.
 * @returns The path to the manifest file.
 */
function getManifestPath(config: ProcessedConfig) {
  if (config.bundler === 'browserify') {
    // The Browserify options don't have a `manifest` property, so we just use
    // the current working directory.
    return resolve(process.cwd(), 'snap.manifest.json');
  }

  return resolve(process.cwd(), config.manifest.path);
}

/**
 * Validates a snap.manifest.json file. Attempts to fix the manifest and write
 * the fixed version to disk if `writeManifest` is true. Throws if validation
 * fails.
 *
 * @param config - The config object.
 * @param options - The options object.
 */
export async function manifest(
  config: ProcessedConfig,
  options: ManifestOptions,
) {
  await executeSteps(steps, { config, options });
}
