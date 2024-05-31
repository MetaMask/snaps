import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  InvokeAccountsSnapParams,
  InvokeAccountsSnapResult,
} from '@metamask/snaps-sdk';
import type { Snap, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { HandlerType, WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';
import { hasProperty, type Json } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';
import { getValidatedParams } from './invokeSnapSugar';

const hookNames: MethodHooksObject<InvokeAccountsSnapHooks> = {
  hasPermission: true,
  handleSnapRpcRequest: true,
  getSnap: true,
  getAllowedKeyringMethods: true,
};

/**
 * `wallet_invokeAccountsSnap` invokes an account Snap.
 */
export const invokeAccountSnapHandler: PermittedHandlerExport<
  InvokeAccountsSnapHooks,
  InvokeAccountsSnapParams,
  InvokeAccountsSnapResult
> = {
  methodNames: ['wallet_invokeAccountsSnap'],
  implementation: invokeAccountSnapImplementation,
  hookNames,
};

export type InvokeAccountsSnapHooks = {
  hasPermission: (permissionName: string) => boolean;

  handleSnapRpcRequest: ({
    snapId,
    handler,
    request,
  }: Omit<SnapRpcHookArgs, 'origin'> & { snapId: string }) => Promise<unknown>;

  getSnap: (snapId: string) => Snap | undefined;

  getAllowedKeyringMethods: () => string[];
};

/**
 * The `wallet_invokeAccountsSnap` method implementation.
 * Invokes onKeyringRequest or onAccountsChainRequest if the snap requested is installed and connected to the dapp.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.handleSnapRpcRequest - Invokes a snap with a given RPC request.
 * @param hooks.hasPermission - Checks whether a given origin has a given permission.
 * @param hooks.getSnap - Gets information about a given snap.
 * @param hooks.getAllowedKeyringMethods - Get the list of allowed Keyring
 * methods for a given origin.
 * @returns Nothing.
 */
async function invokeAccountSnapImplementation(
  req: JsonRpcRequest<InvokeAccountsSnapParams>,
  res: PendingJsonRpcResponse<InvokeAccountsSnapResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    handleSnapRpcRequest,
    hasPermission,
    getSnap,
    getAllowedKeyringMethods,
  }: InvokeAccountsSnapHooks,
): Promise<void> {
  let params: InvokeAccountsSnapParams;
  try {
    params = getValidatedParams(req.params) as InvokeAccountsSnapParams;
  } catch (error) {
    return end(error);
  }

  // We expect the MM middleware stack to always add the origin to requests
  const { origin } = req as JsonRpcRequest & { origin: string };
  const { snapId, request } = params;

  if (!origin || !hasPermission(WALLET_SNAP_PERMISSION_KEY)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`,
      }),
    );
  }

  if (!getSnap(snapId)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`,
      }),
    );
  }

  if (!hasProperty(request, 'method') || typeof request.method !== 'string') {
    return end(
      rpcErrors.invalidRequest({
        message: 'The request must have a method.',
      }),
    );
  }

  // TODO: Figure this out.
  const allowedMethods = getAllowedKeyringMethods();
  if (!allowedMethods.includes(request.method)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`,
      }),
    );
  }

  try {
    res.result = (await handleSnapRpcRequest({
      snapId,
      request,
      handler: HandlerType.OnAccountsRequest,
    })) as Json;
  } catch (error) {
    return end(error);
  }

  return end();
}
