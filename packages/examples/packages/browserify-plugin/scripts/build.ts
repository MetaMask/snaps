import browserify from 'browserify';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import babelConfig from '../babel.config.json';

// The entry point for the snap, i.e., the file that exports the snap
// implementation.
const ENTRY_POINT = 'src/index.ts';

// The path and name of the output bundle.
const OUTPUT_PATH = './dist';
const OUTPUT_BUNDLE = 'bundle.js';

/**
 * Build the snap bundle. This script uses Browserify to bundle the snap, and
 * uses Babel to transpile the TypeScript code to JavaScript. The bundle is
 * written to the {@link OUTPUT_PATH} directory.
 *
 * This uses the `@metamask/snaps-browserify-plugin` plugin to process the
 * bundle, update the snap manifest, and check for any compatibility issues.
 */
async function main() {
  const bundler = browserify(ENTRY_POINT, {
    // This is required to avoid Browserify removing the exports from the
    // bundle.
    standalone: '<snap>',
    extensions: ['.js', '.ts'],
  });

  // For this example we use Babel to transpile the TypeScript code to
  // JavaScript.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  bundler.transform(require('babelify'), {
    ...babelConfig,
    extensions: ['.js', '.ts'],
  });

  // Add the Snaps Browserify Plugin to the bundler.
  bundler.plugin('@metamask/snaps-browserify-plugin');

  // Bundle the snap.
  const buffer = await promisify(bundler.bundle.bind(bundler))();

  // Write the bundle to the output path.
  const bundlePath = path.join(OUTPUT_PATH, OUTPUT_BUNDLE);
  await fs.mkdir(path.dirname(bundlePath), { recursive: true });
  await fs.writeFile(bundlePath, buffer);
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exitCode = 1;
});
