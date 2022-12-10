/// <reference types="node" />
import { YargsArgs } from '../../types/yargs';
declare type WriteBundleFileArgs = {
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
export declare function writeBundleFile({ bundleError, bundleBuffer, src, dest, resolve, }: WriteBundleFileArgs): Promise<void>;
/**
 * Processes dependencies and updates `argv` with an options object.
 *
 * @param argv - The Yargs arguments object.
 * @returns An object with options that can be passed to Babelify.
 */
export declare function processDependencies(argv: YargsArgs): Record<string, any>;
/**
 * Processes a string of space delimited dependencies into one RegExp string.
 *
 * @param dependencies - An array of dependencies to add to the RegExp.
 * @returns A RegExp object.
 */
export declare function getDependencyRegExp(dependencies: string[]): RegExp | null;
/**
 * Helper function remove any leading and trailing slashes from dependency list.
 *
 * @param dependencies - An array of dependencies to sanitize.
 * @returns An array of sanitized paths.
 */
export declare function sanitizeDependencyPaths(dependencies: string[]): string[];
/**
 * Check the Yargs argv object, to see if the provided options are valid. The
 * options are invalid if both `depsToTranspile` are provided, and
 * `transpilationMode` is not set to `localAndDeps`.
 *
 * @param argv - The Yargs arguments object.
 * @throws If the `depsToTranspile` is set, and `transpilationMode` is not set
 * to `localAndDeps`.
 */
export declare function processInvalidTranspilation(argv: YargsArgs): void;
export {};
