import { logError, logInfo, logWarning } from '@metamask/snaps-utils';
import { blue, dim, red, yellow } from 'chalk';
import type { Ora } from 'ora';

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
