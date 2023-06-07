import { createModuleLogger } from '@metamask/utils';
import express from 'express';
import { createServer, Server } from 'http';
import { join, resolve as pathResolve } from 'path';

import { SnapsEnvironmentOptions } from '../options';
import { rootLogger } from './logger';

const PUBLIC_PATH = join(__dirname, '..', '..', 'public');

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

  app.use(express.static(PUBLIC_PATH));
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
