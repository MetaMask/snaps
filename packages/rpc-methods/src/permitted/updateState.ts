import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { PermittedHandlerExport } from '../../types';

export const updateStateHandler: PermittedHandlerExport<UpdateStateHooks, [Record<string, unknown>], null> = {
  methodNames: ['snap_updateState'],
  implementation: updateState,
  methodDescription: 'Update the state of the snap.',
  hookNames: {
    updateSnapState: true,
  },
};

export interface UpdateStateHooks {

  /**
   * A bound function that updates the state of a particular snap.
   * @param newState - The new state of the snap.
   */
  updateSnapState: (newState: Record<string, unknown>) => Promise<void>;
}

async function updateState(
  req: JsonRpcRequest<[Record<string, unknown>]>,
  res: PendingJsonRpcResponse<null>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { updateSnapState }: UpdateStateHooks,
): Promise<void> {
  const [newState] = req?.params || [];

  if (!newState || typeof newState !== 'object' || Array.isArray(newState)) {
    return end(ethErrors.rpc.invalidParams({
      message: 'Must specify single object specifying the new state.',
    }));
  }

  try {
    await updateSnapState(newState);
    res.result = null;
    return end();
  } catch (error) {
    return end(error);
  }
}
