import { JsonRpcError as RpcError } from '@metamask/rpc-errors';
import type { DataWithOptionalCause } from '@metamask/rpc-errors';
import type { SerializedSnapError, SnapError } from '@metamask/snaps-sdk';
import type { Json, JsonRpcError } from '@metamask/utils';
export declare const SNAP_ERROR_WRAPPER_CODE = -31001;
export declare const SNAP_ERROR_WRAPPER_MESSAGE = "Wrapped Snap Error";
export declare type SerializedSnapErrorWrapper = {
    code: typeof SNAP_ERROR_WRAPPER_CODE;
    message: typeof SNAP_ERROR_WRAPPER_MESSAGE;
    data: {
        cause: Json;
    };
};
export declare class WrappedSnapError extends Error {
    #private;
    /**
     * Create a new `WrappedSnapError`.
     *
     * @param error - The error to create the `WrappedSnapError` from.
     */
    constructor(error: unknown);
    /**
     * The error name.
     *
     * @returns The error name.
     */
    get name(): string;
    /**
     * The error message.
     *
     * @returns The error message.
     */
    get message(): string;
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
    toJSON(): SerializedSnapErrorWrapper;
    /**
     * Serialize the error to a JSON object. This is called by
     * `@metamask/rpc-errors` when serializing the error.
     *
     * @returns The JSON object.
     */
    serialize(): SerializedSnapErrorWrapper;
}
/**
 * Check if an object is a `SnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `SnapError`.
 */
export declare function isSnapError(error: unknown): error is SnapError;
/**
 * Check if a JSON-RPC error is a `SnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `SnapError`.
 */
export declare function isSerializedSnapError(error: JsonRpcError): error is SerializedSnapError;
/**
 * Check if a JSON-RPC error is a `WrappedSnapError`.
 *
 * @param error - The object to check.
 * @returns Whether the object is a `WrappedSnapError`.
 */
export declare function isWrappedSnapError(error: unknown): error is SerializedSnapErrorWrapper;
/**
 * Attempt to unwrap an unknown error to a `JsonRpcError`. This function will
 * try to get the error code, message, and data from the error, and return a
 * `JsonRpcError` with those properties.
 *
 * @param error - The error to unwrap.
 * @returns A tuple containing the unwrapped error and a boolean indicating
 * whether the error was handled.
 */
export declare function unwrapError(error: unknown): [error: RpcError<DataWithOptionalCause>, isHandled: boolean];
