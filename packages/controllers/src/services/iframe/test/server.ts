import http from 'http';
import path from 'path';
import serveHandler from 'serve-handler';

export const PORT = 6364;

let server: http.Server;
/**
 * Starts a local server that serves the iframe execution environment.
 *
 * @param port - The port to start the server on.
 */
export async function start(port = PORT) {
  return new Promise<void>((resolve, reject) => {
    if (!Number.isSafeInteger(port) || port < 0) {
      reject(new Error(`Invalid port: "${port}"`));
    }

    const bundlePath = require.resolve(
      '@metamask/execution-environments/__test__/iframe-test/bundle.js',
    );
    const publicPath = path.resolve(bundlePath, '../');

    server = http.createServer(async (req, res) => {
      await serveHandler(req, res, {
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
      });
    });

    server.listen({ port }, () => {
      console.log(`Server listening on: http://localhost:${port}`);
      resolve();
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
 */
export async function stop() {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}
