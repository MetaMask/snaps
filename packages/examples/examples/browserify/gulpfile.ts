import { series, dest } from 'gulp';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import watchify from 'watchify';
import babelConfig from './babel.config.json';

const ENTRY_POINT = './src/snap.ts';

const bundler = browserify({
  entries: [ENTRY_POINT],
  standalone: '<snap>',
  cache: {},
  packageCache: {},
})
  .transform('babelify', { extensions: ['.ts'], ...babelConfig })
  .plugin('@metamask/snaps-browserify-plugin');

/**
 * Runs the Browserify bundler, writes the output to the `dist` folder, and runs
 * `yarn manifest` and `yarn eval` afterwards.
 *
 * @returns A `ReadWriteStream` of the bundle.
 */
export const build = () => {
  return bundler.bundle().pipe(source('snap.js')).pipe(dest('./dist'));
};

/**
 * Builds and watches the `src` folder for changes, and rebuilds the bundle when
 * necessary.
 *
 * @returns A `ReadWriteStream` of the bundle.
 */
export const watch = () => {
  const watcher = watchify(bundler);
  watcher.on('update', build);

  return build();
};

export default series(build);
