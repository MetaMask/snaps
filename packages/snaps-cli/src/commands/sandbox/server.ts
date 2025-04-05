import { static as expressStatic } from 'express';
import { dirname } from 'path';

import type { ProcessedConfig } from '../../config';
import { getServer } from '../../webpack';

/**
 * Start the sandbox.
 *
 * @param config - The config object.
 * @returns The server instance.
 */
export async function startSandbox(config: ProcessedConfig) {
  const server = getServer(config, [
    (app) => {
      app.use(
        '/__sandbox__',
        expressStatic(
          dirname(require.resolve('@metamask/snaps-sandbox/dist/index.html')),
        ),
      );

      app.get('/', (_request, response) => {
        response.sendFile(
          require.resolve('@metamask/snaps-sandbox/dist/index.html'),
        );
      });
    },
  ]);

  // If the `configPort` is `0`, the OS will choose a random port for us, so we
  // need to get the port from the server after it starts.
  return await server.listen(config.server.port);
}
