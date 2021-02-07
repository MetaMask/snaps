import pathUtils from 'path';
import { isFile, isDirectory } from './fs';

/**
 * Gets the complete out file path from the source file path and output
 * directory path.
 *
 * @param srcFilePath - The source file path
 * @param outDir - The out file directory
 * @returns - The complete out file path
 */
export function getOutfilePath(outDir: string, outFileName: string): string {
  return pathUtils.join(outDir, outFileName || 'bundle.js');
}

/**
   * Ensures that the outfile name is just a js file name.
   * Throws on validation failure
   *
   * @param filename - The file name to validate
   * @returns - True if validation succeeded
   */
export function validateOutfileName(filename: string): boolean {
  if (!filename.endsWith('.js') || filename.indexOf('/') !== -1) {
    throw new Error(`Invalid outfile name: ${filename}`);
  }
  return true;
}

/**
   * Validates a file path.
   * Throws on validation failure
   *
   * @param filePath - The file path to validate
   * @returns - True if validation succeeded
   */
export async function validateFilePath(filePath: string): Promise<boolean> {
  const exists = await isFile(filePath);
  if (!exists) {
    throw new Error(`Invalid params: '${filePath}' is not a file or does not exist.`);
  }
  return true;
}

/**
   * Validates a directory path.
   * Throws on validation failure
   *
   * @param dirPath - The directory path to validate
   * @param createDir - Whether to create the directory if it doesn't exist
   * @returns - True if validation succeeded
   */
export async function validateDirPath(dirName: string, createDir: boolean): Promise<boolean> {
  const exists = await isDirectory(dirName, createDir);
  if (!exists) {
    throw new Error(`Invalid params: '${dirName}' is not a directory or could not be created.`);
  }
  return true;
}
