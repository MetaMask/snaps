import http from 'http';
import path from 'path';
import serveHandler from 'serve-handler';

/**
 * Starts a local server that serves the iframe execution environment.
 *
 * @param port - The port to start the server on.
 * @param bundlePath - The path to the bundle to serve. Defaults to the iframe
 * test bundle.
 * @returns The server instance.
 */
export async function startServer(
  port: number,
  bundlePath: string = require.resolve(
    '@metamask/snaps-execution-environments/__test__/iframe-test/bundle.js',
  ),
) {
  return new Promise<http.Server>((resolve, reject) => {
    if (!Number.isSafeInteger(port) || port < 0) {
      reject(new Error(`Invalid port: "${port}"`));
    }

    const publicPath = path.resolve(bundlePath, '../');

    const server = http.createServer((req, res) => {
      serveHandler(req, res, {
        public: publicPath,
        headers: [
          {
            source: '**/*',
            headers: [
              {
                key: 'Cache-Control',
                value: 'no-cache',
              },
            ],
          },
        ],
      }).catch(reject);
    });

    server.listen({ port }, () => {
      console.log(`Server listening on: http://localhost:${port}`);
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('Server error', error);
      reject(error);
    });

    server.on('close', () => {
      console.log('Server closed');
      reject(new Error('Server closed'));
    });
  });
}

/**
 * Stops the local server.
 *
 * @param server - The server to stop.
 */
export async function stopServer(server: http.Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
