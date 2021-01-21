const http = require('http');
const { Worker } = require('worker_threads');
const chokidar = require('chokidar');
const serveHandler = require('serve-handler');

const { bundle } = require('./build');
const manifestHandler = require('./manifest');
const initHandler = require('./init');
const {
  logError, getEvalWorkerPath, getOutfilePath, validateDirPath,
  validateFilePath, validateOutfileName,
} = require('./utils');

module.exports = {
  build,
  snapEval,
  serve,
  watch,
  manifest,
  init,
};

// init

async function init(argv) {
  const newArgs = await initHandler(argv);

  console.log();

  await build({
    ...newArgs,
    manifest: false,
    eval: true,
  });

  console.log('\nPlugin project successfully initiated!');

  // serve({
  //   ...newArgs,
  //   root: '.',
  // })
}

// build

/**
 * Builds all files in the given source directory to the given destination
 * directory.
 *
 * Creates destination directory if it doesn't exist.
 *
 * @param {object} argv - argv from Yargs
 * @param {string} argv.src - The source file path
 * @param {string} argv.dist - The output directory path
 * @param {string} argv.outfileName - The output file name
 */
async function build(argv) {

  const { src, dist, outfileName } = argv;
  if (outfileName) {
    validateOutfileName(outfileName);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);

  const outfilePath = getOutfilePath(dist, outfileName);
  const result = await bundle(src, outfilePath, argv);
  if (result && argv.eval) {
    await snapEval({ ...argv, bundle: outfilePath });
  }

  if (argv.manifest) {
    manifest(argv);
  }
}

// watch

/**
 * Watch a directory and its subdirectories for changes, and build when files
 * are added or changed.
 *
 * Ignores 'node_modules' and dotfiles.
 * Creates destination directory if it doesn't exist.
 *
 * @param {object} argv - argv from Yargs
 * @param {string} argv.src - The source file path
 * @param {string} argv.dist - The output directory path
 * @param {string} argv.'outfileName' - The output file name
 */
async function watch(argv) {

  const { src, dist, outfileName } = argv;
  if (outfileName) {
    validateOutfileName(outfileName);
  }
  await validateFilePath(src);
  await validateDirPath(dist, true);
  const root = (
    src.indexOf('/') === -1 ? '.' : src.substring(0, src.lastIndexOf('/') + 1)
  );
  const outfilePath = getOutfilePath(dist, outfileName);

  const watcher = chokidar.watch(root, {
    ignoreInitial: true,
    ignored: [
      '**/node_modules/**',
      `**/${dist}/**`,
      `**/test/**`,
      `**/tests/**`,
      (str) => str !== '.' && str.startsWith('.'),
    ],
  });

  watcher
    .on('ready', () => {
      bundle(src, outfilePath, argv);
    })
    .on('add', (path) => {
      console.log(`File added: ${path}`);
      bundle(src, outfilePath, argv);
    })
    .on('change', (path) => {
      console.log(`File changed: ${path}`);
      bundle(src, outfilePath, argv);
    })
    .on('unlink', (path) => console.log(`File removed: ${path}`))
    .on('error', (err) => {
      logError(`Watcher error: ${err.message}`, err);
    });

  watcher.add(`${root}`);
  console.log(`Watching '${root}' for changes...`);
}

// serve

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

// manifest

function manifest(argv) {
  manifestHandler(argv)
    .catch((err) => {
      logError(err.message, err);
      process.exit(1);
    });
}

// eval

async function snapEval(argv) {
  const { bundle: bundlePath } = argv;
  await validateFilePath(bundlePath);
  try {
    // TODO: When supporting multiple environments, evaluate them here.
    await workerEval(bundlePath);
    console.log(`Eval Success: evaluated '${bundlePath}' in SES!`);
    return true;
  } catch (err) {
    logError(`Snap evaluation error: ${err.message}`, err);
    process.exit(1);
  }
}

function workerEval(bundlePath) {
  return new Promise((resolve, _reject) => {
    new Worker(getEvalWorkerPath())
      .on('exit', (exitCode) => {
        if (exitCode === 0) {
          resolve();
        } else {
          throw new Error(`Worker exited abnormally! Code: ${exitCode}`);
        }
      })
      .postMessage({
        pluginFilePath: bundlePath,
      });
  });
}
