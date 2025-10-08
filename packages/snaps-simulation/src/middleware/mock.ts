import {
  createAsyncMiddleware,
  type JsonRpcMiddleware,
} from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';

import type { Store } from '../store';
import { getJsonRpcMocks, removeJsonRpcMock } from '../store/mocks';

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
    const mocks = getJsonRpcMocks(store.getState());
    const keys = Object.keys(mocks);
    for (const key of keys) {
      const { implementation, once } = mocks[key];
      const result = await implementation(request);

      if (result !== undefined && once) {
        store.dispatch(removeJsonRpcMock(key));
      }

      if (result) {
        response.result = result;
        return;
      }
    }

    await next();
  });
}
