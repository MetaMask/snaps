import {
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
} from 'json-rpc-engine';
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
    if (req.method !== 'wallet_multiChainRequestHack' || !unwrapped) {
      return next();
    }

    switch (unwrapped.method) {
      case 'caip_request': {
        assertIsMultiChainRequest(unwrapped.params);
        res.result = await onRequest(origin, unwrapped.params);
        // eslint-disable-next-line consistent-return
        return;
      }

      case 'metamask_handshake': {
        assertIsConnectArguments(unwrapped.params);
        res.result = await onConnect(origin, unwrapped.params);
        // eslint-disable-next-line consistent-return
        return;
      }

      default:
        return next();
    }
  });
}
