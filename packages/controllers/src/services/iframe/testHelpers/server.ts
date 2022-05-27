import http from 'http';
import { promisify } from 'util';
import path from 'path';
import serveHandler from 'serve-handler';

let server: http.Server;
export async function start(port = 6364) {
  return new Promise<void>((resolve, reject) => {
    if (!Number.isSafeInteger(port) || port < 0) {
      reject(new Error(`Invalid port: "${port}"`));
    }

    const bundlePath = require.resolve(
      '@metamask/execution-environments/dist/webpack/iframe/bundle.js',
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

export async function stop() {
  const close = promisify(server.close);
  await close();
}
