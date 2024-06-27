import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { RestrictedMethodParameters } from '@metamask/permission-controller';
import type { Json } from '@metamask/utils';
import type { MiddlewareHooks } from '../simulation';
import type { Store } from '../store';
export declare type CreateJsonRpcEngineOptions = {
    store: Store;
    hooks: MiddlewareHooks;
    permissionMiddleware: JsonRpcMiddleware<RestrictedMethodParameters, Json>;
    endpoint?: string;
};
/**
 * Create a JSON-RPC engine for use in a simulated environment. This engine
 * should be used to handle all JSON-RPC requests. It is set up to handle
 * requests that would normally be handled internally by the MetaMask client, as
 * well as Snap-specific requests.
 *
 * @param options - The options to use when creating the engine.
 * @param options.store - The Redux store to use.
 * @param options.hooks - Any hooks used by the middleware handlers.
 * @param options.permissionMiddleware - The permission middleware to use.
 * @param options.endpoint - The JSON-RPC endpoint to use for Ethereum requests.
 * @returns A JSON-RPC engine.
 */
export declare function createJsonRpcEngine({ store, hooks, permissionMiddleware, endpoint, }: CreateJsonRpcEngineOptions): JsonRpcEngine;
