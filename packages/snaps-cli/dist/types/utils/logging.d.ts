import type { Ora } from 'ora';
/**
 * Log a warning message. The message is prefixed with "Warning:".
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export declare function warn(message: string, spinner?: Ora): void;
/**
 * Log an info message.
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export declare function info(message: string, spinner?: Ora): void;
/**
 * Log an error message. The message is prefixed with "Error:".
 *
 * @param message - The message to log.
 * @param spinner - The spinner to clear.
 */
export declare function error(message: string, spinner?: Ora): void;
