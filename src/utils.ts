import { promises as fs } from 'fs';
import pathUtils from 'path';
import readline from 'readline';
import yargs from 'yargs';
import builders from './builders';

export const permRequestKeys = [
  '@context',
  'id',
  'parentCapability',
  'invoker',
  'date',
  'caveats',
  'proof',
];

export const CONFIG_PATHS = [
  'snap.config.json',
];

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

/**
 * Trims leading and trailing periods "." and forward slashes "/" from the
 * given path string.
 *
 * @param pathString - The path string to trim.
 * @returns - The trimmed path string.
 */
export function trimPathString(pathString: string): string {
  return pathString.replace(/^[./]+|[./]+$/gu, '');
}

/**
 * Logs an error message to console. Logs original error if it exists and
 * the verboseErrors global is true.
 *
 * @param msg - The error message
 * @param err - The original error
 */
export function logError(msg: string, err?: Error): void {
  console.error(msg);
  if (err && global.snaps.verboseErrors) {
    console.error(err);
  }
}

/**
 * Logs a warning message to console.
 *
 * @param msg - The warning message
 */
export function logWarning(msg: string, error?: Error): void {
  if (msg && !global.snaps.suppressWarnings) {
    console.warn(msg);
    if (error && global.snaps.verboseErrors) {
      console.error(error);
    }
  }
}

/**
 * Gets the complete out file path from the source file path and output
 * directory path.
 *
 * @param srcFilePath - The source file path
 * @param outDir - The out file directory
 * @returns - The complete out file path
 */
export function getOutfilePath(outDir: string, outFileName: string): string {
  return pathUtils.join(outDir, outFileName || 'bundle.js');
}

/**
 * Ensures that the outfile name is just a js file name.
 * Throws on validation failure
 *
 * @param filename - The file name to validate
 * @returns - True if validation succeeded
 */
export function validateOutfileName(filename: string): boolean {
  if (!filename.endsWith('.js') || filename.indexOf('/') !== -1) {
    throw new Error(`Invalid outfile name: ${filename}`);
  }
  return true;
}

/**
 * Validates a file path.
 * Throws on validation failure
 *
 * @param filePath - The file path to validate
 * @returns - True if validation succeeded
 */
export async function validateFilePath(filePath: string): Promise<boolean> {
  const exists = await isFile(filePath);
  if (!exists) {
    throw new Error(`Invalid params: '${filePath}' is not a file or does not exist.`);
  }
  return true;
}

/**
 * Validates a directory path.
 * Throws on validation failure
 *
 * @param dirPath - The directory path to validate
 * @param createDir - Whether to create the directory if it doesn't exist
 * @returns - True if validation succeeded
 */
export async function validateDirPath(dirName: string, createDir: boolean): Promise<boolean> {
  const exists = await isDirectory(dirName, createDir);
  if (!exists) {
    throw new Error(`Invalid params: '${dirName}' is not a directory or could not be created.`);
  }
  return true;
}

/**
 * Checks whether the given path string resolves to an existing directory, and
 * optionally creates the directory if it doesn't exist.
 *
 * @param pathString - The path string to check
 * @param createDir - Whether to create the directory if it doesn't exist
 * @returns - Whether the given path is an existing directory
 */
export async function isDirectory(pathString: string, createDir: boolean): Promise<boolean> {
  try {
    const stats = await fs.stat(pathString);
    return stats.isDirectory();
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (!createDir) {
        return false;
      }
      try {
        await fs.mkdir(pathString);
        return true;
      } catch (mkdirError) {
        logError(`Directory '${pathString}' could not be created.`, mkdirError);
        process.exit(1);
      }
    }
    return false;
  }
}

/**
 * Checks whether the given path string resolves to an existing file.
 *
 * @param {string} pathString - The path string to check
 * @returns {boolean} - Whether the given path is an existing file
 */
export async function isFile(pathString: string): Promise<boolean> {
  try {
    const stats = await fs.stat(pathString);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

/* Readline Utils */

let rl: readline.Interface;

function openPrompt(): void {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

export function prompt(question: string, def?: string, shouldClose?: boolean): Promise<string> {
  if (!rl) {
    openPrompt();
  }
  return new Promise((resolve, _reject) => {
    let queryString = `${question} `;
    if (def) {
      queryString += `(${def}) `;
    }
    rl.question(queryString, (answer: string) => {
      if (!answer || !answer.trim()) {
        if (def !== undefined) {
          resolve(def);
        }
      }
      resolve(answer.trim());
      if (shouldClose) {
        rl.close();
      }
    });
  });
}

export function closePrompt(): void {
  if (rl) {
    rl.close();
  }
}

/**
 * Sets global variable snaps which tracks user settings:
 * watch mode activation, verbose errors messages, and whether to suppress warnings.
 *
 * @param {Argument} argv - arguments as an object generated by yargs
 */
export function assignGlobals(argv: yargs.Arguments<{
  verboseErrors: boolean;
} & {
  suppressWarnings: boolean;
}>) {
  if (['w', 'watch'].includes(argv._[0] as string)) {
    global.snaps.isWatching = true;
  }
  if (Object.prototype.hasOwnProperty.call(argv, 'verboseErrors')) {
    global.snaps.verboseErrors = Boolean(argv.verboseErrors);
  }
  if (Object.prototype.hasOwnProperty.call(argv, 'suppressWarnings')) {
    global.snaps.suppressWarnings = Boolean(argv.suppressWarnings);
  }
}

/**
 * Sanitizes inputs. Currently normalizes paths.
 *
 * @param {Argument} argv - arguments as an object generated by yargs
 */
export function sanitizeInputs(argv: yargs.Arguments<{
  verboseErrors: boolean;
} & {
  suppressWarnings: boolean;
}>) {
  Object.keys(argv).forEach((key) => {
    if (typeof argv[key] === 'string') {
      if (argv[key] === './') {
        argv[key] = '.';
      } else if ((argv[key] as string).startsWith('./')) {
        argv[key] = (argv[key] as string).substring(2);
      }
    }
  });
}

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
