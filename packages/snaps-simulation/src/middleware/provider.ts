import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { createAsyncMiddleware } from '@metamask/json-rpc-engine';
import { rpcErrors, serializeCause } from '@metamask/rpc-errors';
import type { Json, JsonRpcParams } from '@metamask/utils';
import { hasProperty, hexToBigInt, parseCaipChainId } from '@metamask/utils';
import { InfuraProvider } from 'ethers';

import type { ScopedJsonRpcRequest } from './multichain';
import type { Store } from '../store';
import { getChainId } from '../store';

/**
 * Create a middleware that uses a JSON-RPC provider to respond to RPC requests.
 *
 * @param store - The Redux store.
 * @returns A middleware that responds to JSON-RPC requests.
 */
export function createProviderMiddleware(
  store: Store,
): JsonRpcMiddleware<JsonRpcParams, Json> {
  return createAsyncMiddleware(
    async (request: ScopedJsonRpcRequest, response, next) => {
      const requestScope = request.scope && parseCaipChainId(request.scope);
      const isEvm = requestScope ? requestScope.namespace === 'eip155' : true;

      if (!isEvm) {
        await next();
        /* istanbul ignore next */
        return;
      }

      const chainId = requestScope
        ? BigInt(requestScope.reference)
        : hexToBigInt(getChainId(store.getState()));

      try {
        const provider = new InfuraProvider(chainId);

        const result = await provider.send(
          request.method,
          request.params ?? [],
        );
        response.result = result;
      } catch (error) {
        if (hasProperty(error, 'info') && hasProperty(error.info, 'error')) {
          response.error = error.info.error;
          return;
        }
        if (hasProperty(error, 'error')) {
          response.error = error.error;
          return;
        }
        response.error = rpcErrors.internal({
          data: { cause: serializeCause(error) },
        });
      }
    },
  );
}
