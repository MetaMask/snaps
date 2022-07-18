import { ethErrors } from 'eth-rpc-errors';
import { SNAP_PREFIX } from '@metamask/snap-utils';
import {
  PermittedHandlerExport,
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import { isObject } from '@metamask/utils';

/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
export const invokeSnapSugarHandler: PermittedHandlerExport<
  void,
  JsonRpcRequest<unknown>,
  unknown
> = {
  methodNames: ['wallet_invokeSnap'],
  implementation: invokeSnapSugar,
  hookNames: undefined,
};

/**
 * The `wallet_invokeSnap` method implementation.
 * Reroutes incoming JSON-RPC requests that are targeting snaps, by modifying the method and params.
 *
 * @param req - The JSON-RPC request object.
 * @param _res - The JSON-RPC response object. Not used by this
 * function.
 * @param next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
function invokeSnapSugar(
  req: JsonRpcRequest<unknown>,
  _res: unknown,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
): void {
  if (
    !Array.isArray(req.params) ||
    typeof req.params[0] !== 'string' ||
    !isObject(req.params[1])
  ) {
    return end(
      ethErrors.rpc.invalidParams({
        message: 'Must specify a string snap ID and a plain request object.',
      }),
    );
  }

  req.method = SNAP_PREFIX + req.params[0];
  req.params = [req.params[1]];
  return next();
}
