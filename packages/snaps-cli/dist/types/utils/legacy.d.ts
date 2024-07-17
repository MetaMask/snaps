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
export declare function processDependencies(config: LegacyOptions): RegExp[];
/**
 * Processes a string of space delimited dependencies into one RegExp string.
 *
 * @param dependencies - An array of dependencies to add to the RegExp.
 * @returns A RegExp object.
 */
export declare function getDependencyRegExp(dependencies: string[]): RegExp | null;
/**
 * Helper function to remove any leading and trailing slashes from dependency
 * list.
 *
 * @param dependencies - An array of dependencies to sanitize.
 * @returns An array of sanitized paths.
 */
export declare function sanitizeDependencyPaths(dependencies: string[]): string[];
