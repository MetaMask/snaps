import type { Ora } from 'ora';
import { join } from 'path';

import type { ProcessedConfig, ProcessedWebpackConfig } from '../../config';
import type { Steps } from '../../utils';
import { executeSteps, info } from '../../utils';
import { getCompiler, getServer } from '../../webpack';
import { legacyWatch } from './legacy';

type WatchContext = {
  config: ProcessedWebpackConfig;
  spinner: Ora;
};

const steps: Steps<WatchContext> = [
  {
    name: 'Starting the development server.',
    task: async ({ config, spinner }) => {
      const server = getServer();
      const port = await server.listen(config.server.port ?? 0);

      info(`The server is listening on http://localhost:${port}.`, spinner);
    },
  },
  {
    name: 'Building the snap bundle.',
    task: async ({ config, spinner }) => {
      const compiler = getCompiler(config, {
        evaluate: true,
        watch: true,
        spinner,
      });

      return new Promise((resolve, reject) => {
        compiler.watch(
          {
            ignored: [
              '**/node_modules/**/*',
              join(process.cwd(), config.output.path, '**/*'),
            ],
          },
          (error, stats) => {
            if (error) {
              reject(error);
              return;
            }

            if (stats?.hasErrors()) {
              reject(stats.toString());
              return;
            }

            resolve();
          },
        );
      });
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
export async function watch(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    await legacyWatch(config);
    return;
  }

  await executeSteps(steps, { config });
}
