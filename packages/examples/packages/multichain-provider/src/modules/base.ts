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

  /**
   * Sign a message using a module.
   *
   * @param account - The CAIP-10 account ID.
   * @param message - The message to sign.
   * @returns The signature as defined by the module.
   */
  abstract signMessage(
    account: CaipAccountId,
    message: string,
  ): Promise<string>;

  /**
   * Sign a struct using a module.
   *
   * @param account - The CAIP-10 account ID.
   * @param message - The message to sign.
   * @returns The signature as defined by the module.
   */
  abstract signTypedData(
    account: CaipAccountId,
    message: string,
  ): Promise<string>;

  /**
   * Get the genesis hash of the selected scope.
   *
   * @returns The genesis hash as defined by the module.
   */
  abstract getGenesisHash(): Promise<string>;
}
