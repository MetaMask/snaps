import { createModuleLogger } from '@metamask/utils';
import express from 'express';
import { createServer, Server } from 'http';
import { resolve as pathResolve, dirname } from 'path';

import { SnapsEnvironmentOptions } from '../options';
import { rootLogger } from './logger';

const SNAPS_EXECUTION_ENVIRONMENTS_PATH = pathResolve(
  dirname(
    require.resolve('@metamask/snaps-execution-environments/package.json'),
  ),
  'dist',
  'browserify',
  'iframe',
);

const SNAPS_SIMULATOR_PATH = pathResolve(
  dirname(require.resolve('@metamask/snaps-simulator/package.json')),
  'dist',
  'webpack',
  'test',
);

export type ServerOptions = Required<
  // We need a double `Required` for the type to be inferred correctly.
  Required<SnapsEnvironmentOptions>['server']
>;

/**
 * Start an HTTP server on `localhost` with a random port. This is used to serve
 * the static files for the environment.
 *
 * @param options - The options to use.
 * @param options.port - The port to use for the server.
 * @param options.root - The root directory to serve from the server.
 * @returns The HTTP server.
 */
export async function startServer(options: ServerOptions) {
  const log = createModuleLogger(rootLogger, 'server');

  const app = express();

  app.use('/environment', express.static(SNAPS_EXECUTION_ENVIRONMENTS_PATH));
  app.use('/simulator', express.static(SNAPS_SIMULATOR_PATH));
  app.use(express.static(pathResolve(process.cwd(), options.root)));

  const server = createServer(app);
  return await new Promise<Server>((resolve, reject) => {
    server.listen(options.port, () => {
      resolve(server);
    });

    server.on('error', (error) => {
      log(error);
      reject(error);
    });
  });
}
