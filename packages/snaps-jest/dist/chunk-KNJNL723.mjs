import {
  createInternalMethodsMiddleware
} from "./chunk-Q2OQXAUM.mjs";
import {
  createMockMiddleware
} from "./chunk-FP4H3ADT.mjs";
import {
  DEFAULT_JSON_RPC_ENDPOINT
} from "./chunk-6KXCBUNZ.mjs";

// src/internals/simulation/middleware/engine.ts
import { createFetchMiddleware } from "@metamask/eth-json-rpc-middleware";
import { JsonRpcEngine } from "@metamask/json-rpc-engine";
import { createSnapsMethodMiddleware } from "@metamask/snaps-rpc-methods";
function createJsonRpcEngine({
  store,
  hooks,
  permissionMiddleware,
  endpoint = DEFAULT_JSON_RPC_ENDPOINT
}) {
  const engine = new JsonRpcEngine();
  engine.push(createMockMiddleware(store));
  engine.push(createInternalMethodsMiddleware(hooks));
  engine.push(createSnapsMethodMiddleware(true, hooks));
  engine.push(permissionMiddleware);
  engine.push(
    createFetchMiddleware({
      btoa: globalThis.btoa,
      fetch: globalThis.fetch,
      rpcUrl: endpoint
    })
  );
  return engine;
}

export {
  createJsonRpcEngine
};
//# sourceMappingURL=chunk-KNJNL723.mjs.map