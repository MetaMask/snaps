import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type { GetSupportedDevicesResult } from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import type {
  JsonRpcParams,
  JsonRpcRequest,
  PendingJsonRpcResponse,
} from '@metamask/utils';

/**
 * The `snap_getSupportedDevices` method implementation.
 */
export const getSupportedDevicesHandler: PermittedHandlerExport<
  Record<string, never>,
  JsonRpcParams,
  GetSupportedDevicesResult
> = {
  methodNames: ['snap_getSupportedDevices'],
  implementation: getSupportedDevicesImplementation,
  hookNames: {},
};

/**
 * The `snap_getSupportedDevices` method implementation.
 *
 * @param _ - The JSON-RPC request object.
 * @param response - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @returns Nothing.
 */
async function getSupportedDevicesImplementation(
  _: JsonRpcRequest,
  response: PendingJsonRpcResponse<GetSupportedDevicesResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
): Promise<void> {
  const deviceTypes: DeviceType[] = [];

  if (navigator?.hid) {
    deviceTypes.push(DeviceType.HID);
  }

  response.result = deviceTypes;
  return end();
}
