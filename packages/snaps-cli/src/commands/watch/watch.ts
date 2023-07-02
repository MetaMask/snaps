import { isFile } from '@metamask/snaps-utils';

import type { ProcessedConfig, ProcessedWebpackConfig } from '../../config';
import { CommandError } from '../../errors';
import type { Steps } from '../../utils';
import { executeSteps, info } from '../../utils';
import { getServer } from '../../webpack';
import { watch } from './implementation';
import { legacyWatch } from './legacy';

type WatchContext = {
  config: ProcessedWebpackConfig;
};

const steps: Steps<WatchContext> = [
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
    name: 'Starting the development server.',
    task: async ({ config, spinner }) => {
      const server = getServer();
      const { port } = await server.listen(config.server.port);

      info(`The server is listening on http://localhost:${port}.`, spinner);
    },
  },
  {
    name: 'Building the snap bundle.',
    task: async ({ config, spinner }) => {
      await watch(config, { spinner });
    },
  },
];

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param config - The config object.
 */
export async function watchHandler(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    await legacyWatch(config);
    return;
  }

  await executeSteps(steps, { config });
}
