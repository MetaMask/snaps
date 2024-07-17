/**
 * Get the error message from an error in a Yargs `fail` handler. If the error
 * is not `undefined`, {@link getErrorMessage} is used to get the error message.
 * Otherwise, the given message is returned.
 *
 * @param message - The error message.
 * @param error - The error object. This may be `undefined`.
 * @returns The error message.
 */
export declare function getYargsErrorMessage(message: string, error?: unknown): string;
/**
 * Get the error message from an error.
 *
 * - If the error is an object with a `stack` property, the `stack` property is
 * returned.
 * - If the error is an object with a `message` property, the `message`
 * property is returned.
 * - Otherwise, the error is converted to a string and returned.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
 */
export declare function getErrorMessage(error: unknown): string;
