import { PendingJsonRpcResponse, JsonRpcEngineEndCallback } from 'json-rpc-engine';
import { PermittedHandlerExport } from '../../types';

const getStateExport: PermittedHandlerExport<GetStateHooks, void, Record<string, unknown>> = {
  methodNames: ['snap_getState'],
  implementation: getStateHandler,
  methodDescription: 'Get the state of the snap.',
  hookNames: {
    getSnapState: true,
  },
};
export default getStateExport;

export interface GetStateHooks {

  /**
   * A bound function gets the state of a particular snap.
   * @returns The current state of the snap.
   */
  getSnapState: () => Promise<Record<string, unknown>>;
}

async function getStateHandler(
  _req: unknown,
  res: PendingJsonRpcResponse<Record<string, unknown>>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getSnapState }: GetStateHooks,
): Promise<void> {
  try {
    res.result = await getSnapState();
    return end();
  } catch (error) {
    return end(error);
  }
}
