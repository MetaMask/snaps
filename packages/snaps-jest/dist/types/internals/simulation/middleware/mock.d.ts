import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';
import type { Store } from '../store';
/**
 * Create a middleware for handling JSON-RPC methods that have been mocked.
 *
 * @param store - The Redux store to use.
 * @returns A middleware function.
 */
export declare function createMockMiddleware(store: Store): JsonRpcMiddleware<JsonRpcParams, Json>;
