import { bold, red } from 'chalk';

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
