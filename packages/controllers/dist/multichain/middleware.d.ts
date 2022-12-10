import { JsonRpcMiddleware, JsonRpcRequest } from 'json-rpc-engine';
import { ConnectArguments, Session, MultiChainRequest } from '@metamask/snap-utils';
/**
 * Creates a middleware that handles requests to the multichain controller.
 *
 * @param hooks - The hooks required by the middleware.
 * @param hooks.onConnect - The onConnect hook.
 * @param hooks.onRequest - The onRequest hook.
 * @returns The middleware.
 */
export declare function createMultiChainMiddleware({ onConnect, onRequest, }: {
    onConnect: (origin: string, requestedNamespaces: ConnectArguments) => Promise<Session>;
    onRequest: (origin: string, data: MultiChainRequest) => Promise<unknown>;
}): JsonRpcMiddleware<Omit<JsonRpcRequest<unknown>, 'id' | 'jsonrpc'>, any>;
