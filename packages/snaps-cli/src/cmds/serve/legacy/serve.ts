import { logInfo, validateDirPath } from '@metamask/snaps-utils';
import http from 'http';
import serveHandler from 'serve-handler';

import type { ProcessedBrowserifyConfig } from '../../../config';
import { logRequest, logServerError, logServerListening } from './utils';

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param config - The config object.
 * @param config.cliOptions - The CLI options.
 */
export async function legacyServe({ cliOptions }: ProcessedBrowserifyConfig) {
  const { port, root: rootDir } = cliOptions;

  await validateDirPath(rootDir, true);

  logInfo(`\nStarting server...`);

  const server = http.createServer((req, res) => {
    serveHandler(req, res, {
      public: rootDir,
      headers: [
        {
          source: '**/*',
          headers: [
            {
              key: 'Cache-Control',
              value: 'no-cache',
            },
            {
              key: 'Access-Control-Allow-Origin',
              value: '*',
            },
          ],
        },
      ],
    })?.catch((error) => {
      logServerError(error, port);
      res.statusCode = 500;
      res.end();
    });
  });

  server.listen({ port }, () => logServerListening(port));

  server.on('request', (request) => logRequest(request));

  server.on('error', (error) => {
    logServerError(error, port);
    process.exitCode = 1;
  });

  server.on('close', () => {
    logInfo('Server closed');
    process.exitCode = 1;
  });
}
