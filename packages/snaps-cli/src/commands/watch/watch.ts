import type { ProcessedConfig } from '../../config';
import { getServer } from '../../webpack';
import { legacyWatch } from './legacy';

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
    return await legacyWatch(config);
  }

  const server = getServer(config, {
    evaluate: false,
    watch: true,
  });

  return await server.start();
}
