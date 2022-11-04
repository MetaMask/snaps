import { promises as fs } from 'fs';

jest.mock('fs');

/**
 * Clears out all the files in the in-memory file system, and writes the default
 * files to the `BASE_PATH` folder, including sub-folders.
 */
export async function resetFileSystem() {
  await fs.rm(process.cwd(), { recursive: true, force: true });

  // Using relative path with memfs won't work since process.cwd() specifies the cwd of the on-disk file system
  // This recursively creates the current working directory in the memfs volume.
  // Ref. https://github.com/streamich/memfs/blob/master/docs/relative-paths.md
  await fs.mkdir(process.cwd(), { recursive: true });
}
