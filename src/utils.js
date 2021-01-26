const { promises: fs } = require('fs');
const pathUtils = require('path');
const readline = require('readline');
const builders = require('./builders');

const permRequestKeys = [
  '@context',
  'id',
  'parentCapability',
  'invoker',
  'date',
  'caveats',
  'proof',
];

const CONFIG_PATHS = [
  'snap.config.json',
];

module.exports = {
  CONFIG_PATHS,
  isFile,
  isDirectory,
  getOutfilePath,
  logError,
  logWarning,
  permRequestKeys,
  validateDirPath,
  validateFilePath,
  validateOutfileName,
  prompt,
  closePrompt,
  trimPathString,
  assignGlobals,
  sanitizeInputs,
  applyConfig,
};

global.snaps = {
  verboseErrors: false,
  suppressWarnings: false,
  isWatching: false,
};

// misc utils

/**
 * Trims leading and trailing periods "." and forward slashes "/" from the
 * given path string.
 *
 * @param {string} pathString - The path string to trim.
 * @returns {string} The trimmed path string.
 */
function trimPathString(pathString) {
  return pathString.replace(/^[./]+|[./]+$/gu, '');
}

/**
 * Logs an error message to console. Logs original error if it exists and
 * the verboseErrors global is true.
 *
 * @param {string} msg - The error message
 * @param {Error} err - The original error
 */
function logError(msg, err) {
  if (msg instanceof Error) {
    if (snaps.verboseErrors) {
      console.error(msg);
    } else {
      console.error(msg.message);
    }
  } else if (typeof msg === 'string') {
    console.error(msg);
    if (err && snaps.verboseErrors) {
      console.error(err);
    }
  }
}

/**
 * Logs a warning message to console.
 *
 * @param {string} msg - The warning message
 */
function logWarning(msg) {
  if (msg && !snaps.supressWarnings) {
    console.warn(msg);
  }
}

/**
 * Gets the complete out file path from the source file path and output
 * directory path.
 *
 * @param {string} srcFilePath - The source file path
 * @param {string} outDir - The out file directory
 * @returns {string} - The complete out file path
 */
function getOutfilePath(outDir, outFileName) {
  return pathUtils.join(outDir, outFileName || 'bundle.js');
}

/**
 * Ensures that the outfile name is just a js file name.
 * Throws on validation failure
 *
 * @param {string} str - The file name to validate
 * @returns {boolean} - True if validation succeeded
 */
function validateOutfileName(str) {
  if (!str.endsWith('.js') || str.indexOf('/') !== -1) {
    throw new Error(`Invalid outfile name: ${str}`);
  }
  return true;
}

/**
 * Validates a file path.
 * Throws on validation failure
 *
 * @param {string} filePath - The file path to validate
 * @returns {boolean} - True if validation succeeded
 */
async function validateFilePath(filePath) {

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
 * @param {string} dirPath - The directory path to validate
 * @returns {boolean} - True if validation succeeded
 */
async function validateDirPath(dirName, createDir) {

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
 * @param {string} pathString - The path string to check
 * @param {boolean} createDir - Whether to create the directory if it doesn't exist
 * @returns {boolean} - Whether the given path is an existing directory
 */
async function isDirectory(pathString, createDir) {
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
async function isFile(pathString) {
  try {
    const stats = await fs.stat(pathString);
    return stats.isFile();
  } catch (error) {
    return false;
  }
}

// readline utils

let rl;

function closePrompt() {
  if (rl) {
    rl.close();
  }
}

function openPrompt() {
  rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(question, def, shouldClose) {
  if (!rl) {
    openPrompt();
  }
  return new Promise((resolve, _reject) => {
    let queryString = `${question} `;
    if (def) {
      queryString += `(${def}) `;
    }
    rl.question(queryString, (answer) => {
      if (!answer || !answer.trim()) {
        resolve(def);
      }
      resolve(answer.trim());
      if (shouldClose) {
        rl.close();
      }
    });
  });
}

function assignGlobals(argv) {
  if (['w', 'watch'].includes(argv._[0])) {
    snaps.isWatching = true;
  }
  if (Object.prototype.hasOwnProperty.call(argv, 'verboseErrors')) {
    snaps.verboseErrors = Boolean(argv.verboseErrors);
  }
  if (Object.prototype.hasOwnProperty.call(argv, 'suppressWarnings')) {
    snaps.suppressWarnings = Boolean(argv.suppressWarnings);
  }
}

/**
 * Sanitizes inputs. Currently:
 * - normalizes paths
 */
function sanitizeInputs(argv) {
  Object.keys(argv).forEach((key) => {
    if (typeof argv[key] === 'string') {
      if (argv[key] === './') {
        argv[key] = '.';
      } else if (argv[key].startsWith('./')) {
        argv[key] = argv[key].substring(2);
      }
    }
  });
}

/**
 * Attempts to read the config file and apply the config to
 * globals.
 */
async function applyConfig() {
  // first, attempt to read and apply config from package.json
  let pkg = {};

  try {
    pkg = JSON.parse(await fs.readFile('package.json'));

    if (pkg.main) {
      builders.src.default = pkg.main;
    }

    if (pkg.web3Wallet) {
      const { bundle } = pkg.web3Wallet;
      if (bundle && bundle.local) {
        const { local: bundlePath } = bundle;
        builders.bundle.default = bundlePath;
        let dist;
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
  let cfg = {};
  for (const configPath of CONFIG_PATHS) {
    try {
      cfg = JSON.parse(await fs.readFile(configPath));
      break;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        logWarning(`Warning: '${configPath}' exists but could not be parsed.`);
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
