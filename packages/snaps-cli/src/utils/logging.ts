import { logInfo, logWarning } from '@metamask/snaps-utils';
import { blue, bold, dim, red, yellow } from 'chalk';
import { Ora } from 'ora';

/**
 * Normalize a message by trimming whitespace.
 *
 * @param message - The message to normalize.
 * @returns The normalized message.
 */
export function normalize(message: string) {
  return message
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .replace(/^\s*\n/u, '');
}

/**
 * Log a warning message. The message is prefixed with "Warning:".
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export function warn(message: string, spinner?: Ora) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }

  logWarning(`${yellow('⚠')} ${normalize(message)}`);
}

/**
 * Log an info message.
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export function info(message: string, spinner?: Ora) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }

  logInfo(`${blue('ℹ')} ${dim(normalize(message))}`);
}

/**
 * Log an error message. The message is prefixed with "Error:".
 *
 * @param message - The message to log.
 */
export function error(message: string) {
  logWarning(`${bold(red('Error:'))} ${normalize(message)}`);
}
