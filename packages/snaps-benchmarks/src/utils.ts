import { logInfo } from '@metamask/snaps-utils';
import { Ora } from 'ora';

/**
 * Log a message to the console.
 *
 * @param spinner - The spinner to use for logging.
 * @param message - The message to log.
 */
export function log(spinner: Ora, message: string) {
  spinner.clear();
  spinner.frame();
  logInfo(message);
}
