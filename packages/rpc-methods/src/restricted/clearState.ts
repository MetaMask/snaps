import { PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { RestrictedHandlerExport } from '../../types';

export const clearStateHandler: RestrictedHandlerExport<ClearStateHooks, void, null> = {
  methodNames: ['snap_clearState'],
  getImplementation: getClearStateHandler,
  methodDescription: 'Clear the state of the snap.',
  permissionDescription: 'Clear the state of the snap.',
  hookNames: {
    clearSnapState: true,
  },
};

export interface ClearStateHooks {

  /**
   * A bound function that clears the state of a particular snap.
   */
  clearSnapState: () => void;
}

function getClearStateHandler({ clearSnapState }: ClearStateHooks) {
  return async function clearState(
    _req: unknown,
    res: PendingJsonRpcResponse<null>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
  ): Promise<void> {
    try {
      await clearSnapState();
      res.result = null;
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
