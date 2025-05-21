import { isFile } from '@metamask/snaps-utils/node';
import { resolve } from 'path';

import { manifest } from './implementation';
import type { ProcessedConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { info, executeSteps } from '../../utils';
import { evaluate } from '../eval';

type ManifestOptions = {
  fix?: boolean;
  eval: boolean;
};

type ManifestContext = {
  input: string;
  config: ProcessedConfig;
  options: ManifestOptions;
  exports?: string[];
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
    name: 'Evaluating the Snap bundle.',
    condition: ({ options }) => options.eval,
    task: async (context) => {
      const { config, spinner } = context;
      const path = resolve(
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
    task: async ({ input, options, exports, spinner }) => {
      const write = getWriteManifest(options);
      const valid = await manifest(input, write, exports, spinner);

      if (valid) {
        spinner.succeed('The Snap manifest file is valid.');
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
