import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type { Messenger } from '@metamask/messenger';
import type { PermissionControllerHasPermissionAction } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  InvokeKeyringParams,
  InvokeKeyringResult,
  InvokeSnapParams,
} from '@metamask/snaps-sdk';
import { HandlerType, WALLET_SNAP_PERMISSION_KEY } from '@metamask/snaps-utils';
import type {
  PendingJsonRpcResponse,
  Json,
  JsonRpcRequest,
} from '@metamask/utils';
import { hasProperty } from '@metamask/utils';

import { getValidatedParams } from './invokeSnapSugar';
import type {
  SnapControllerGetSnapAction,
  SnapControllerHandleRequestAction,
} from '../types';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<InvokeKeyringMethodHooks> = {
  getAllowedKeyringMethods: true,
};

export type InvokeKeyringMethodHooks = {
  /**
   * Get the list of allowed Keyring methods for a given origin.
   *
   * @returns The list of allowed Keyring methods.
   */
  getAllowedKeyringMethods: () => string[];
};

export type InvokeKeyringMethodActions =
  | PermissionControllerHasPermissionAction
  | SnapControllerHandleRequestAction
  | SnapControllerGetSnapAction;

/**
 * Invoke a keyring method of a Snap. This calls the `onKeyringRequest` handler
 * of the Snap.
 *
 * The Snap must be installed and the dapp must have permission to communicate
 * with the Snap, or the request is rejected. The dapp can install the Snap and
 * request permission to communicate with it using [`wallet_requestSnaps`](https://docs.metamask.io/snaps/reference/snaps-api/wallet_requestsnaps).
 */
export const invokeKeyringHandler = {
  implementation: invokeKeyringImplementation,
  hookNames,
  actionNames: [
    'PermissionController:hasPermission',
    'SnapController:handleRequest',
    'SnapController:getSnap',
  ],
} satisfies MethodHandler<
  InvokeKeyringMethodHooks,
  InvokeKeyringMethodActions,
  InvokeSnapParams,
  InvokeKeyringResult,
  { origin: string }
>;

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
 * @param hooks.getAllowedKeyringMethods - Get the list of allowed Keyring
 * methods for a given origin.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
async function invokeKeyringImplementation(
  req: JsonRpcRequest<InvokeKeyringParams> & { origin: string },
  // `InvokeKeyringResult` is an alias for `Json` (which is the default type
  // argument for `PendingJsonRpcResponse`), but that may not be the case in the
  // future. We use `InvokeKeyringResult` here to make it clear that this is the
  // expected type of the result.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  res: PendingJsonRpcResponse<InvokeKeyringResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getAllowedKeyringMethods }: InvokeKeyringMethodHooks,
  messenger: Messenger<string, InvokeKeyringMethodActions>,
): Promise<void> {
  let params: InvokeSnapParams;
  try {
    params = getValidatedParams(req.params);
  } catch (error) {
    return end(error);
  }

  const { origin } = req;
  const { snapId, request } = params;

  if (
    !origin ||
    !messenger.call(
      'PermissionController:hasPermission',
      origin,
      WALLET_SNAP_PERMISSION_KEY,
    )
  ) {
    return end(
      rpcErrors.invalidRequest({
        message: `The snap "${snapId}" is not connected to "${origin}". Please connect before invoking the snap.`,
      }),
    );
  }

  if (!messenger.call('SnapController:getSnap', snapId)) {
    return end(
      // Mirror error message from SnapController.
      rpcErrors.invalidRequest({
        message: `The Snap "${snapId}" is not installed. Please install it before invoking it.`,
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

  const allowedMethods = getAllowedKeyringMethods();
  if (!allowedMethods.includes(request.method)) {
    return end(
      rpcErrors.invalidRequest({
        message: `The origin "${origin}" is not allowed to invoke the method "${request.method}".`,
      }),
    );
  }

  try {
    res.result = (await messenger.call('SnapController:handleRequest', {
      origin,
      snapId,
      request,
      handler: HandlerType.OnKeyringRequest,
    })) as Json;
  } catch (error) {
    return end(error);
  }

  return end();
}
