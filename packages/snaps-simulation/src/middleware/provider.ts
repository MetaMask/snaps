import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { createAsyncMiddleware } from '@metamask/json-rpc-engine';
import type { Json, JsonRpcParams } from '@metamask/utils';
import { hexToBigInt } from '@metamask/utils';
import { InfuraProvider } from 'ethers';

import type { Store, getChainId } from '../store';

/**
 * Create a middleware that uses a JSON-RPC provider to respond to RPC requests.
 *
 * @param store - The Redux store.
 * @returns A middleware that responds to JSON-RPC requests.
 */
export function createProviderMiddleware(
  store: Store,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(async (request, response) => {
    const chainId = getChainId(store.getState());
    const provider = new InfuraProvider(hexToBigInt(chainId));

    const result = await provider.send(request.method, request.params ?? []);
    response.result = result;
  });
}
