/// <reference types="watchify" />
import type browserify from 'browserify';
import { Arguments } from 'yargs';
import yargs from 'yargs/yargs';
import { Infer } from 'superstruct';
export declare type BundleCustomizer = (bundler: browserify.BrowserifyObject) => void;
export declare const SnapConfigStruct: import("superstruct").Struct<{
    cliOptions?: Record<string, unknown> | undefined;
    bundlerCustomizer?: Function | undefined;
}, {
    cliOptions: import("superstruct").Struct<Record<string, unknown> | undefined, null>;
    bundlerCustomizer: import("superstruct").Struct<Function | undefined, null>;
}>;
export declare type SnapConfig = Omit<Infer<typeof SnapConfigStruct>, 'bundlerCustomizer'> & {
    bundlerCustomizer?: BundleCustomizer;
};
/**
 * Check if the given value is a {@link SnapConfig} object. Note that this
 * function does not check the validity of the `bundleCustomizer` property, as
 * it is not possible to check the validity of a function in JavaScript.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a valid {@link SnapConfig} object, `false`
 * otherwise.
 */
export declare function isSnapConfig(value: unknown): value is SnapConfig;
/**
 * Attempt to load the snap config file (`snap.config.js`). By default will use
 * the cached config, if it was loaded before, and `cached` is `true`. If the
 * config file is not found, or the config is invalid, this function will kill
 * the process.
 *
 * @param cached - Whether to use the cached config. Defaults to `true`.
 * @returns The snap config.
 */
export declare function loadConfig(cached?: boolean): SnapConfig;
/**
 * Attempts to read configuration options for package.json and the config file,
 * and apply them to argv if they weren't already set.
 *
 * Arguments are only set per the snap-cli config file if they were not specified
 * on the command line.
 *
 * @param snapConfig - The snap config.
 * @param processArgv - The command line arguments, i.e., `process.argv`.
 * @param yargsArgv - The processed `yargs` arguments.
 * @param yargsInstance - An instance of `yargs`.
 */
export declare function applyConfig(snapConfig: SnapConfig, processArgv: string[], yargsArgv: Arguments, yargsInstance: typeof yargs): void;
