import type { Snap } from '@metamask/snaps-utils';
import {
  HandlerType,
  WALLET_SNAP_PERMISSION_KEY,
  type InstallSnapsResult,
  type SnapId,
  type SnapRpcHookArgs,
} from '@metamask/snaps-utils';
import type {
  PermittedHandlerExport,
  PendingJsonRpcResponse,
  JsonRpcEngineEndCallback,
  JsonRpcRequest,
} from '@metamask/types';
import type { Json } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type { MethodHooksObject } from '../utils';
import type { InvokeSnapSugarArgs } from './invokeSnapSugar';
import { getValidatedParams } from './invokeSnapSugar';

const hookNames: MethodHooksObject<InvokeKeyringHooks> = {
  hasPermission: true,
  handleSnapRpcRequest: true,
  getSnap: true,
};

/**
 * `wallet_invokeKeyring` gets the requester's permitted and installed Snaps.
 */
export const invokeKeyringHandler: PermittedHandlerExport<
  InvokeKeyringHooks,
  JsonRpcRequest<unknown>,
  unknown
> = {
  methodNames: ['wallet_invokeKeyring'],
  implementation: invokeKeyringImplementation,
  hookNames,
};

export type InvokeKeyringHooks = {
  hasPermission: (origin: string, permissionName: string) => boolean;

  handleSnapRpcRequest: ({
    snapId,
    origin,
    handler,
    request,
  }: SnapRpcHookArgs & { snapId: SnapId }) => Promise<unknown>;

  getSnap: (snapId: SnapId) => Snap | undefined;
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
 * @param hooks.handleSnapRpcRequest - Invokes a snap with a given RPC request.
 * @param hooks.hasPermission - Checks whether a given origin has a given permission.
 * @param hooks.getSnap - Gets information about a given snap.
 * @returns Nothing.
 */
async function invokeKeyringImplementation(
  req: JsonRpcRequest<unknown>,
  res: PendingJsonRpcResponse<InstallSnapsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { handleSnapRpcRequest, hasPermission, getSnap }: InvokeKeyringHooks,
): Promise<void> {
  let params: InvokeSnapSugarArgs;
  try {
    params = getValidatedParams(req.params);
  } catch (error) {
    return end(error);
  }

  // We expect the MM middleware stack to always add the origin to requests
  const { origin } = req;
  const { snapId, request } = params;

  if (!origin || !hasPermission(origin, WALLET_SNAP_PERMISSION_KEY)) {
    return end(
      ethErrors.rpc.invalidRequest({
        message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`,
      }),
    );
  }

  if (!getSnap(snapId)) {
    return end(
      ethErrors.rpc.invalidRequest({
        message: `The snap "${snapId}" is not installed. Please install it first, before invoking the snap.`,
      }),
    );
  }

  // TODO: RPC origin / method filtering?

  try {
    res.result = (await handleSnapRpcRequest({
      snapId,
      origin,
      request,
      handler: HandlerType.OnKeyringRequest,
    })) as Json;
  } catch (error) {
    return end(error);
  }

  return end();
}
