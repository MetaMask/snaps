import { SubjectType } from '@metamask/permission-controller';
import type { AssertionErrorConstructor, Json, JsonRpcSuccess } from '@metamask/utils';
import type { Infer } from 'superstruct';
export declare const RpcOriginsStruct: import("superstruct").Struct<{
    dapps?: boolean | undefined;
    snaps?: boolean | undefined;
    allowedOrigins?: string[] | undefined;
}, {
    dapps: import("superstruct").Struct<boolean | undefined, null>;
    snaps: import("superstruct").Struct<boolean | undefined, null>;
    allowedOrigins: import("superstruct").Struct<string[] | undefined, import("superstruct").Struct<string, null>>;
}>;
export declare type RpcOrigins = Infer<typeof RpcOriginsStruct>;
/**
 * Asserts that the given value is a valid {@link RpcOrigins} object.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link RpcOrigins} object.
 */
export declare function assertIsRpcOrigins(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is RpcOrigins;
export declare const KeyringOriginsStruct: import("superstruct").Struct<{
    allowedOrigins?: string[] | undefined;
}, {
    allowedOrigins: import("superstruct").Struct<string[] | undefined, import("superstruct").Struct<string, null>>;
}>;
export declare type KeyringOrigins = Infer<typeof KeyringOriginsStruct>;
/**
 * Assert that the given value is a valid {@link KeyringOrigins} object.
 *
 * @param value - The value to assert.
 * @param ErrorWrapper - An optional error wrapper to use. Defaults to
 * {@link AssertionError}.
 * @throws If the value is not a valid {@link KeyringOrigins} object.
 */
export declare function assertIsKeyringOrigins(value: unknown, ErrorWrapper?: AssertionErrorConstructor): asserts value is KeyringOrigins;
/**
 * Check if the given origin is allowed by the given JSON-RPC origins object.
 *
 * @param origins - The JSON-RPC origins object.
 * @param subjectType - The type of the origin.
 * @param origin - The origin to check.
 * @returns Whether the origin is allowed.
 */
export declare function isOriginAllowed(origins: RpcOrigins, subjectType: SubjectType, origin: string): boolean;
/**
 * Assert that the given value is a successful JSON-RPC response. If the value
 * is not a success response, an error is thrown. If the value is an JSON-RPC
 * error, the error message is included in the thrown error.
 *
 * @param value - The value to check.
 * @throws If the value is not a JSON-RPC success response.
 */
export declare function assertIsJsonRpcSuccess(value: unknown): asserts value is JsonRpcSuccess<Json>;
