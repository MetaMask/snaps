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
}

export async function invokeMethod<ReturnType>(
  scope: CaipChainId,
  request: Omit<JsonRpcRequest, 'id' | 'jsonrpc'>,
): Promise<ReturnType> {
  // TODO: Fix snap.request types
  return (await (snap as any).request({
    method: 'wallet_invokeMethod',
    params: {
      scope,
      request,
    },
  })) as ReturnType;
}
