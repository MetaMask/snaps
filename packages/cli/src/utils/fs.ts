import { promises as fs } from 'fs';
import type { Json } from '@metamask/utils';
import { logError } from './misc';

/**
 * Checks whether the given path string resolves to an existing directory, and
 * optionally creates the directory if it doesn't exist.
 *
 * @param pathString - The path string to check.
 * @param createDir - Whether to create the directory if it doesn't exist.
 * @returns Whether the given path is an existing directory.
 */
export async function isDirectory(
  pathString: string,
  createDir: boolean,
): Promise<boolean> {
  try {
    const stats = await fs.stat(pathString);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (!createDir) {
        return false;
      }

      try {
        await fs.mkdir(pathString);
        return true;
      } catch (mkdirError) {
        logError(`Directory '${pathString}' could not be created.`, mkdirError);
        throw mkdirError;
      }
    }
    return false;
  }
}

/**
 * Checks whether the given path string resolves to an existing file.
 *
 * @param pathString - The path string to check.
 * @returns Whether the given path is an existing file.
 */
export async function isFile(pathString: string): Promise<boolean> {
  try {
    const stats = await fs.stat(pathString);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/**
 * Reads a `.json` file, parses its contents, and returns them.
 *
 * @param pathString - The path to the JSON file.
 * @returns The parsed contents of the JSON file.
 */
export async function readJsonFile(pathString: string): Promise<Json> {
  if (!pathString.endsWith('.json')) {
    throw new Error('The specified file must be a ".json" file.');
  }

  return JSON.parse(await fs.readFile(pathString, 'utf8'));
}
