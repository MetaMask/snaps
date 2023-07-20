import { createFsFromVolume, Volume } from 'memfs';

// Note: `Volume` implements most of the `fs` API, but not all.
const volume = new Volume();

const { join, dirname } = jest.requireActual('path');

// Browserify is trying to read some files when it's being imported, so we need
// to provide the files it's looking for.
const BROWSERIFY_FILES = [
  /* eslint-disable n/no-extraneous-require */
  join(dirname(require.resolve('is-core-module/package.json')), 'core.json'),
  join(dirname(require.resolve('browser-pack/package.json')), '_prelude.js'),
  /* eslint-enable n/no-extraneous-require */
];

for (const file of BROWSERIFY_FILES) {
  /* eslint-disable n/no-sync */
  volume.mkdirSync(dirname(file), { recursive: true });
  volume.writeFileSync(file, jest.requireActual('fs').readFileSync(file));
  /* eslint-enable n/no-sync */
}

export = createFsFromVolume(volume);
