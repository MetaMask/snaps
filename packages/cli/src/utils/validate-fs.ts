import pathUtils from 'path';
import { isFile, isDirectory } from './fs';

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
    filename.indexOf('/') !== -1
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
