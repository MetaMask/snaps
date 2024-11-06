import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type {
  JsonRpcRequest,
  WriteDeviceParams,
  WriteDeviceResult,
} from '@metamask/snaps-sdk';
import { deviceId } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { literal, number, object, optional } from '@metamask/superstruct';
import {
  assertStruct,
  type PendingJsonRpcResponse,
  StrictHexStruct,
} from '@metamask/utils';

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
  id: deviceId('hid'),
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
  assertStruct(params, WriteDeviceParametersStruct);

  try {
    response.result = await writeDevice(params);
  } catch (error) {
    return end(error);
  }

  return end();
}
