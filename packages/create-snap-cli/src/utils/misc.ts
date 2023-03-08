import { logError as logErrorUtil } from '@metamask/snaps-utils';
import { promises as filesystem } from 'fs';

export const CONFIG_FILE = 'snap.config.js';

/**
 * Attempts to convert a string to a boolean and throws if the value is invalid.
 *
 * @param value - The value to convert to a boolean.
 * @returns `true` if the value is the string `"true"`, `false` if it is the
 * string `"false"`, the value if it is already a boolean, or an error
 * otherwise.
 */
export function booleanStringToBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  } else if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  }

  throw new Error(
    `Expected a boolean or the strings "true" or "false". Received: "${String(
      value,
    )}"`,
  );
}

/**
 * Logs an error message to console. Logs original error if it exists and
 * the verboseErrors global is true.
 *
 * @param message - The error message.
 * @param error - The original error.
 */
export function logError(message: string | null, error?: Error): void {
  if (message !== null) {
    logErrorUtil(message);
  }

  if (error && global.snaps.verboseErrors) {
    logErrorUtil(error);
  }

  if (message === null && (!error || (error && !global.snaps.verboseErrors))) {
    logErrorUtil('Unknown error.');
  }
}

/**
 * Logs an error, attempts to unlink the destination file, and kills the
 * process.
 *
 * @param prefix - The message prefix.
 * @param message - The error message.
 * @param error - The original error.
 * @param destFilePath - The output file path.
 */
export async function writeError(
  prefix: string,
  message: string,
  error: Error,
  destFilePath?: string,
): Promise<void> {
  let processedPrefix = prefix;
  if (!prefix.endsWith(' ')) {
    processedPrefix += ' ';
  }

  logError(processedPrefix + message, error);
  try {
    if (destFilePath) {
      await filesystem.unlink(destFilePath);
    }
  } catch (unlinkError) {
    logError(`${processedPrefix}Failed to unlink mangled file.`, unlinkError);
  }

  // unless the watcher is active, exit
  if (!global.snaps.isWatching) {
    // TODO(ritave): Remove process exit and change into collapse of functions
    //               https://github.com/MetaMask/snaps-monorepo/issues/81
    process.exit(1);
  }
}

/**
 * Trims leading and trailing periods "." and forward slashes "/" from the
 * given path string.
 *
 * @param pathString - The path string to trim.
 * @returns The trimmed path string.
 */
export function trimPathString(pathString: string): string {
  return pathString.replace(/^[./]+|[./]+$/gu, '');
}
