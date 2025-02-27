import { createFetchMiddleware } from '@metamask/eth-json-rpc-middleware';
import type { JsonRpcMiddleware } from '@metamask/json-rpc-engine';
import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { RestrictedMethodParameters } from '@metamask/permission-controller';
import { createSnapsMethodMiddleware } from '@metamask/snaps-rpc-methods';
import type { Json } from '@metamask/utils';

import { createInternalMethodsMiddleware } from './internal-methods';
import { createMockMiddleware } from './mock';
import { DEFAULT_JSON_RPC_ENDPOINT } from '../constants';
import type {
  PermittedMiddlewareHooks,
  RestrictedMiddlewareHooks,
} from '../simulation';
import type { Store } from '../store';

export type CreateJsonRpcEngineOptions = {
  store: Store;
  restrictedHooks: RestrictedMiddlewareHooks;
  permittedHooks: PermittedMiddlewareHooks;
  permissionMiddleware: JsonRpcMiddleware<RestrictedMethodParameters, Json>;
  endpoint?: string;
};

/**
 * Create a JSON-RPC engine for use in a simulated environment. This engine
 * should be used to handle all JSON-RPC requests. It is set up to handle
 * requests that would normally be handled internally by the MetaMask client, as
 * well as Snap-specific requests.
 *
 * @param options - The options to use when creating the engine.
 * @param options.store - The Redux store to use.
 * @param options.restrictedHooks - Any hooks used by the middleware handlers.
 * @param options.permittedHooks - Any hooks used by the middleware handlers.
 * @param options.permissionMiddleware - The permission middleware to use.
 * @param options.endpoint - The JSON-RPC endpoint to use for Ethereum requests.
 * @returns A JSON-RPC engine.
 */
export function createJsonRpcEngine({
  store,
  restrictedHooks,
  permittedHooks,
  permissionMiddleware,
  endpoint = DEFAULT_JSON_RPC_ENDPOINT,
}: CreateJsonRpcEngineOptions) {
  const engine = new JsonRpcEngine();
  engine.push(createMockMiddleware(store));

  // The hooks here do not match the hooks used by the clients, so this
  // middleware should not be used outside of the simulation environment.
  engine.push(createInternalMethodsMiddleware(restrictedHooks));
  engine.push(createSnapsMethodMiddleware(true, permittedHooks));

  engine.push(permissionMiddleware);
  engine.push(
    createFetchMiddleware({
      btoa: globalThis.btoa,
      fetch: globalThis.fetch,
      rpcUrl: endpoint,
    }),
  );

  return engine;
}
