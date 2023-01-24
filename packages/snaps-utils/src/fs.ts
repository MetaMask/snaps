import { Json } from '@metamask/utils';
import { promises as fs } from 'fs';
import pathUtils from 'path';

import { readVirtualFile, VirtualFile } from './virtual-file';

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

      await fs.mkdir(pathString, { recursive: true });
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
export async function readJsonFile<Type extends Json = Json>(
  pathString: string,
): Promise<VirtualFile<Type>> {
  if (!pathString.endsWith('.json')) {
    throw new Error('The specified file must be a ".json" file.');
  }

  let file;
  try {
    file = await readVirtualFile(pathString, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(
        `Could not find '${pathString}'. Please ensure that the file exists.`,
      );
    }

    throw error;
  }
  file.result = JSON.parse(file.toString());
  return file as VirtualFile<Type>;
}

/**
 * Gets the complete out file path from an output file name and parent
 * directory path.
 *
 * @param outDir - The path to the out file's parent directory.
 * @param outFileName - The out file's name.
 * @returns The complete path to the out file.
 */
export function getOutfilePath(outDir: string, outFileName: string): string {
  return pathUtils.join(outDir, outFileName || 'bundle.js');
}

/**
 * Ensures that the outfile name is just a `.js` file name.
 * Throws on validation failure.
 *
 * @param filename - The file name to validate.
 * @returns `true` if validation succeeded.
 * @throws If the file name is invalid.
 */
export function validateOutfileName(filename: string): boolean {
  if (
    !filename.endsWith('.js') ||
    filename === '.js' ||
    pathUtils.basename(filename) !== filename
  ) {
    throw new Error(`Invalid outfile name: ${filename}. Must be a .js file`);
  }
  return true;
}

/**
 * Validates a file path. Throws on validation failure.
 *
 * @param filePath - The file path to validate.
 * @returns `true` if validation succeeded.
 * @throws If the path does not resolve to a file.
 */
export async function validateFilePath(filePath: string): Promise<boolean> {
  const exists = await isFile(filePath);
  if (!exists) {
    throw new Error(
      `Invalid params: '${filePath}' is not a file or does not exist.`,
    );
  }
  return true;
}

/**
 * Validates a directory path. Throws on validation failure.
 *
 * @param dirPath - The directory path to validate.
 * @param createDir - Whether to create the directory if it doesn't exist.
 * @returns `true` if validation succeeded or the directory was created.
 * @throws If the directory does not exist or could not be created.
 */
export async function validateDirPath(
  dirPath: string,
  createDir: boolean,
): Promise<boolean> {
  const exists = await isDirectory(dirPath, createDir);
  if (!exists) {
    throw new Error(
      `Invalid params: '${dirPath}' is not a directory or could not be created.`,
    );
  }
  return true;
}
