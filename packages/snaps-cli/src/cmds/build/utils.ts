import { logInfo } from '@metamask/snaps-utils';
import { promises as fs } from 'fs';

import { TranspilationModes } from '../../builders';
import { YargsArgs } from '../../types/yargs';
import { writeError } from '../../utils';

type WriteBundleFileArgs = {
  bundleError: Error;
  bundleBuffer: Buffer;
  src: string;
  dest: string;
  resolve: (value: boolean) => void;
};

/**
 * Performs postprocessing on the bundle contents and writes them to disk.
 * Intended to be used in the callback passed to the Browserify `.bundle()`
 * call.
 *
 * @param options - Options bag.
 * @param options.bundleError - Any error received from Browserify.
 * @param options.bundleBuffer - The {@link Buffer} with the bundle contents
 * from Browserify.
 * @param options.src - The source file path.
 * @param options.dest - The destination file path.
 * @param options.resolve - A {@link Promise} resolution function, so that we
 * can use promises and `async`/`await` even though Browserify uses callbacks.
 */
export async function writeBundleFile({
  bundleError,
  bundleBuffer,
  src,
  dest,
  resolve,
}: WriteBundleFileArgs) {
  if (bundleError) {
    await writeError('Build error:', bundleError.message, bundleError);
  }

  try {
    await fs.writeFile(dest, bundleBuffer?.toString());
    logInfo(`Build success: '${src}' bundled as '${dest}'!`);
    resolve(true);
  } catch (error) {
    await writeError('Write error:', error.message, error, dest);
  }
}

/**
 * Processes dependencies and updates `argv` with an options object.
 *
 * @param argv - The Yargs arguments object.
 * @returns An object with options that can be passed to Babelify.
 */
export function processDependencies(argv: YargsArgs) {
  const { depsToTranspile, transpilationMode } = argv;
  const babelifyOptions: Record<string, any> = {};
  if (transpilationMode === TranspilationModes.LocalAndDeps) {
    const regexpStr = getDependencyRegExp(depsToTranspile as string[]);
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
  let regexp: string | null = null;
  if (!dependencies || dependencies.includes('.') || !dependencies.length) {
    return regexp;
  }
  const paths: string[] = sanitizeDependencyPaths(dependencies);
  regexp = `/node_modules/(?!${paths.shift() ?? ''}`;
  paths.forEach((path) => (regexp += `|${path}`));
  regexp += '/)';
  return RegExp(regexp, 'u');
}

/**
 * Helper function remove any leading and trailing slashes from dependency list.
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
      '"depsToTranspile" can only be specified if "transpilationMode" is set to "localAndDeps" .',
    );
  }
}
