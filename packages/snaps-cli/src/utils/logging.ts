import { logWarning } from '@metamask/snaps-utils';
import { bold, red, yellow } from 'chalk';

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
 */
export function warn(message: string) {
  logWarning(`${bold(yellow('Warning:'))} ${normalize(message)}`);
}

/**
 * Log an error message. The message is prefixed with "Error:".
 *
 * @param message - The message to log.
 */
export function error(message: string) {
  logWarning(`${bold(red('Error:'))} ${normalize(message)}`);
}
