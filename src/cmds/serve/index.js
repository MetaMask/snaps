const http = require('http');
const serveHandler = require('serve-handler');

const builders = require('../../builders');
const { logError, validateDirPath } = require('../../utils');

module.exports.command = ['serve', 's'];
module.exports.desc = 'Locally serve Snap file(s) for testing';
module.exports.builder = (yarg) => {
  yarg
    .option('root', builders.root)
    .option('port', builders.port);
};
module.exports.handler = (argv) => serve(argv);

/**
 * Starts a local, static HTTP server on the given port with the given root
 * directory.
 *
 * @param {object} argv - argv from Yargs
 * @param {string} argv.root - The root directory path string
 * @param {number} argv.port - The server port
 */
async function serve(argv) {

  const { port, root } = argv;

  await validateDirPath(root);

  console.log(`\nStarting server...`);

  const server = http.createServer(async (req, res) => {
    await serveHandler(req, res, {
      public: root,
    });
  });

  server.listen({ port }, () => {
    console.log(`Server listening on: http://localhost:${port}`);
  });

  server.on('request', (request) => {
    console.log(`Handling incoming request for: ${request.url}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logError(`Server error: Port ${port} already in use.`);
    } else {
      logError(`Server error: ${err.message}`, err);
    }
    process.exit(1);
  });

  server.on('close', () => {
    console.log('Server closed');
    process.exit(1);
  });
}
