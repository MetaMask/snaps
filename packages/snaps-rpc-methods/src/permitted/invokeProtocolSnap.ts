import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type {
  PermissionConstraint,
  PermittedHandlerExport,
} from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  InvokeProtocolSnapParams,
  InvokeProtocolSnapResult,
} from '@metamask/snaps-sdk';
import type { Snap, SnapRpcHookArgs } from '@metamask/snaps-utils';
import { HandlerType, WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-utils';
import type { PendingJsonRpcResponse, JsonRpcRequest } from '@metamask/utils';
import { hasProperty, type Json } from '@metamask/utils';

import { SnapEndowments, getProtocolCaveatRpcMethods } from '../endowments';
import type { MethodHooksObject } from '../utils';
import { getValidatedParams } from './invokeSnapSugar';

const hookNames: MethodHooksObject<InvokeProtocolSnapHooks> = {
  hasPermission: true,
  handleSnapRpcRequest: true,
  getSnap: true,
  getSubjectPermissions: true,
};

/**
 * `wallet_invokeProtocolSnap` invokes a protocol Snap.
 */
export const invokeProtocolSnapHandler: PermittedHandlerExport<
  InvokeProtocolSnapHooks,
  InvokeProtocolSnapParams,
  InvokeProtocolSnapResult
> = {
  methodNames: ['wallet_invokeProtocolSnap'],
  implementation: invokeProtocolSnapImplementation,
  hookNames,
};

export type InvokeProtocolSnapHooks = {
  hasPermission: (permissionName: string) => boolean;

  handleSnapRpcRequest: ({
    snapId,
    handler,
    request,
  }: Omit<SnapRpcHookArgs, 'origin'> & { snapId: string }) => Promise<unknown>;

  getSnap: (snapId: string) => Snap | undefined;

  getSubjectPermissions: (
    origin: string,
  ) => Promise<Record<string, PermissionConstraint> | undefined>;
};

// These RPC methods are assumed to be supported by the Snap as they are required.
// TODO: Verify these.
const DEFAULT_RPC_METHODS = [
  'chain_listTransactions',
  'chain_estimateFees',
  'chain_getBalances',
  'chain_broadcastTransaction',
  'chain_getDataForTransaction',
  'chain_getTransactionStatus',
];

/**
 * The `wallet_invokeProtocolSnap` method implementation.
 * Invokes onKeyringRequest or onProtocolRequest if the snap requested is installed and connected to the dapp.
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
 * @param hooks.getSubjectPermissions - Get the permissions for a specific origin.
 * @returns Nothing.
 */
async function invokeProtocolSnapImplementation(
  req: JsonRpcRequest<InvokeProtocolSnapParams>,
  res: PendingJsonRpcResponse<InvokeProtocolSnapResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    handleSnapRpcRequest,
    hasPermission,
    getSnap,
    getSubjectPermissions,
  }: InvokeProtocolSnapHooks,
): Promise<void> {
  let params: InvokeProtocolSnapParams;
  try {
    params = getValidatedParams(req.params) as InvokeProtocolSnapParams;
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

  const snapPermissions = await getSubjectPermissions(snapId);

  const protocolPermission = snapPermissions?.[SnapEndowments.Protocol];

  const additionalRpcMethods =
    getProtocolCaveatRpcMethods(protocolPermission) ?? [];

  const supportedMethods = [...DEFAULT_RPC_METHODS, ...additionalRpcMethods];

  const isSigningRequest = !supportedMethods.includes(request.method);

  const wrappedRequest = isSigningRequest
    ? // TODO: Other params
      { method: 'keyring_submitRequest', params: { request } }
    : request;

  const handler = isSigningRequest
    ? HandlerType.OnKeyringRequest
    : HandlerType.OnProtocolRequest;

  try {
    res.result = (await handleSnapRpcRequest({
      snapId,
      request: wrappedRequest,
      handler,
    })) as Json;
  } catch (error) {
    return end(error);
  }

  return end();
}
