import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';
import { RestrictedHandlerExport } from '../../types';

const confirmExport: RestrictedHandlerExport<[string], boolean, ConfirmHooks> = {
  methodNames: ['snap_confirm'],
  implementationGetter: confirmHandlerGetter,
  description: 'Display a confirmation to the user.',
};
export default confirmExport;

export interface ConfirmHooks {

  /**
   *
   * @param prompt - The prompt to display to the user.
   * @returns Whether the user accepted or rejected the confirmation.
   */
  showConfirmation: (prompt: string) => Promise<boolean>;
}

function confirmHandlerGetter({ showConfirmation }: ConfirmHooks) {
  return async function confirmHandler(
    req: JsonRpcRequest<[string]>,
    res: PendingJsonRpcResponse<boolean>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    engine: AnnotatedJsonRpcEngine,
  ): Promise<void> {
    const [prompt] = req?.params || [];

    if (!prompt || typeof prompt !== 'string') {
      return end(ethErrors.rpc.invalidParams({
        message: 'Must specify a non-empty string prompt.',
      }));
    }

    try {
      res.result = await showConfirmation(
        `MetaMask Confirmation\n${engine.domain} asks:\n${prompt}`,
      );
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
