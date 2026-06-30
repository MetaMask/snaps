import type {
  JsonRpcEngineEndCallback,
  MethodHandler,
} from '@metamask/json-rpc-engine';
import type {
  ActionConstraint,
  EventConstraint,
  Messenger,
} from '@metamask/messenger';
import type { PermissionControllerGetPermissionAction } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  MessengerCallParams,
  MessengerCallResult,
} from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  create,
  object,
  string,
  StructError,
  array,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';
import { SnapEndowments } from 'src';
import { getMessengerCaveatActions } from 'src/endowments/messenger';

import type {
  JsonRpcRequestWithOrigin,
  SnapControllerGetSnapAction,
} from '../types';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<MessengerCallMethodHooks> = {
  getMessenger: true,
};

export type MessengerCallMethodHooks = {
  getMessenger: (
    actions: string[],
    events: string[],
  ) => Messenger<string, ActionConstraint, EventConstraint>;
};

export type MessengerCallMethodActions =
  | SnapControllerGetSnapAction
  | PermissionControllerGetPermissionAction;

const MessengerCallParametersStruct = object({
  action: string(),
  params: array(JsonStruct),
});

export type MessengerCallParameters = InferMatching<
  typeof MessengerCallParametersStruct,
  MessengerCallParams
>;

/**
 * Handler for the `snap_messengerCall` method.
 *
 * @internal
 */
export const messengerCallHandler = {
  implementation: getMessengerCallImplementation,
  hookNames,
  actionNames: ['SnapController:getSnap', 'PermissionController:getPermission'],
} satisfies MethodHandler<
  MessengerCallMethodHooks,
  MessengerCallMethodActions,
  MessengerCallParameters,
  MessengerCallResult,
  { origin: string }
>;

/**
 * The `snap_messengerCall` method implementation. This method is used to dispatch
 * an action via the messenger. It is only available to preinstalled Snaps.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getMessenger - The hook function to create a custom messenger for the Snap.
 * @param messenger - The messenger used to call controller actions.
 * @returns Nothing.
 */
function getMessengerCallImplementation(
  request: JsonRpcRequestWithOrigin<MessengerCallParams>,
  response: PendingJsonRpcResponse,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getMessenger }: MessengerCallMethodHooks,
  messenger: Messenger<string, MessengerCallMethodActions>,
): void {
  const snap = messenger.call('SnapController:getSnap', request.origin);
  const permission = messenger.call(
    'PermissionController:getPermission',
    request.origin,
    SnapEndowments.Messenger,
  );

  if (!snap?.preinstalled || !permission) {
    return end(rpcErrors.methodNotFound());
  }

  const actions = getMessengerCaveatActions(permission);

  const snapMessenger = getMessenger(actions ?? [], []);

  const { params } = request;

  try {
    const { action, params: actionParams } = getValidatedParams(params);
    response.result = snapMessenger.call(action, ...actionParams);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the parameters for the `snap_messengerCall` method.
 *
 * @param params - Parameters to validate.
 * @returns Validated parameters.
 * @throws Throws RPC error if validation fails.
 */
function getValidatedParams(params: unknown): MessengerCallParameters {
  try {
    return create(params, MessengerCallParametersStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw rpcErrors.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }

    /* istanbul ignore next */
    throw rpcErrors.internal();
  }
}
