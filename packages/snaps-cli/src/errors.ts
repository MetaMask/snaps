import { bold, red } from 'chalk';

/**
 * An error that is thrown when a command fails.
 *
 * It wraps the error prefix in a bold red "Error" string.
 */
export class CommandError extends Error {
  constructor(message: string, name = 'Error') {
    super(message);
    this.name = bold(red(name));
  }
}

/**
 * An error that is thrown when the config file cannot be loaded.
 */
export class ConfigError extends CommandError {
  constructor(message: string) {
    super(message, 'Config Error');
  }
}
