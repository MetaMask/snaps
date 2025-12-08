import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import { Caveat } from '@metamask/permission-controller';
import type { Json, JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

export type GetSessionHandlerHooks = {
  getCaveat: (permission: string, caveatType: string) => Caveat<string, Json>;
};

export async function getSessionHandler(
  _request: JsonRpcRequest,
  response: PendingJsonRpcResponse,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  hooks: GetSessionHandlerHooks,
) {

  response.result = hooks.getCaveat('endowment:caip25', "authorizedScopes");
  return end();
}
