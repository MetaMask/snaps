import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type {
  JsonRpcRequest,
  RequestDeviceParams,
  RequestDeviceResult,
} from '@metamask/snaps-sdk';
import { DeviceFilterStruct, DeviceTypeStruct } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import { object, optional, array } from '@metamask/superstruct';
import { assertStruct, type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<RequestDeviceHooks> = {
  requestDevice: true,
};

export type RequestDeviceHooks = {
  /**
   * A hook to request a device.
   *
   * @returns The requested device, or `null` if no device was provided.
   */
  requestDevice: (params: RequestDeviceParams) => Promise<RequestDeviceResult>;
};

export const requestDeviceHandler: PermittedHandlerExport<
  RequestDeviceHooks,
  RequestDeviceParams,
  RequestDeviceResult
> = {
  methodNames: ['snap_requestDevice'],
  implementation: requestDeviceImplementation,
  hookNames,
};

const RequestDeviceParametersStruct = object({
  type: DeviceTypeStruct,
  filters: optional(array(DeviceFilterStruct)),
});

export type RequestDeviceParameters = InferMatching<
  typeof RequestDeviceParametersStruct,
  RequestDeviceParams
>;

/**
 * Handles the `snap_requestDevice` method.
 *
 * @param request - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * method.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.requestDevice - The function to request a device.
 * @returns Nothing.
 */
async function requestDeviceImplementation(
  request: JsonRpcRequest<RequestDeviceParameters>,
  response: PendingJsonRpcResponse<RequestDeviceResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { requestDevice }: RequestDeviceHooks,
): Promise<void> {
  const { params } = request;
  assertStruct(params, RequestDeviceParametersStruct);

  try {
    response.result = await requestDevice(params);
  } catch (error) {
    return end(error);
  }

  return end();
}
