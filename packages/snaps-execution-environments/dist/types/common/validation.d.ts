import { HandlerType } from '@metamask/snaps-utils';
import type { Json, JsonRpcSuccess } from '@metamask/utils';
import type { Infer } from 'superstruct';
export declare const JsonRpcRequestWithoutIdStruct: import("superstruct").Struct<{
    method: string;
    jsonrpc: "2.0";
    params?: Record<string, Json> | Json[] | undefined;
    id?: string | number | null | undefined;
}, {
    id: import("superstruct").Struct<string | number | null | undefined, null>;
    params: import("superstruct").Struct<Record<string, Json> | Json[] | undefined, null>;
    method: import("superstruct").Struct<string, null>;
    jsonrpc: import("superstruct").Struct<"2.0", "2.0">;
}>;
export declare type JsonRpcRequestWithoutId = Infer<typeof JsonRpcRequestWithoutIdStruct>;
export declare const EndowmentStruct: import("superstruct").Struct<string, null>;
export declare type Endowment = Infer<typeof EndowmentStruct>;
/**
 * Check if the given value is an endowment.
 *
 * @param value - The value to check.
 * @returns Whether the value is an endowment.
 */
export declare function isEndowment(value: unknown): value is Endowment;
/**
 * Check if the given value is an array of endowments.
 *
 * @param value - The value to check.
 * @returns Whether the value is an array of endowments.
 */
export declare function isEndowmentsArray(value: unknown): value is Endowment[];
export declare const PingRequestArgumentsStruct: import("superstruct").Struct<unknown[] | undefined, null>;
export declare const TerminateRequestArgumentsStruct: import("superstruct").Struct<unknown[] | undefined, null>;
export declare const ExecuteSnapRequestArgumentsStruct: import("superstruct").Struct<[string, string, string[] | undefined], null>;
export declare const SnapRpcRequestArgumentsStruct: import("superstruct").Struct<[string, HandlerType, string, {
    method: string;
    jsonrpc: "2.0";
    params?: Record<string, Json> | undefined;
    id?: string | number | null | undefined;
}], null>;
export declare type PingRequestArguments = Infer<typeof PingRequestArgumentsStruct>;
export declare type TerminateRequestArguments = Infer<typeof TerminateRequestArgumentsStruct>;
export declare type ExecuteSnapRequestArguments = Infer<typeof ExecuteSnapRequestArgumentsStruct>;
export declare type SnapRpcRequestArguments = Infer<typeof SnapRpcRequestArgumentsStruct>;
export declare type RequestArguments = PingRequestArguments | TerminateRequestArguments | ExecuteSnapRequestArguments | SnapRpcRequestArguments;
export declare const OnTransactionRequestArgumentsStruct: import("superstruct").Struct<{
    chainId: string;
    transaction: Record<string, Json>;
    transactionOrigin: string | null;
}, {
    transaction: import("superstruct").Struct<Record<string, Json>, null>;
    chainId: import("superstruct").Struct<string, null>;
    transactionOrigin: import("superstruct").Struct<string | null, null>;
}>;
export declare type OnTransactionRequestArguments = Infer<typeof OnTransactionRequestArgumentsStruct>;
/**
 * Asserts that the given value is a valid {@link OnTransactionRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnTransactionRequestArguments}
 * object.
 */
export declare function assertIsOnTransactionRequestArguments(value: unknown): asserts value is OnTransactionRequestArguments;
declare const baseNameLookupArgs: {
    chainId: import("superstruct").Struct<string, null>;
};
export declare const OnNameLookupRequestArgumentsStruct: import("superstruct").Struct<{
    chainId: string;
    address: string;
} | {
    chainId: string;
    domain: string;
}, null>;
export declare type OnNameLookupRequestArguments = Infer<typeof OnNameLookupRequestArgumentsStruct>;
export declare type PossibleLookupRequestArgs = typeof baseNameLookupArgs & {
    address?: string;
    domain?: string;
};
/**
 * Asserts that the given value is a valid {@link OnNameLookupRequestArguments}
 * object.
 *
 * @param value - The value to validate.
 * @throws If the value is not a valid {@link OnNameLookupRequestArguments}
 * object.
 */
export declare function assertIsOnNameLookupRequestArguments(value: unknown): asserts value is OnNameLookupRequestArguments;
declare const OkResponseStruct: import("superstruct").Struct<{
    id: string | number | null;
    jsonrpc: "2.0";
    result: "OK";
}, {
    result: import("superstruct").Struct<"OK", "OK">;
    id: import("superstruct").Struct<string | number | null, null>;
    jsonrpc: import("superstruct").Struct<"2.0", "2.0">;
}>;
declare const SnapRpcResponse: import("superstruct").Struct<{
    id: string | number | null;
    jsonrpc: "2.0";
    result: Json;
}, {
    id: import("superstruct").Struct<string | number | null, null>;
    jsonrpc: import("superstruct").Struct<"2.0", "2.0">;
    result: import("superstruct").Struct<Json, unknown>;
}>;
export declare type OkResponse = Infer<typeof OkResponseStruct>;
export declare type SnapRpcResponse = Infer<typeof SnapRpcResponse>;
export declare type Response = OkResponse | SnapRpcResponse;
declare type RequestParams<Params extends unknown[] | undefined> = Params extends undefined ? [] : Params;
declare type RequestFunction<Args extends RequestArguments, ResponseType extends JsonRpcSuccess<Json>> = (...args: RequestParams<Args>) => Promise<ResponseType['result']>;
export declare type Ping = RequestFunction<PingRequestArguments, OkResponse>;
export declare type Terminate = RequestFunction<TerminateRequestArguments, OkResponse>;
export declare type ExecuteSnap = RequestFunction<ExecuteSnapRequestArguments, OkResponse>;
export declare type SnapRpc = RequestFunction<SnapRpcRequestArguments, SnapRpcResponse>;
export {};
