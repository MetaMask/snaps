import {
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { AnnotatedJsonRpcEngine } from 'rpc-cap';
import { RestrictedHandlerExport } from '../../types';

export const getStateHandler: RestrictedHandlerExport<
  GetStateHooks,
  void,
  Record<string, unknown>
> = {
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
   * @param fromDomain - The string identifying the fromDomain.
   * @returns The current state of the snap.
   */
  getSnapState: (fromDomain: string) => Promise<Record<string, unknown>>;
}

function getGetStateHandler({ getSnapState }: GetStateHooks) {
  return async function getState(
    _req: unknown,
    res: PendingJsonRpcResponse<Record<string, unknown>>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
    engine: AnnotatedJsonRpcEngine,
  ): Promise<void> {
    try {
      res.result = await getSnapState(engine.domain as string);
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
