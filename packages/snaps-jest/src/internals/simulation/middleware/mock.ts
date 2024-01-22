import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';

import type { Store } from '../store';
import { getJsonRpcMock } from '../store/mocks';

/**
 * Create a middleware for handling JSON-RPC methods that have been mocked.
 *
 * @param store - The Redux store to use.
 * @returns A middleware function.
 */
export function createMockMiddleware(
  store: Store,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return function mockMiddleware(request, response, next, end) {
    const result = getJsonRpcMock(store.getState(), request.method);
    if (result) {
      response.result = result;
      return end();
    }

    return next();
  };
}
