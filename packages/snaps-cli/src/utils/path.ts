import { relative } from 'path';

/**
 * Get the relative path from the current working directory to the given
 * absolute path.
 *
 * @param absolutePath - The absolute path.
 * @param cwd - The current working directory. Defaults to `process.cwd()`.
 * @returns The relative path.
 */
export function getRelativePath(absolutePath: string, cwd = process.cwd()) {
  return relative(cwd, absolutePath);
}
