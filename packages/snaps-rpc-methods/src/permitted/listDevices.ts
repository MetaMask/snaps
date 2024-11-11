import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  ListDevicesParams,
  ListDevicesResult,
} from '@metamask/snaps-sdk';
import { selectiveUnion } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  array,
  create,
  literal,
  object,
  optional,
  StructError,
} from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ListDevicesHooks> = {
  listDevices: true,
};

export type ListDevicesHooks = {
  /**
   * A hook to list the available devices.
   *
   * @param params - The parameters for reading data from the device.
   * @returns The data read from the device.
   */
  listDevices: (params: ListDevicesParams) => Promise<ListDevicesResult>;
};

export const listDevicesHandler: PermittedHandlerExport<
  ListDevicesHooks,
  ListDevicesParams,
  ListDevicesResult
> = {
  methodNames: ['snap_listDevices'],
  implementation: listDevicesImplementation,
  hookNames,
};

const ListDevicesParametersStruct = object({
  type: optional(
    selectiveUnion((value) => {
      if (Array.isArray(value)) {
        return array(literal('hid'));
      }

      return literal('hid');
    }),
  ),
});

export type ListDevicesParameters = InferMatching<
  typeof ListDevicesParametersStruct,
  ListDevicesParams
>;

/**
 * Handles the `snap_listDevices` method.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * method.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.listDevices - The function to read data from a device.
 * @returns Nothing.
 */
async function listDevicesImplementation(
  request: JsonRpcRequest<ListDevicesParameters>,
  response: PendingJsonRpcResponse<ListDevicesResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { listDevices }: ListDevicesHooks,
): Promise<void> {
  const { params } = request;
  const validatedParams = getValidatedParams(params);

  try {
    response.result = await listDevices(validatedParams);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the method `params` and returns them cast to the correct type.
 * Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated method parameter object.
 */
function getValidatedParams(params: unknown): ListDevicesParams {
  try {
    return create(params, ListDevicesParametersStruct);
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
