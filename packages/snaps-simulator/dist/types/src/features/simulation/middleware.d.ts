import type { JsonRpcEngineEndCallback, JsonRpcEngineNextCallback, JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams, JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
export declare const methodHandlers: {
    metamask_getProviderState: typeof getProviderStateHandler;
    eth_requestAccounts: typeof getAccountsHandler;
    eth_accounts: typeof getAccountsHandler;
};
export declare type MiscMiddlewareHooks = {
    getMnemonic: () => Promise<Uint8Array>;
};
/**
 * A mock handler for account related methods that always returns the first address for the selected SRP.
 *
 * @param _request - Incoming JSON-RPC request, ignored for this specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the result.
 * @param _next - The json-rpc-engine middleware next handler.
 * @param end - The json-rpc-engine middleware end handler.
 * @param hooks - Any hooks required by this handler.
 */
declare function getAccountsHandler(_request: JsonRpcRequest, response: PendingJsonRpcResponse<Json>, _next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback, hooks: MiscMiddlewareHooks): Promise<void>;
/**
 * A mock handler for metamask_getProviderState that always returns a specific hardcoded result.
 *
 * @param _request - Incoming JSON-RPC request, ignored for this specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the result.
 * @param _next - The json-rpc-engine middleware next handler.
 * @param end - The json-rpc-engine middleware end handler.
 */
declare function getProviderStateHandler(_request: JsonRpcRequest, response: PendingJsonRpcResponse<Json>, _next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback): Promise<void>;
/**
 * Creates a middleware for handling misc RPC methods normally handled internally by the MM client.
 *
 * NOTE: This middleware provides all `hooks` to all handlers and should therefore NOT be used outside of the simulator.
 *
 * @param hooks - Any hooks used by the middleware handlers.
 * @returns Nothing.
 */
export declare function createMiscMethodMiddleware(hooks: MiscMiddlewareHooks): JsonRpcMiddleware<JsonRpcParams, Json>;
export {};
