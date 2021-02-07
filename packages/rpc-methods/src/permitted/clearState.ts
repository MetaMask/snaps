import { PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { PermittedHandlerExport } from '../../types';

const clearStateExport: PermittedHandlerExport<void, null, ClearStateHooks> = {
  methodNames: ['snap_clearState'],
  implementation: clearStateHandler,
  description: 'Clear the state of the snap.',
};
export default clearStateExport;

export interface ClearStateHooks {

  /**
   * A bound function that clears the state of a particular snap.
   */
  clearSnapState: () => void;
}

async function clearStateHandler(
  _req: unknown,
  res: PendingJsonRpcResponse<null>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { clearSnapState }: ClearStateHooks,
): Promise<void> {
  try {
    await clearSnapState();
    res.result = null;
    return end();
  } catch (error) {
    return end(error);
  }
}
