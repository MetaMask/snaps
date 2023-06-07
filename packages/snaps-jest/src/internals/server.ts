import { createModuleLogger } from '@metamask/utils';
import { createServer, Server } from 'http';
import { join } from 'path';
import serveHandler from 'serve-handler';

import { rootLogger } from './logger';

const PUBLIC_PATH = join(__dirname, '..', 'public');

/**
 * Start an HTTP server on `localhost` with a random port. This is used to serve
 * the static files for the environment.
 *
 * @returns The HTTP server.
 */
export async function startServer() {
  const log = createModuleLogger(rootLogger, 'server');
  const server = createServer((request, response) => {
    serveHandler(request, response, {
      public: PUBLIC_PATH,
    }).catch((error) => {
      log(error);
      response.statusCode = 500;
      response.end();
    });
  });

  return await new Promise<Server>((resolve) => {
    server.listen(0, () => {
      resolve(server);
    });
  });
}
