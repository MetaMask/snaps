import { Volume } from 'memfs';

// Note: `Volume` implements most of the `fs` API, but not all.
const volume = new Volume();

// Part of the real `fs` API is used here, since Browserify uses it to load
// certain modules from the file system. The async methods are not used, so
// they are mocked.
export = { ...jest.requireActual('fs'), promises: volume.promises };
