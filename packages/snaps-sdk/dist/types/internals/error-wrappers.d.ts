/// <reference types="node" />
import type { rpcErrors } from '@metamask/rpc-errors';
import type { Json } from '@metamask/utils';
export declare type JsonRpcErrorFunction = typeof rpcErrors.parse;
/**
 * Create a `SnapError` class from an error function from
 * `@metamask/rpc-errors`. This is useful for creating custom error classes
 * which can be thrown by a Snap.
 *
 * The created class will inherit the message, code, and data properties from
 * the error function.
 *
 * @param fn - The error function to create the class from.
 * @returns The created `SnapError` class.
 */
export declare function createSnapError(fn: JsonRpcErrorFunction): {
    new (message?: string): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("../errors").SerializedSnapError;
        serialize(): import("../errors").SerializedSnapError;
    };
    new (data?: Record<string, Json>): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("../errors").SerializedSnapError;
        serialize(): import("../errors").SerializedSnapError;
    };
    new (message?: string | Record<string, Json>, data?: Record<string, Json>): {
        readonly "__#3@#code": number;
        readonly "__#3@#message": string;
        readonly "__#3@#data"?: Record<string, Json> | undefined;
        readonly "__#3@#stack"?: string | undefined;
        readonly name: string;
        readonly code: number;
        readonly message: string;
        readonly data: Record<string, Json> | undefined;
        readonly stack: string | undefined;
        toJSON(): import("../errors").SerializedSnapError;
        serialize(): import("../errors").SerializedSnapError;
    };
    captureStackTrace(targetObject: object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
