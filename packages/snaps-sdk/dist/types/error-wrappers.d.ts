/// <reference types="node" />
/**
 * A JSON-RPC 2.0 Internal (-32603) error.
 *
 * This can be thrown by a Snap to indicate that an internal error occurred,
 * without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export declare const InternalError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Invalid Input (-32000) error.
 *
 * This can be thrown by a Snap to indicate that the input to a method is
 * invalid, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const InvalidInputError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * A JSON-RPC 2.0 Invalid Params (-32602) error.
 *
 * This can be thrown by a Snap to indicate that the parameters to a method are
 * invalid, without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export declare const InvalidParamsError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * A JSON-RPC 2.0 Invalid Request (-32600) error.
 *
 * This can be thrown by a Snap to indicate that the request is invalid, without
 * crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export declare const InvalidRequestError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Limit Exceeded (-32005) error.
 *
 * This can be thrown by a Snap to indicate that a limit has been exceeded,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const LimitExceededError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Method Not Found (-32601) error.
 *
 * This can be thrown by a Snap to indicate that a method does not exist,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const MethodNotFoundError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Method Not Supported (-32004) error.
 *
 * This can be thrown by a Snap to indicate that a method is not supported,
 * without crashing the Snap.
 */
export declare const MethodNotSupportedError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * A JSON-RPC 2.0 Parse (-32700) error.
 *
 * This can be thrown by a Snap to indicate that a request is not valid JSON,
 * without crashing the Snap.
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export declare const ParseError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Resource Not Found (-32001) error.
 *
 * This can be thrown by a Snap to indicate that a resource does not exist,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const ResourceNotFoundError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Resource Unavailable (-32002) error.
 *
 * This can be thrown by a Snap to indicate that a resource is unavailable,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const ResourceUnavailableError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum JSON-RPC Transaction Rejected (-32003) error.
 *
 * This can be thrown by a Snap to indicate that a transaction was rejected,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1474#error-codes
 */
export declare const TransactionRejected: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum Provider Chain Disconnected (4901) error.
 *
 * This can be thrown by a Snap to indicate that the provider is disconnected
 * from the requested chain, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export declare const ChainDisconnectedError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum Provider Disconnected (4900) error.
 *
 * This can be thrown by a Snap to indicate that the provider is disconnected,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export declare const DisconnectedError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum Provider Unauthorized (4100) error.
 *
 * This can be thrown by a Snap to indicate that the requested method / account
 * is not authorized by the user, without crashing the Snap.
 */
export declare const UnauthorizedError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum Provider Unsupported Method (4200) error.
 *
 * This can be thrown by a Snap to indicate that the requested method is not
 * supported by the provider, without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export declare const UnsupportedMethodError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
/**
 * An Ethereum Provider User Rejected Request (4001) error.
 *
 * This can be thrown by a Snap to indicate that the user rejected the request,
 * without crashing the Snap.
 *
 * @see https://eips.ethereum.org/EIPS/eip-1193#provider-errors
 */
export declare const UserRejectedRequestError: {
    new (message?: string | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    new (message?: string | Record<string, import("@metamask/utils").Json> | undefined, data?: Record<string, import("@metamask/utils").Json> | undefined): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, import("@metamask/utils").Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, import("@metamask/utils").Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("./errors").SerializedSnapError;
        serialize(): import("./errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
