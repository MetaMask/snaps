/**
 * Get the error message from an unknown error type.
 *
 * - If the error is an object with a `message` property, return the message.
 * - Otherwise, return the error converted to a string.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
 */
export declare function getErrorMessage(error: unknown): string;
