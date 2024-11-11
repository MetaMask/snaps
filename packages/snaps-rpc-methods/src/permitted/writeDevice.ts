import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  WriteDeviceParams,
  WriteDeviceResult,
} from '@metamask/snaps-sdk';
import { deviceId, DeviceType } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  create,
  literal,
  number,
  object,
  optional,
  StructError,
} from '@metamask/superstruct';
import { type PendingJsonRpcResponse, StrictHexStruct } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<WriteDeviceHooks> = {
  writeDevice: true,
};

export type WriteDeviceHooks = {
  /**
   * A hook to write data to a device.
   *
   * @param params - The parameters for writing data to the device.
   * @returns A promise that resolves when the data has been written to the
   * device.
   */
  writeDevice: (params: WriteDeviceParams) => Promise<WriteDeviceResult>;
};

export const writeDeviceHandler: PermittedHandlerExport<
  WriteDeviceHooks,
  WriteDeviceParams,
  WriteDeviceResult
> = {
  methodNames: ['snap_writeDevice'],
  implementation: writeDeviceImplementation,
  hookNames,
};

const WriteDeviceParametersStruct = object({
  type: literal('hid'),
  id: deviceId(DeviceType.HID),
  data: StrictHexStruct,
  reportId: optional(number()),
});

export type WriteDeviceParameters = InferMatching<
  typeof WriteDeviceParametersStruct,
  WriteDeviceParams
>;

/**
 * Handles the `snap_writeDevice` method.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * method.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.writeDevice - The function to write data to a device.
 * @returns Nothing.
 */
async function writeDeviceImplementation(
  request: JsonRpcRequest<WriteDeviceParameters>,
  response: PendingJsonRpcResponse<WriteDeviceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { writeDevice }: WriteDeviceHooks,
): Promise<void> {
  const { params } = request;
  const validatedParams = getValidatedParams(params);

  try {
    response.result = (await writeDevice(validatedParams)) ?? null;
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
function getValidatedParams(params: unknown): WriteDeviceParams {
  try {
    return create(params, WriteDeviceParametersStruct);
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
