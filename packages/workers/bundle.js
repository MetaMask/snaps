const { createWriteStream, promises: fs } = require('fs');
const pathUtils = require('path');
const { promisify } = require('util');
const browserify = require('browserify');
const rimraf = promisify(require('rimraf'));
const endOfStream = promisify(require('end-of-stream'));

const MAIN_FILE_PATH = pathUtils.resolve(__dirname, 'dist/SnapWorker.js');
const TEMP_FILE_PATH = pathUtils.resolve(__dirname, 'dist/_SnapWorker.js');

/**
 * This is to be run after `tsc`.
 */
main();

async function main() {
  // Run browserify on the tsc output
  await bundle();

  // Remove original SnapWorker files
  await rimraf(pathUtils.resolve(__dirname, 'dist/SnapWorker*'));

  // Get the SES lockdown contents
  const sesContent = await fs.readFile(
    pathUtils.resolve(
      __dirname,
      '../../node_modules/ses/dist/lockdown.umd.min.js',
    ),
  );

  // Get the browserify output
  const bundleContent = await fs.readFile(TEMP_FILE_PATH, 'utf8');

  // Prepend the SES lockdown contents to the bundle contents and write to
  // primary export file
  await fs.writeFile(MAIN_FILE_PATH, `${sesContent}${bundleContent}`);

  // Delete temporary file
  await rimraf(TEMP_FILE_PATH);
}

async function bundle() {
  const browserifyOpts = {
    debug: false,
    entries: [MAIN_FILE_PATH],
    plugin: 'tinyify',
  };

  await endOfStream(
    browserify(browserifyOpts)
      .bundle()
      .on('error', console.error)
      .pipe(createWriteStream(TEMP_FILE_PATH)),
  );
}
