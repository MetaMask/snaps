import { TranspilationModes } from '../builders';
import type { LegacyOptions } from '../config';

/**
 * Get the dependencies to transpile, as well as the regular input file.
 *
 * If `transpilationMode` is not set to `localAndDeps`, this will return an
 * empty array.
 *
 * @param config - The config object.
 * @returns An array with regular expressions of dependencies that should be
 * transpiled.
 */
export function processDependencies(config: LegacyOptions) {
  const { depsToTranspile, transpilationMode } = config;
  if (transpilationMode === TranspilationModes.LocalAndDeps) {
    const regex = getDependencyRegExp(depsToTranspile);
    if (regex !== null) {
      return [regex];
    }
  }

  return [];
}

/**
 * Processes a string of space delimited dependencies into one RegExp string.
 *
 * @param dependencies - An array of dependencies to add to the RegExp.
 * @returns A RegExp object.
 */
export function getDependencyRegExp(dependencies: string[]): RegExp | null {
  if (!dependencies || dependencies.includes('.') || !dependencies.length) {
    return null;
  }

  const paths: string[] = sanitizeDependencyPaths(dependencies);
  return RegExp(`/node_modules/(?!${paths.join('|')})`, 'u');
}

/**
 * Helper function to remove any leading and trailing slashes from dependency
 * list.
 *
 * @param dependencies - An array of dependencies to sanitize.
 * @returns An array of sanitized paths.
 */
export function sanitizeDependencyPaths(dependencies: string[]): string[] {
  return dependencies.map((dependency) => {
    return dependency.replace(/^[/\\]+/u, '').replace(/[/\\]+$/u, '');
  });
}
