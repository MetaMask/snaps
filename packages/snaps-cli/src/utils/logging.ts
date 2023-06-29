import { logError, logInfo, logWarning } from '@metamask/snaps-utils';
import { blue, dim, red, yellow } from 'chalk';
import { Ora } from 'ora';

/**
 * Indent a message by adding a number of spaces to the beginning of each line.
 *
 * @param message - The message to indent.
 * @param spaces - The number of spaces to indent by. Defaults to 2.
 * @returns The indented message.
 */
export function indent(message: string, spaces = 2) {
  return message.replace(/^/gmu, ' '.repeat(spaces));
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

  logWarning(`${yellow('⚠')} ${message}`);
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

  logInfo(`${blue('ℹ')} ${dim(message)}`);
}

/**
 * Log an error message. The message is prefixed with "Error:".
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export function error(message: string, spinner?: Ora) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }

  logError(`${red('✖')} ${message}`);
}
