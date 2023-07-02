import { resolve } from 'path';

import { ProcessedConfig } from '../../config';
import { info } from '../../utils';
import { getServer } from '../../webpack';

/**
 * Get the root directory for the given config.
 *
 * If the bundler is Webpack, this will be `server.root`. If the bundler is
 * Browserify, this will be `cliOptions.root`.
 *
 * @param config - The config object.
 * @returns The root directory.
 */
export function getRootDirectory(config: ProcessedConfig): string {
  if (config.bundler === 'browserify') {
    return config.cliOptions.root;
  }

  return config.server.root;
}

/**
 * Get the port for the given config.
 *
 * If the bundler is Webpack, this will be `server.port`. If the bundler is
 * Browserify, this will be `cliOptions.port`.
 *
 * @param config - The config object.
 * @returns The port.
 */
export function getPort(config: ProcessedConfig): number {
  if (config.bundler === 'browserify') {
    return config.cliOptions.port;
  }

  return config.server.port;
}

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param config - The config object.
 */
export async function serveHandler(config: ProcessedConfig): Promise<void> {
  const path = resolve(process.cwd(), getRootDirectory(config));
  const configPort = getPort(config);

  const server = getServer(path);

  // If the `configPort` is `0`, the OS will choose a random port for us, so we
  // need to get the port from the server after it starts.
  const { port } = await server.listen(configPort);

  info(`The server is listening on http://localhost:${port}.`);
}
