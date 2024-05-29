import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import {
  AccountsSnapHandlerType,
  type InvokeAccountsSnapParams,
  type InvokeKeyringParams,
  type InvokeKeyringResult,
  type InvokeSnapParams,
} from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';
import { isObject, type Json } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<InvokeKeyringHooks> = {
  invokeAccountSnap: true,
};

/**
 * `wallet_invokeKeyring` gets the requester's permitted and installed Snaps.
 */
export const invokeKeyringHandler: PermittedHandlerExport<
  InvokeKeyringHooks,
  InvokeSnapParams,
  InvokeKeyringResult
> = {
  methodNames: ['wallet_invokeKeyring'],
  implementation: invokeKeyringImplementation,
  hookNames,
};

export type InvokeKeyringHooks = {
  invokeAccountSnap: (params: InvokeAccountsSnapParams) => Promise<unknown>;
};

/**
 * The `wallet_invokeKeyring` method implementation.
 * Invokes onKeyringRequest if the snap requested is installed and connected to the dapp.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.invokeAccountSnap - A function to invoke an account Snap designated by its parameters,
 * bound to the requesting origin.
 * @returns Nothing.
 */
async function invokeKeyringImplementation(
  req: JsonRpcRequest<InvokeKeyringParams>,
  res: PendingJsonRpcResponse<InvokeKeyringResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { invokeAccountSnap }: InvokeKeyringHooks,
): Promise<void> {
  try {
    const { params } = req;

    if (!isObject(params)) {
      throw rpcErrors.invalidParams({
        message: 'Expected params to be a single object.',
      });
    }

    res.result = (await invokeAccountSnap({
      snapId: params.snapId,
      request: params.request,
      type: AccountsSnapHandlerType.Keyring,
    })) as Json;
  } catch (error) {
    return end(error);
  }

  return end();
}
