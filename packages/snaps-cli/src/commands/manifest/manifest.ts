import { isFile } from '@metamask/snaps-utils';
import { resolve } from 'path';

import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { executeSteps } from '../../utils';
import { manifest } from './implementation';

type ManifestOptions = {
  fix?: boolean;
};

type ManifestContext = {
  input: string;
  config: ProcessedConfig;
  options: ManifestOptions;
};

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
    name: 'Validating the snap manifest.',
    task: async ({ input, config, options, spinner }) => {
      const write = getWriteManifest(config, options);
      await manifest(input, write, spinner);

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

  return config.manifest.path;
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
    input: getManifestPath(config),
    config,
    options,
  });
}
