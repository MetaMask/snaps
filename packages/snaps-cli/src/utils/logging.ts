import { logError, logInfo, logWarning } from '@metamask/snaps-utils';
import { blue, dim, green, red, yellow } from 'chalk';
import type { Ora } from 'ora';

/**
 * Log a success message. The message is prefixed with a green checkmark.
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export function success(message: string, spinner?: Ora) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }

  logInfo(`${green('✔')} ${message}`);
}

/**
 * Log a warning message. The message is prefixed with a yellow warning sign.
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

/**
 * Log a message.
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export function log(message: string, spinner?: Ora) {
  if (spinner) {
    spinner.clear();
    spinner.frame();
  }

  logInfo(message);
}
