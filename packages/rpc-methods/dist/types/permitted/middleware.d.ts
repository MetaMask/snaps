import type { JsonRpcMiddleware } from 'json-rpc-engine';
/**
 * Creates a middleware that handles permitted snap RPC methods.
 *
 * @param isSnap - A flag that should indicate whether the requesting origin is a snap or not.
 * @param hooks - An object containing the hooks made available to the permitted RPC methods.
 * @returns The middleware.
 */
export declare function createSnapsMethodMiddleware(isSnap: boolean, hooks: Record<string, unknown>): JsonRpcMiddleware<unknown, unknown>;
