import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

/**
 * Create a legacy JSON-RPC middleware that sets the `origin` property on the
 * request object.
 *
 * @param origin - The origin to set on the request.
 * @returns The middleware.
 */
export function createOriginMiddleware(origin: string) {
  return (
    request: JsonRpcRequest,
    _response: PendingJsonRpcResponse,
    next: () => void,
    _end: unknown,
  ) => {
    (request as unknown as JsonRpcRequest & { origin: string }).origin = origin;
    next();
  };
}
