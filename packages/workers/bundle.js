const { createWriteStream, promises: fs } = require('fs');
const pathUtils = require('path');
const { promisify } = require('util');
const browserify = require('browserify');
const rimraf = promisify(require('rimraf'));
const endOfStream = promisify(require('end-of-stream'));

/**
 * This is to be run after `tsc`.
 */

main();

async function main() {
  // Add SES contents to tsc output
  await preprocess();
  // Run browserify
  await bundle();
  // Delete temporary file
  await rimraf(pathUtils.resolve(__dirname, 'dist/_SnapWorker.js'));
}

async function preprocess() {
  // Get the SES lockdown contents
  const sesContent = await fs.readFile(
    pathUtils.resolve(
      __dirname,
      '../../node_modules/ses/dist/lockdown.umd.min.js',
    ),
  );

  // Get the tsc output file
  const tscOutput = await fs.readFile(
    pathUtils.resolve(__dirname, 'dist/SnapWorker.js'),
    'utf8',
  );

  // Remove original SnapWorker files
  await rimraf(pathUtils.resolve(__dirname, 'dist/SnapWorker*'));

  // Prepend the SES lockdown contents to the tsc output and write to a
  // temporary file
  await fs.writeFile(
    pathUtils.resolve(__dirname, 'dist/_SnapWorker.js'),
    `${sesContent}${tscOutput}`,
  );
}

async function bundle() {
  const browserifyOpts = {
    debug: false,
    entries: ['dist/_SnapWorker.js'],
    plugin: 'tinyify',
  };

  await endOfStream(
    browserify(browserifyOpts)
      .bundle()
      .on('error', console.error)
      .pipe(createWriteStream('dist/SnapWorker.js')),
  );
}
