import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  ReadDeviceParams,
  ReadDeviceResult,
} from '@metamask/snaps-sdk';
import { deviceId } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  create,
  literal,
  number,
  object,
  optional,
  StructError,
  union,
} from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ReadDeviceHooks> = {
  readDevice: true,
};

export type ReadDeviceHooks = {
  /**
   * A hook to read data from a device.
   *
   * @param params - The parameters for reading data from the device.
   * @returns The data read from the device.
   */
  readDevice: (params: ReadDeviceParams) => Promise<ReadDeviceResult>;
};

export const readDeviceHandler: PermittedHandlerExport<
  ReadDeviceHooks,
  ReadDeviceParams,
  ReadDeviceResult
> = {
  methodNames: ['snap_readDevice'],
  implementation: readDeviceImplementation,
  hookNames,
};

const ReadDeviceParametersStruct = object({
  type: literal('hid'),
  id: deviceId('hid'),
  reportType: optional(union([literal('output'), literal('feature')])),
  reportId: optional(number()),
});

export type ReadDeviceParameters = InferMatching<
  typeof ReadDeviceParametersStruct,
  ReadDeviceParams
>;

/**
 * Handles the `snap_readDevice` method.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * method.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.readDevice - The function to read data from a device.
 * @returns Nothing.
 */
async function readDeviceImplementation(
  request: JsonRpcRequest<ReadDeviceParameters>,
  response: PendingJsonRpcResponse<ReadDeviceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { readDevice }: ReadDeviceHooks,
): Promise<void> {
  const { params } = request;
  const validatedParams = getValidatedParams(params);

  try {
    response.result = await readDevice(validatedParams);
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
function getValidatedParams(params: unknown): ReadDeviceParams {
  try {
    return create(params, ReadDeviceParametersStruct);
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
