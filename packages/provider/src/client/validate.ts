import { JsonRpcResponse, JsonRpcSuccess } from 'json-rpc-engine';
import {
  AccountID,
  accountIdRe,
  ChainId,
  chainIdRe,
  ConnectArguments,
  NamespaceId,
  namespaceRe,
  RequestArguments,
  RPCError,
} from './Provider';

export function isChainId(obj: unknown): obj is ChainId {
  return typeof obj === 'string' && chainIdRe.test(obj);
}

export function isAccountId(obj: unknown): obj is AccountID {
  return typeof obj === 'string' && accountIdRe.test(obj);
}

export function isNamespace(obj: unknown): obj is NamespaceId {
  return typeof obj === 'string' && namespaceRe.test(obj);
}

export function assertIsConnectArguments(
  obj: any,
): asserts obj is ConnectArguments {
  const shape =
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.requiredNamespaces === 'object' &&
    obj.requiredNamespaces !== null &&
    Object.entries<any>(obj.requiredNamespaces).every(
      ([namespace, value]) =>
        isNamespace(namespace) &&
        typeof value === 'object' &&
        value !== null &&
        'chains' in value &&
        Array.isArray(value.chains) &&
        value.chains.every(isChainId) &&
        (!('methods' in value) ||
          (Array.isArray(value.methods) &&
            value.methods.every(
              (method: unknown) => typeof method === 'string',
            ) &&
            (!('events' in value) ||
              (Array.isArray(value.events) &&
                value.events.every(
                  (event: unknown) => typeof event === 'string',
                ))))),
    );
  if (!shape) {
    throw new TypeError('Invalid connect arguments');
  }
}

export function assertIsRequest(
  obj: any,
): asserts obj is { chainId: ChainId; request: RequestArguments } {
  const shape =
    typeof obj === 'object' &&
    obj !== null &&
    isChainId(obj.chainId) &&
    typeof obj.request === 'object' &&
    obj.request !== null &&
    typeof obj.request.method === 'string' &&
    (obj.request.params === undefined ||
      Array.isArray(obj.request.params) ||
      (typeof obj.request.params === 'object' && obj.request.params !== null));
  if (!shape) {
    throw new TypeError('Invalid request arguments');
  }
}

export function assertNotErrorResp(
  obj: JsonRpcResponse<unknown>,
): asserts obj is JsonRpcSuccess<unknown> {
  if ('error' in obj) {
    throw new RPCError(obj.error.code, obj.error.message);
  }
}
