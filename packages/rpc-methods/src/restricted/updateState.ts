import { JsonRpcEngineEndCallback, JsonRpcRequest, PendingJsonRpcResponse } from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';
import { RestrictedHandlerExport } from '../../types';

export const updateStateHandler: RestrictedHandlerExport<UpdateStateHooks, [Record<string, unknown>], null> = {
  methodNames: ['snap_updateState'],
  getImplementation: getUpdateStateHandler,
  methodDescription: 'Update the state of the snap.',
  permissionDescription: 'Update the state of the snap.',
  hookNames: {
    updateSnapState: true,
  },
};

export interface UpdateStateHooks {

  /**
   * A bound function that updates the state of a particular snap.
   * @param fromDomain - The string identifying the fromDomain.
   * @param newState - The new state of the snap.
   */
  updateSnapState: (fromDomain: string, newState: Record<string, unknown>) => Promise<void>;
}

function getUpdateStateHandler({ updateSnapState }: UpdateStateHooks) {
  return async function updateState(
    req: JsonRpcRequest<[Record<string, unknown>]>,
    res: PendingJsonRpcResponse<null>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    engine: AnnotatedJsonRpcEngine,
  ): Promise<void> {
    const [newState] = req?.params || [];

    if (!newState || typeof newState !== 'object' || Array.isArray(newState)) {
      return end(ethErrors.rpc.invalidParams({
        message: 'Must specify single object specifying the new state.',
      }));
    }

    try {
      await updateSnapState(engine.domain as string, newState);
      res.result = null;
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
