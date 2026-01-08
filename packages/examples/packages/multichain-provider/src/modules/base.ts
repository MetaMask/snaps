import type {
  CaipAccountId,
  CaipChainId,
  JsonRpcRequest,
} from '@metamask/utils';

export abstract class Module {
  scope: CaipChainId;

  constructor(scope: CaipChainId) {
    this.scope = scope;
  }

  abstract signMessage(
    account: CaipAccountId,
    message: string,
  ): Promise<string>;

  abstract signTypedData(
    account: CaipAccountId,
    message: string,
  ): Promise<string>;

  abstract getGenesisHash(): Promise<string>;
}

/**
 * Invoke a RPC method for a given scope.
 *
 * @param scope - The CAIP-2 scope.
 * @param request - The JSON-RPC request.
 * @returns The JSON-RPC response.
 */
export async function invokeMethod<ReturnType>(
  scope: CaipChainId,
  request: Omit<JsonRpcRequest, 'id' | 'jsonrpc'>,
): Promise<ReturnType> {
  return (await snap.request({
    method: 'wallet_invokeMethod',
    params: {
      scope,
      request,
    },
  })) as ReturnType;
}
