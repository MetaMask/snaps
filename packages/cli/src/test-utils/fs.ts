import { promises as fs } from 'fs';

jest.mock('fs');

export const BASE_PATH = '/cli';

/**
 * Clears out all the files in the in-memory file system, and writes the default
 * files to the `BASE_PATH` folder, including sub-folders.
 */
export async function resetFileSystem() {
  await fs.rm(BASE_PATH, { recursive: true, force: true });
}
