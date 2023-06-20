import { logInfo } from '@metamask/snaps-utils';
import { bold, greenBright, red } from 'chalk';

/**
 * An error that is thrown when a command fails.
 *
 * It wraps the error prefix in a bold red "Error" string.
 */
export class CommandError extends Error {
  constructor(message: string) {
    super(message);
    this.name = bold(red('Error'));
  }
}

/**
 * Log a success message.
 *
 * @param message - The message to log.
 */
export function success(message: string) {
  logInfo(`${greenBright('✔')} ${message}`);
}
