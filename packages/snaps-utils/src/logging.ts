import { createProjectLogger } from '@metamask/utils';

// The global logger used across the monorepo. Other projects should use this
// to create a module logger.
export const snapsLogger = createProjectLogger('snaps');

/**
 * Log a message. Currently, this is just a wrapper around `console.log`, but
 * the implementation may change in the future. These logs will be included in
 * production builds, so they should be used sparingly, and not contain any
 * sensitive information.
 *
 * This function makes it easy to swap out the logging implementation in all
 * files at once.
 *
 * @param message - The message to log.
 * @param optionalParams - Additional parameters to pass to the logging.
 */
export function logInfo(message: string, ...optionalParams: unknown[]): void {
  // eslint-disable-next-line no-console
  console.log(message, ...optionalParams);
}

/**
 * Log an error. Currently, this is just a wrapper around `console.error`, but
 * the implementation may change in the future. These logs will be included in
 * production builds, so they should be used sparingly, and not contain any
 * sensitive information.
 *
 * These logs should always be visible, without requiring the user to enable
 * verbose logging (like setting a `DEBUG` environment variable), as they are
 * important for debugging snaps.
 *
 * This function makes it easy to swap out the logging implementation in all
 * files at once.
 *
 * @param error - The error to log.
 * @param optionalParams - Additional parameters to pass to the logging.
 */
export function logError(error: unknown, ...optionalParams: unknown[]): void {
  // eslint-disable-next-line no-console
  console.error(error, ...optionalParams);
}

/**
 * Log a warning. Currently, this is just a wrapper around `console.warn`, but
 * the implementation may change in the future. These logs will be included in
 * production builds, so they should be used sparingly, and not contain any
 * sensitive information.
 *
 * These logs should always be visible, without requiring the user to enable
 * verbose logging (like setting a `DEBUG` environment variable), as they are
 * important for debugging snaps.
 *
 * This function makes it easy to swap out the logging implementation in all
 * files at once.
 *
 * @param message - The message to log.
 * @param optionalParams - Additional parameters to pass to the logging.
 */
export function logWarning(
  message: string,
  ...optionalParams: unknown[]
): void {
  // eslint-disable-next-line no-console
  console.warn(message, ...optionalParams);
}
