/* eslint-disable no-console */
const http = require('http');
const path = require('path');
const serveHandler = require('serve-handler');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC = path.join(ROOT, '/dist/browserify/iframe');

start();

/**
 * Script to serve a local instance of the Iframe Execution Environment.
 * Expects that the first positional argument to the Node process is a valid
 * integer port.
 */
async function start() {
  const port = parseInt(process.argv[2] ?? 6363, 10);
  if (!Number.isSafeInteger(port) || port < 0) {
    throw new Error(`Invalid port: "${port}"`);
  }

  const server = http.createServer(async (req, res) => {
    await serveHandler(req, res, {
      public: PUBLIC,
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

  server.listen({ port }, () =>
    console.log(`Server listening on: http://localhost:${port}`),
  );

  server.on('error', (error) => {
    console.error('Server error', error);
    process.exitCode = 1;
    server.close();
  });

  server.on('close', () => {
    console.log('Server closed');
    process.exitCode = 1;
  });
}
