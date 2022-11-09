import {
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
} from 'json-rpc-engine';
import { assert } from '@metamask/utils';
import {
  assertIsConnectArguments,
  assertIsMultiChainRequest,
  ConnectArguments,
  Session,
  MultiChainRequest,
} from '@metamask/snap-utils';

/**
 * Creates a middleware that handles requests to the multichain controller.
 *
 * @param hooks - The hooks required by the middleware.
 * @param hooks.onConnect - The onConnect hook.
 * @param hooks.onRequest - The onRequest hook.
 * @returns The middleware.
 */
export function createMultiChainMiddleware({
  onConnect,
  onRequest,
}: {
  onConnect: (
    origin: string,
    requestedNamespaces: ConnectArguments,
  ) => Promise<Session>;
  onRequest: (origin: string, data: MultiChainRequest) => Promise<unknown>;
}): JsonRpcMiddleware<Omit<JsonRpcRequest<unknown>, 'id' | 'jsonrpc'>, any> {
  return createAsyncMiddleware(async function middleware(req, res, next) {
    // This is added by other middleware
    const { origin, params: unwrapped } = req as JsonRpcRequest<
      JsonRpcRequest<unknown>
    > & { origin: string };
    if (req.method !== 'wallet_multiChainRequestHack') {
      await next();
      return;
    }

    assert(unwrapped !== undefined, `Invalid params for ${req.method}`);

    switch (unwrapped.method) {
      case 'caip_request': {
        assertIsMultiChainRequest(unwrapped.params);
        res.result = await onRequest(origin, unwrapped.params);
        return;
      }

      case 'metamask_handshake': {
        assertIsConnectArguments(unwrapped.params);
        res.result = await onConnect(origin, unwrapped.params);
        return;
      }

      default: {
        await next();
      }
    }
  });
}
