import { Volume } from 'memfs';

// Note: `Volume` implements most of the `fs` API, but not all.
const volume = new Volume();
export = { ...jest.requireActual('fs'), promises: volume.promises };
