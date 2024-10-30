import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type {
  JsonRpcRequest,
  ReadDeviceParams,
  ReadDeviceResult,
} from '@metamask/snaps-sdk';
import { deviceId } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  literal,
  number,
  object,
  optional,
  union,
} from '@metamask/superstruct';
import { assertStruct, type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ReadDeviceHooks> = {
  readDevice: true,
};

export type ReadDeviceHooks = {
  /**
   * A hook to request a device.
   *
   * @returns The requested device, or `null` if no device was provided.
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
  reportType: union([literal('output'), literal('feature')]),
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
 * @param hooks.readDevice - The function to request a device.
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
  assertStruct(params, ReadDeviceParametersStruct);

  try {
    response.result = await readDevice(params);
  } catch (error) {
    return end(error);
  }

  return end();
}
