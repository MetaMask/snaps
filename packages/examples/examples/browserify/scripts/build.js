/* eslint-disable no-console, node/global-require, node/no-process-exit */
const browserify = require('browserify');
const { promises: fs } = require('fs');
const path = require('path');

const babelConfig = require('../babel.config.json');

const ENTRY_POINT = 'src/snap.ts';

const OUTPUT_PATH = './dist';
const OUTPUT_BUNDLE = 'snap.js';

/**
 * Build the snap using Browserify and the Snaps Browserify Plugin.
 */
async function main() {
  console.log('Bundling');

  const bundler = browserify(ENTRY_POINT, {
    standalone: '<snap>',
    extensions: ['.ts'],
  });

  bundler.transform(require('babelify'), {
    extensions: ['.js', '.ts'],
    ...babelConfig,
  });

  bundler.plugin('@metamask/snaps-browserify-plugin');

  const buffer = await new Promise((resolve, reject) => {
    bundler.bundle((error, bundle) => {
      if (error) {
        reject(error);
      } else {
        resolve(bundle);
      }
    });
  });

  const bundlePath = path.join(OUTPUT_PATH, OUTPUT_BUNDLE);
  await fs.mkdir(path.dirname(bundlePath), { recursive: true });
  await fs.writeFile(bundlePath, buffer);

  console.log('Finished');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
