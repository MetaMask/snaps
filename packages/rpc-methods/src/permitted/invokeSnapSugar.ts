import {
  PermittedHandlerExport,
  JsonRpcRequest,
  JsonRpcEngineNextCallback,
  JsonRpcEngineEndCallback,
} from '@metamask/types';
import { isObject } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

export type InvokeSnapSugarArgs = {
  snapId: string;
  request: JsonRpcRequest<unknown>;
};

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
export function invokeSnapSugar(
  req: JsonRpcRequest<unknown>,
  _res: unknown,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
): void {
  let params: InvokeSnapSugarArgs;
  try {
    params = getValidatedParams(req.params);
  } catch (error) {
    return end(error);
  }

  req.method = 'wallet_snap';
  req.params = params;
  return next();
}

/**
 * Validates the wallet_invokeSnap method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
export function getValidatedParams(params: unknown): InvokeSnapSugarArgs {
  if (!isObject(params)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { snapId, request } = params;

  if (!snapId || typeof snapId !== 'string' || snapId === '') {
    throw ethErrors.rpc.invalidParams({
      message: 'Must specify a valid snap ID.',
    });
  }

  if (!isObject(request)) {
    throw ethErrors.rpc.invalidParams({
      message: 'Expected request to be a single object.',
    });
  }

  return params as InvokeSnapSugarArgs;
}
