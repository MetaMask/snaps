import { ProcessedConfig } from '../../config';
import { info } from '../../utils';
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
    await legacyServe(config);
    return;
  }

  const server = getServer();
  const port = await server.listen(config.server.port ?? 0);

  info(`The server is listening on http://localhost:${port}.`);
}
