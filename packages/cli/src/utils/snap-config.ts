import path from 'path';
import { hasProperty } from '@metamask/utils';
import type browserify from 'browserify';
import { Arguments } from 'yargs';
import yargsParse from 'yargs-parser';
import yargs from 'yargs/yargs';
import builders from '../builders';
import { CONFIG_FILE, logError } from './misc';
import { isSnapConfig } from './snap-config.__GENERATED__';

/** @see {isSnapConfig} ts-auto-guard:type-guard */
export type SnapConfig = {
  cliOptions?: Record<string, unknown>;
  bundlerCustomizer?: (bundler: browserify.BrowserifyObject) => void;
};

let snapConfigCache: SnapConfig | undefined;

/**
 * Attempt to load the snap config file (`snap.config.js`). By default will use
 * the cached config, if it was loaded before, and `cached` is `true`. If the
 * config file is not found, or the config is invalid, this function will kill
 * the process.
 *
 * @param cached - Whether to use the cached config. Defaults to `true`.
 * @returns The snap config.
 */
export function loadConfig(cached = true): SnapConfig {
  if (snapConfigCache !== undefined && cached === true) {
    return snapConfigCache;
  }

  let config: any;
  try {
    // eslint-disable-next-line node/global-require, import/no-dynamic-require, @typescript-eslint/no-require-imports
    config = require(path.resolve(process.cwd(), CONFIG_FILE));
  } catch (err: any) {
    if (err.code === 'MODULE_NOT_FOUND') {
      snapConfigCache = {};
      return snapConfigCache;
    }
    logError(`Error during parsing of ${CONFIG_FILE}`, err);
    return process.exit(1);
  }

  if (!isSnapConfig(config)) {
    logError(
      `Can't validate ${CONFIG_FILE}. Ensure it's a proper javascript file and abides with the structure of a snap configuration file`,
    );
    return process.exit(1);
  }
  snapConfigCache = config;
  return config;
}

// Note that the below function is necessary because yargs' .config() function
// leaves much to be desired.
//
// In particular, it will set all properties included in the config file
// regardless of the command, which fails during validation.

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
export function applyConfig(
  snapConfig: SnapConfig,
  processArgv: string[],
  yargsArgv: Arguments,
  yargsInstance: typeof yargs,
): void {
  // Instances of yargs has a number of undocumented functions, including
  // getOptions. This function returns an object with properties "key" and
  // "alias", which specify the options associated with the current command and
  // their aliases, respectively.
  //
  // We leverage this to ensure that the config is only applied to args that are
  // valid for the current command, and that weren't specified by the user on
  // the command line.
  //
  // If we set args that aren't valid for the current command, yargs will error
  // during validation.
  const { alias: aliases, key: options } = (
    yargsInstance as any
  ).getOptions() as {
    alias: Record<string, string[]>;
    key: Record<string, unknown>;
  };

  const parsedProcessArgv = yargsParse(processArgv, {
    alias: aliases,
  }) as Record<string, unknown>;
  delete parsedProcessArgv._; // irrelevant yargs parser artifact

  const commandOptions = new Set(Object.keys(options));

  const shouldSetArg = (key: string): boolean => {
    return commandOptions.has(key) && !hasProperty(parsedProcessArgv, key);
  };

  const cfg: Record<string, unknown> = snapConfig.cliOptions || {};
  for (const key of Object.keys(cfg)) {
    if (hasProperty(builders, key)) {
      if (shouldSetArg(key)) {
        yargsArgv[key] = cfg[key];
      }
    } else {
      logError(
        `Error: Encountered unrecognized config property "options.${key}" in config file "${CONFIG_FILE}". Remove the property and try again.`,
      );
      process.exit(1);
    }
  }
}
