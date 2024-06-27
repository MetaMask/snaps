import type { JsonRpcEngineEndCallback, JsonRpcEngineNextCallback } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
/**
 * A mock handler for metamask_getProviderState that always returns a specific
 * hardcoded result.
 *
 * @param _request - Incoming JSON-RPC request. Ignored for this specific
 * handler.
 * @param response - The outgoing JSON-RPC response, modified to return the
 * result.
 * @param _next - The `json-rpc-engine` middleware next handler.
 * @param end - The `json-rpc-engine` middleware end handler.
 */
export declare function getProviderStateHandler(_request: JsonRpcRequest, response: PendingJsonRpcResponse<Json>, _next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback): Promise<void>;
