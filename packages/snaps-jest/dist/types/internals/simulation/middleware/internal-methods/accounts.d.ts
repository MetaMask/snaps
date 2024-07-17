import type { JsonRpcEngineEndCallback, JsonRpcEngineNextCallback } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
export declare type GetAccountsHandlerHooks = {
    getMnemonic: () => Promise<Uint8Array>;
};
/**
 * A mock handler for account related methods that always returns the first
 * address for the selected secret recovery phrase.
 *
 * @param _request - Incoming JSON-RPC request. This is ignored for this
 * specific handler.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 * @param hooks - Any hooks required by this handler.
 */
export declare function getAccountsHandler(_request: JsonRpcRequest, response: PendingJsonRpcResponse<Json>, _next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback, hooks: GetAccountsHandlerHooks): Promise<void>;
