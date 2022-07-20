import { promises as fs } from 'fs';
import pathUtils from 'path';
import { Json } from '@metamask/utils';
import { NpmSnapFileNames } from './types';

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

      await fs.mkdir(pathString);
      return true;
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
export async function readJsonFile<Type = Json>(
  pathString: string,
): Promise<Type> {
  if (!pathString.endsWith('.json')) {
    throw new Error('The specified file must be a ".json" file.');
  }

  return JSON.parse(await fs.readFile(pathString, 'utf8'));
}

/**
 * Utility function for reading `package.json` or the Snap manifest file.
 * These are assumed to be in the current working directory.
 *
 * @param pathString - The base path of the file to read.
 * @param snapJsonFileName - The name of the file to read.
 * @returns The parsed JSON file.
 */
export async function readSnapJsonFile(
  pathString: string,
  snapJsonFileName: NpmSnapFileNames,
): Promise<Json> {
  const path = pathUtils.join(pathString, snapJsonFileName);

  try {
    return await readJsonFile(path);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `Could not find '${path}'. Please ensure that the file exists.`,
      );
    }

    throw error;
  }
}
