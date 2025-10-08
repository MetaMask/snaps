import {
  createAsyncMiddleware,
  type JsonRpcMiddleware,
} from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';

import type { Store } from '../store';
import { getJsonRpcMocks } from '../store/mocks';

/**
 * Create a middleware for handling JSON-RPC methods that have been mocked.
 *
 * @param store - The Redux store to use.
 * @returns A middleware function.
 */
export function createMockMiddleware(
  store: Store,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(async (request, response, next) => {
    const mocks = Object.values(getJsonRpcMocks(store.getState()));
    for (const mock of mocks) {
      const result = await mock(request);
      if (result) {
        response.result = result;
        return;
      }
    }

    await next();
  });
}
