import { logInfo } from '@metamask/snaps-utils';
import { promises as fs } from 'fs';
import { join, resolve } from 'path';

import { TranspilationModes } from '../../../builders';
import type { ProcessedBrowserifyConfig } from '../../../config';
import type { YargsArgs } from '../../../types/yargs';

/**
 * Write the bundle to disk. This logs a success message when the bundle is
 * written.
 *
 * This function assumes that the destination directory exists.
 *
 * @param buffer - The bundle contents.
 * @param config - The config object.
 * @param config.cliOptions - The CLI options.
 * @returns A promise that resolves when the bundle is written to disk.
 */
export async function writeBundleFile(
  buffer: Buffer,
  { cliOptions }: ProcessedBrowserifyConfig,
) {
  const { src, dist, outfileName } = cliOptions;
  const destination = resolve(process.cwd(), dist, outfileName);

  await fs.writeFile(destination, buffer?.toString());
  logInfo(`Build success: '${src}' bundled as '${join(dist, outfileName)}'!`);
}

/**
 * Processes dependencies and updates `argv` with an options object.
 *
 * @param config - The config object.
 * @returns An object with options that can be passed to Babelify.
 */
export function processDependencies(config: ProcessedBrowserifyConfig) {
  const { depsToTranspile, transpilationMode } = config.cliOptions;
  const babelifyOptions: Record<string, any> = {};
  if (transpilationMode === TranspilationModes.LocalAndDeps) {
    const regexpStr = getDependencyRegExp(depsToTranspile);
    if (regexpStr !== null) {
      babelifyOptions.ignore = [regexpStr];
    }
  }
  return babelifyOptions;
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

/**
 * Check the Yargs argv object, to see if the provided options are valid. The
 * options are invalid if both `depsToTranspile` are provided, and
 * `transpilationMode` is not set to `localAndDeps`.
 *
 * @param argv - The Yargs arguments object.
 * @throws If the `depsToTranspile` is set, and `transpilationMode` is not set
 * to `localAndDeps`.
 */
export function processInvalidTranspilation(argv: YargsArgs) {
  if (
    argv.depsToTranspile &&
    argv.transpilationMode !== TranspilationModes.LocalAndDeps
  ) {
    throw new Error(
      '"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps".',
    );
  }
}
