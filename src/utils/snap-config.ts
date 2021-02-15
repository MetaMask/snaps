import { promises as fs } from 'fs';
import { Arguments } from 'yargs';
import builders from '../builders';
import { logError } from './misc';
import { CONFIG_PATHS } from '.';

const INVALID_CONFIG_FILE = 'Invalid config file.';

/**
 * Attempts to read the config file and apply the config to
 * globals.
 */
export async function applyConfig(argv: Arguments): Promise<void> {
  let pkg: any;

  // first, attempt to read and apply config from package.json
  try {
    pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));

    if (pkg.main) {
      argv.src = pkg.main;
    }

    if (pkg.web3Wallet) {
      const { bundle } = pkg.web3Wallet;
      if (bundle?.local) {
        const { local: bundlePath } = bundle;
        argv.bundle = bundlePath;
        let dist: string;
        if (bundlePath.indexOf('/') === -1) {
          dist = '.';
        } else {
          dist = bundlePath.substr(0, bundlePath.indexOf('/') + 1);
        }
        argv.dist = dist;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logError(
        'Error: package.json exists but could not be parsed.',
        err,
      );
      process.exit(1);
    }
  }

  // second, attempt to read and apply config from config file,
  // which will always be preferred if it exists
  let cfg: Record<string, unknown> = {};
  let usedConfigPath: string | null = null;
  for (const configPath of CONFIG_PATHS) {
    try {
      cfg = JSON.parse(await fs.readFile(configPath, 'utf8'));
      usedConfigPath = configPath;
      break;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logError(
          `Error: "${configPath}" exists but could not be parsed`,
          err,
        );
        process.exit(1);
      }
    }
  }

  if (cfg && typeof cfg === 'object' && !Array.isArray(cfg)) {
    for (const key of Object.keys(cfg)) {
      if (Object.hasOwnProperty.call(builders, key)) {
        argv[key] = cfg[key];
      } else {
        logError(
          `Error: Encountered unrecognized config file property "${key}" in config file "${usedConfigPath as string}".`,
          new Error(INVALID_CONFIG_FILE),
        );
        process.exit(1);
      }
    }
  } else {
    const cfgType = cfg === null ? 'null' : typeof cfg;

    logError(
      `Error: The config file must consist of a top-level JSON object. Received "${cfgType}" from "${usedConfigPath as string}".`,
      new Error(INVALID_CONFIG_FILE),
    );
    process.exit(1);
  }
}
