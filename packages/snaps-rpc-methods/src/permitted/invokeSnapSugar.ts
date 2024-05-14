import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { InvokeSnapParams, InvokeSnapResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
import { isObject } from '@metamask/utils';

/**
 * `wallet_invokeSnap` attempts to invoke an RPC method of the specified Snap.
 */
export const invokeSnapSugarHandler: PermittedHandlerExport<
  InvokeSnapSugarHooks,
  InvokeSnapParams,
  InvokeSnapResult
> = {
  methodNames: ['wallet_invokeSnap'],
  implementation: invokeSnapSugar,
  hookNames: {
    invokeSnap: true,
  },
};

export type InvokeSnapSugarHooks = {
  invokeSnap: (params: InvokeSnapParams) => Promise<InvokeSnapResult>;
};

/**
 * The `wallet_invokeSnap` method implementation.
 * Effectively calls `wallet_snap` under the hood.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.invokeSnap - A function to invoke a snap designated by its parameters,
 * bound to the requesting origin.
 * @returns Nothing.
 * @throws If the params are invalid.
 */
export async function invokeSnapSugar(
  req: JsonRpcRequest<InvokeSnapParams>,
  res: PendingJsonRpcResponse<InvokeSnapResult>,
  _next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  { invokeSnap }: InvokeSnapSugarHooks,
): Promise<void> {
  try {
    const params = getValidatedParams(req.params);
    res.result = await invokeSnap(params);
  } catch (error) {
    return end(error);
  }
  return end();
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
