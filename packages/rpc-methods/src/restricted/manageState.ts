import {
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { RestrictedHandlerExport } from '../../types';
import { isPlainObject } from '../utils';

/**
 * `snap_manageState` let's the Snap store and manage some of its state on
 * your device.
 */
export const manageStateHandler: RestrictedHandlerExport<
  ManageStateHooks,
  [ManageStateOperation, Record<string, unknown>],
  Record<string, unknown> | null
> = {
  methodNames: ['snap_manageState'],
  getImplementation: getManageStateHandler,
  hookNames: {
    clearSnapState: true,
    getSnapState: true,
    updateSnapState: true,
  },
};

export interface ManageStateHooks {
  /**
   * A bound function that clears the state of the requesting Snap.
   */
  clearSnapState: () => Promise<void>;

  /**
   * A bound function that gets the state of the requesting Snap.
   *
   * @returns The current state of the Snap.
   */
  getSnapState: () => Promise<Record<string, unknown>>;

  /**
   * A bound function that updates the state of the requesting Snap.
   *
   * @param newState - The new state of the Snap.
   */
  updateSnapState: (newState: Record<string, unknown>) => Promise<void>;
}

export enum ManageStateOperation {
  clearState = 'clear',
  getState = 'get',
  updateState = 'update',
}

function getManageStateHandler({
  clearSnapState,
  getSnapState,
  updateSnapState,
}: ManageStateHooks) {
  return async function manageState(
    req: JsonRpcRequest<
      [ManageStateOperation, Record<string, unknown> | undefined]
    >,
    res: PendingJsonRpcResponse<Record<string, unknown> | null>,
    _next: unknown,
    end: JsonRpcEngineEndCallback,
  ): Promise<void> {
    const [operation, newState] = req?.params || [];

    try {
      switch (operation) {
        case ManageStateOperation.clearState:
          await clearSnapState();
          res.result = null;
          break;

        case ManageStateOperation.getState:
          res.result = await getSnapState();
          break;

        case ManageStateOperation.updateState:
          if (!isPlainObject(newState)) {
            return end(
              ethErrors.rpc.invalidParams({
                message: `Invalid ${req.method} "updateState" parameter: The new state must be a plain object.`,
                data: {
                  receivedNewState:
                    typeof newState === 'undefined' ? 'undefined' : newState,
                },
              }),
            );
          }

          await updateSnapState(newState);
          res.result = null;
          break;

        default:
          return end(
            ethErrors.rpc.invalidParams(
              `Invalid ${req.method} operation: "${operation}"`,
            ),
          );
      }

      return end();
    } catch (error) {
      return end(error);
    }
  };
}
