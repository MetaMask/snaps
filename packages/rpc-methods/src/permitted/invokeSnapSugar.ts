import {
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
} from 'json-rpc-engine';
import { ethErrors } from 'eth-rpc-errors';
import { SNAP_PREFIX } from '@metamask/snap-controllers';
import { PermittedHandlerExport } from '@metamask/types';
import { isPlainObject } from '../utils';

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

async function invokeSnapSugar(
  req: JsonRpcRequest<unknown>,
  _res: unknown,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
): Promise<void> {
  if (
    !Array.isArray(req.params) ||
    typeof req.params[0] !== 'string' ||
    !isPlainObject(req.params[1])
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
