import { createFsFromVolume, Volume } from 'memfs';

// Note: `Volume` implements most of the `fs` API, but not all.
const volume = new Volume();

export = createFsFromVolume(volume);
