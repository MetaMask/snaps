import { promises as fs } from 'fs';
import builders from '../builders';
import { logWarning } from './misc';
import { CONFIG_PATHS } from '.';

/**
 * Attempts to read the config file and apply the config to
 * globals.
 */
export async function applyConfig(): Promise<void> {

  let pkg: any;

  // first, attempt to read and apply config from package.json
  try {

    pkg = JSON.parse(await fs.readFile('package.json', 'utf8'));

    if (pkg.main) {
      builders.src.default = pkg.main;
    }

    if (pkg.web3Wallet) {
      const { bundle } = pkg.web3Wallet;
      if (bundle?.local) {
        const { local: bundlePath } = bundle;
        builders.bundle.default = bundlePath;
        let dist: string;
        if (bundlePath.indexOf('/') === -1) {
          dist = '.';
        } else {
          dist = bundlePath.substr(0, bundlePath.indexOf('/') + 1);
        }
        builders.dist.default = dist;
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      logWarning(`Warning: Could not parse package.json`, err);
    }
  }

  // second, attempt to read and apply config from config file,
  // which will always be preferred if it exists
  let cfg: Record<string, unknown> = {};
  for (const configPath of CONFIG_PATHS) {
    try {
      cfg = JSON.parse(await fs.readFile(configPath, 'utf8'));
      break;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logWarning(`Warning: '${configPath}' exists but could not be parsed.`, err);
      }
    }
  }

  if (
    typeof cfg !== 'object' ||
        Object.keys(cfg).length === 0
  ) {
    return;
  }

  Object.keys(cfg).forEach((key) => {
    builders[key].default = cfg[key];
  });
}
