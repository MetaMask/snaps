// This file is intentionally written in JavaScript, so it can be run directly
// by Node.js without any transpilation.

const http = require('http');
const path = require('path');
const serveHandler = require('serve-handler');

const PORT = 6364;

const bundlePath = require.resolve(
  '@metamask/snaps-execution-environments/__test__/iframe-test/bundle.js',
);

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
  }).catch(console.error);
});

server.listen({ port: PORT }, () => {
  console.log(`Server listening on: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('Server error', error);
});

server.on('close', () => {
  console.log('Server closed');
});
