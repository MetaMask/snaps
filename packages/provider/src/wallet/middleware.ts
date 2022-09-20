import {
  createAsyncMiddleware,
  JsonRpcMiddleware,
  JsonRpcRequest,
} from 'json-rpc-engine';
import {
  ChainId,
  ConnectArguments,
  RequestArguments,
  Session,
} from '../client';
import { assertIsConnectArguments, assertIsRequest } from '../shared/validate';

export function createMultiChainMiddleware({
  getOrigin,
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
  getOrigin(req: JsonRpcRequest<unknown>): string;
}): JsonRpcMiddleware<any, any> {
  return createAsyncMiddleware(async function middleware(req, res, next) {
    const origin = getOrigin(req);
    switch (req.method) {
      case 'caip_request':
        assertIsRequest(req.params);
        res.result = await onRequest(origin, req.params);
        return;
      case 'metamask_handshake':
        assertIsConnectArguments(req.params);
        res.result = await onConnect(origin, req.params);
        return;
    }
    return next();
  });
}
