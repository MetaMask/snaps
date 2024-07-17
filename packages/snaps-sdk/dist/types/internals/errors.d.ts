export declare const SNAP_ERROR_CODE = -31002;
export declare const SNAP_ERROR_MESSAGE = "Snap Error";
/**
 * Get the error message from an unknown error type.
 *
 * - If the error is an object with a `message` property, return the message.
 * - Otherwise, return the error converted to a string.
 *
 * @param error - The error to get the message from.
 * @returns The error message.
 * @internal
 */
export declare function getErrorMessage(error: unknown): string;
/**
 * Get the error stack from an unknown error type.
 *
 * @param error - The error to get the stack from.
 * @returns The error stack, or undefined if the error does not have a valid
 * stack.
 * @internal
 */
export declare function getErrorStack(error: unknown): string | undefined;
/**
 * Get the error code from an unknown error type.
 *
 * @param error - The error to get the code from.
 * @returns The error code, or `-32603` if the error does not have a valid code.
 * @internal
 */
export declare function getErrorCode(error: unknown): number;
/**
 * Get the error data from an unknown error type.
 *
 * @param error - The error to get the data from.
 * @returns The error data, or an empty object if the error does not have valid
 * data.
 * @internal
 */
export declare function getErrorData(error: unknown): {
    [prop: string]: import("@metamask/utils").Json;
};
