/* eslint-disable consistent-return */
/* eslint-disable default-case */
import {
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
} from 'json-rpc-engine';
import {
  assertIsConnectArguments,
  assertIsRequestArguments,
  ChainId,
  ConnectArguments,
  RequestArguments,
  Session,
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
  onRequest: (
    origin: string,
    data: { chainId: ChainId; request: RequestArguments },
  ) => Promise<unknown>;
}): JsonRpcMiddleware<JsonRpcRequest<unknown>, any> {
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
        assertIsRequestArguments(req.params);
        res.result = await onRequest(origin, unwrapped.params);
        return;
      }

      case 'metamask_handshake': {
        assertIsConnectArguments(req.params);
        res.result = await onConnect(origin, unwrapped.params);
        return;
      }
    }
    return next();
  });
}
