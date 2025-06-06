import type { Json } from '@metamask/utils';
import { promises as fs } from 'fs';
import { mkdtemp } from 'fs/promises';
import os from 'os';
import pathUtils from 'path';

import { parseJson } from './json';
import type { VirtualFile } from './virtual-file';
import { readVirtualFile } from './virtual-file/node';

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
  } catch {
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
  file.result = parseJson(file.toString());
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

/**
 * Create a temporary file with a given name and content, writes it to disk and
 * calls the provided function. This function handles deletion of the temporary
 * file after usage.
 *
 * @param fileName - The name of the temporary file.
 * @param fileContents - The content of the temporary file.
 * @param fn - The callback function to call when the temporary file has been
 * created.
 * @returns The result of the callback function.
 */
export async function useTemporaryFile<Type = unknown>(
  fileName: string,
  fileContents: string,
  fn: (path: string) => Promise<Type>,
): Promise<Type> {
  const temporaryDirectory = await mkdtemp(
    pathUtils.join(os.tmpdir(), 'snaps-'),
  );

  const filePath = pathUtils.join(temporaryDirectory, fileName);

  await fs.mkdir(pathUtils.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, fileContents);
  try {
    return await fn(filePath);
  } finally {
    if (await isFile(filePath)) {
      await fs.unlink(filePath);
    }
  }
}

/**
 * Use the file system to cache a return value with a given key and TTL.
 *
 * @param cacheKey - The key to use for the cache.
 * @param ttl - The time-to-live in milliseconds.
 * @param fn - The callback function to wrap.
 * @returns The result from the callback.
 */
export function useFileSystemCache<Type = unknown>(
  cacheKey: string,
  ttl: number,
  fn: () => Promise<Type>,
) {
  return async () => {
    const filePath = pathUtils.join(
      process.cwd(),
      'node_modules/.cache/snaps',
      `${cacheKey}.json`,
    );

    try {
      const cacheContents = await fs.readFile(filePath, 'utf8');
      const json = JSON.parse(cacheContents);

      if (json.timestamp + ttl > Date.now()) {
        return json.value;
      }
    } catch {
      // No-op
    }

    const value = await fn();

    // Null or undefined is not persisted.
    if (value === null || value === undefined) {
      return value;
    }

    try {
      await fs.mkdir(pathUtils.dirname(filePath), { recursive: true });

      const json = { timestamp: Date.now(), value };
      await fs.writeFile(filePath, JSON.stringify(json), {
        encoding: 'utf8',
      });
    } catch {
      // No-op
    }

    return value;
  };
}
