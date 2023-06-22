import { ProcessedConfig } from '../../config';
import { getServer } from '../../webpack';
import { legacyServe } from './legacy';

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param config - The config object.
 */
export async function serve(config: ProcessedConfig): Promise<void> {
  if (config.bundler === 'browserify') {
    return await legacyServe(config);
  }

  const server = getServer(config, {
    evaluate: false,
    watch: false,
  });

  return server.start();
}
