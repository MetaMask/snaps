import { ResourceRequestHandler } from '@mm-snap/controllers';
import { ethErrors } from 'eth-rpc-errors';
import {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { RestrictedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';

export const manageAssetsHandler: RestrictedHandlerExport<
ManageAssetsHooks,
[method: string, arg: string | Record<string, unknown>],
string | Record<string, unknown> | null
> = {
  methodNames: ['snap_manageAssets'],
  getImplementation: getManageAssetsHandler,
  methodDescription: 'Get the state of the snap.',
  permissionDescription: 'Get the state of the snap.',
  hookNames: {
    handleAssetRequest: true,
  },
};

export interface ManageAssetsHooks {

  /**
   * A bound function gets the state of a particular snap.
   * @returns The current state of the snap.
   */
  handleAssetRequest: ResourceRequestHandler<Record<string, unknown>>;
}

function getManageAssetsHandler({ handleAssetRequest }: ManageAssetsHooks) {
  return async function manageAssets(
    req: JsonRpcRequest<
    [method: string, arg: string | Record<string, unknown>]
    >,
    res: PendingJsonRpcResponse<string | Record<string, unknown> | null>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
  ): Promise<void> {
    try {
      const [method, arg] = req?.params || [];

      if (!method || typeof method !== 'string') {
        return end(
          ethErrors.rpc.invalidParams({
            message: 'Expected non-empty string "method" as first parameter.',
          }),
        );
      }

      if (!arg || (typeof arg !== 'string' && !isPlainObject(arg))) {
        return end(
          ethErrors.rpc.invalidParams({
            message:
              'Expected non-empty string or plain object as second parameter.',
          }),
        );
      }

      res.result = handleAssetRequest(method, arg);
      return end();
    } catch (error) {
      return end(error);
    }
  };
}
