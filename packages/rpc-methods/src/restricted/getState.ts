import { PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { RestrictedHandlerExport } from '../../types';

export const getStateHandler: RestrictedHandlerExport<GetStateHooks, void, Record<string, unknown>> = {
  methodNames: ['snap_getState'],
  getImplementation: getGetStateHandler,
  methodDescription: 'Get the state of the snap.',
  permissionDescription: 'Get the state of the snap.',
  hookNames: {
    getSnapState: true,
  },
};

export interface GetStateHooks {

  /**
   * A bound function gets the state of a particular snap.
   * @returns The current state of the snap.
   */
  getSnapState: () => Promise<Record<string, unknown>>;
}

function getGetStateHandler({ getSnapState }: GetStateHooks) {
  return async function getState(
    _req: unknown,
    res: PendingJsonRpcResponse<Record<string, unknown>>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
  ): Promise<void> {
    try {
      res.result = await getSnapState();
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
