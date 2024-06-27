import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';
/**
 * Creates a middleware that handles permitted snap RPC methods.
 *
 * @param isSnap - A flag that should indicate whether the requesting origin is a snap or not.
 * @param hooks - An object containing the hooks made available to the permitted RPC methods.
 * @returns The middleware.
 */
export declare function createSnapsMethodMiddleware(isSnap: boolean, hooks: Record<string, unknown>): JsonRpcMiddleware<JsonRpcParams, Json>;
