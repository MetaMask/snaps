import type { Json, JsonRpcError } from '@metamask/utils';
import { SNAP_ERROR_CODE, SNAP_ERROR_MESSAGE } from './internals';
/**
 * A generic error which can be thrown by a Snap, without it causing the Snap to
 * crash.
 */
export declare class SnapError extends Error {
    #private;
    /**
     * Create a new `SnapError`.
     *
     * @param error - The error to create the `SnapError` from. If this is a
     * `string`, it will be used as the error message. If this is an `Error`, its
     * `message` property will be used as the error message. If this is a
     * `JsonRpcError`, its `message` property will be used as the error message
     * and its `code` property will be used as the error code. Otherwise, the
     * error will be converted to a string and used as the error message.
     * @param data - Additional data to include in the error. This will be merged
     * with the error data, if any.
     */
    constructor(error: string | Error | JsonRpcError, data?: Record<string, Json>);
    /**
     * The error name.
     *
     * @returns The error name.
     */
    get name(): string;
    /**
     * The error code.
     *
     * @returns The error code.
     */
    get code(): number;
    /**
     * The error message.
     *
     * @returns The error message.
     */
    get message(): string;
    /**
     * Additional data for the error.
     *
     * @returns Additional data for the error.
     */
    get data(): Record<string, Json> | undefined;
    /**
     * The error stack.
     *
     * @returns The error stack.
     */
    get stack(): string | undefined;
    /**
     * Convert the error to a JSON object.
     *
     * @returns The JSON object.
     */
    toJSON(): SerializedSnapError;
    /**
     * Serialize the error to a JSON object. This is called by
     * `@metamask/rpc-errors` when serializing the error.
     *
     * @returns The JSON object.
     */
    serialize(): SerializedSnapError;
}
/**
 * A serialized {@link SnapError}. It's JSON-serializable, so it can be sent
 * over the RPC. The original error is wrapped in the `cause` property.
 *
 * @property code - The error code. This is always `-31002`.
 * @property message - The error message. This is always `'Snap Error'`.
 * @property data - The error data.
 * @property data.cause - The cause of the error.
 * @property data.cause.code - The error code.
 * @property data.cause.message - The error message.
 * @property data.cause.stack - The error stack.
 * @property data.cause.data - Additional data for the error.
 * @see SnapError
 */
export declare type SerializedSnapError = {
    code: typeof SNAP_ERROR_CODE;
    message: typeof SNAP_ERROR_MESSAGE;
    data: {
        cause: JsonRpcError;
    };
};
