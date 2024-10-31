import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  ManageAccountsParams,
  ManageAccountsResult,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  array,
  create,
  object,
  optional,
  record,
  string,
  StructError,
  union,
} from '@metamask/superstruct';
import type {
  Json,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';
import { JsonStruct } from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ManageAccountsMethodHooks> = {
  hasPermission: true,
  handleKeyringSnapMessage: true,
};

export type ManageAccountsMethodHooks = {
  /**
   * Checks if the current snap has a permission.
   *
   * @param permissionName - The name of the permission.
   * @returns Whether the snap has the permission.
   */
  hasPermission: (permissionName: string) => boolean;
  /**
   * Handles the keyring snap message.
   *
   * @returns The snap keyring message result.
   */
  handleKeyringSnapMessage: (
    message: ManageAccountsParameters,
  ) => Promise<Json>;
};

export const manageAccountsHandler: PermittedHandlerExport<
  ManageAccountsMethodHooks,
  ManageAccountsParams,
  ManageAccountsResult
> = {
  methodNames: ['snap_manageAccounts'],
  implementation: getManageAccountsImplementation,
  hookNames,
};

const ManageAccountsParametersStruct = object({
  method: string(),
  params: optional(union([array(JsonStruct), record(string(), JsonStruct)])),
});

export type ManageAccountsParameters = InferMatching<
  typeof ManageAccountsParametersStruct,
  ManageAccountsParams
>;

/**
 * The `snap_manageAccounts` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - The function to check if the snap has a permission.
 * @param hooks.handleKeyringSnapMessage - The function to handle the keyring snap message.
 * @returns Nothing.
 */
async function getManageAccountsImplementation(
  req: JsonRpcRequest<ManageAccountsParameters>,
  res: PendingJsonRpcResponse<ManageAccountsResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { hasPermission, handleKeyringSnapMessage }: ManageAccountsMethodHooks,
): Promise<void> {
  if (!hasPermission(SnapEndowments.Keyring)) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    res.result = await handleKeyringSnapMessage(validatedParams);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the manageAccounts method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated manageAccounts method parameter object.
 */
function getValidatedParams(params: unknown): ManageAccountsParameters {
  try {
    return create(params, ManageAccountsParametersStruct);
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
