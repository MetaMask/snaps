import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { InvokeSnapParams, InvokeSnapResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest } from '@metamask/utils';
import { isObject } from '@metamask/utils';

/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
export const invokeSnapSugarHandler: PermittedHandlerExport<
  void,
  InvokeSnapParams,
  InvokeSnapResult
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
  req: JsonRpcRequest<InvokeSnapParams>,
  _res: unknown,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
): void {
  let params: InvokeSnapParams;
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
export function getValidatedParams(params: unknown): InvokeSnapParams {
  if (!isObject(params)) {
    throw rpcErrors.invalidParams({
      message: 'Expected params to be a single object.',
    });
  }

  const { snapId, request } = params;

  if (!snapId || typeof snapId !== 'string' || snapId === '') {
    throw rpcErrors.invalidParams({
      message: 'Must specify a valid snap ID.',
    });
  }

  if (!isObject(request)) {
    throw rpcErrors.invalidParams({
      message: 'Expected request to be a single object.',
    });
  }

  return params as InvokeSnapParams;
}
