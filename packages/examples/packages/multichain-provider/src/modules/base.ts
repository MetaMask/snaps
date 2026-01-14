import type {
  CaipAccountId,
  CaipChainId,
  Json,
  JsonRpcRequest,
} from '@metamask/utils';

/**
 * Abstract base class for scope-specific modules.
 */
export abstract class Module {
  scope: CaipChainId;

  constructor(scope: CaipChainId) {
    this.scope = scope;
  }

  /**
   * Invoke a RPC method for the module scope.
   *
   * @param request - The JSON-RPC request.
   * @returns The JSON-RPC response.
   */
  async invokeMethod<ReturnType extends Json>(
    request: Omit<JsonRpcRequest, 'id' | 'jsonrpc'>,
  ): Promise<ReturnType> {
    return (await snap.request({
      method: 'wallet_invokeMethod',
      params: {
        scope: this.scope,
        request,
      },
    })) as ReturnType;
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
