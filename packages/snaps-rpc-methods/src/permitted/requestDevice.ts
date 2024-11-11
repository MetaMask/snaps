import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  RequestDeviceParams,
  RequestDeviceResult,
} from '@metamask/snaps-sdk';
import { DeviceFilterStruct, DeviceTypeStruct } from '@metamask/snaps-sdk';
import type { InferMatching } from '@metamask/snaps-utils';
import {
  object,
  optional,
  array,
  create,
  StructError,
} from '@metamask/superstruct';
import { type PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<RequestDeviceHooks> = {
  requestDevice: true,
};

export type RequestDeviceHooks = {
  /**
   * A hook to request a device.
   *
   * @param params - The parameters for requesting a device.
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
  const validatedParams = getValidatedParams(params);

  try {
    response.result = await requestDevice(validatedParams);
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
function getValidatedParams(params: unknown): RequestDeviceParams {
  try {
    return create(params, RequestDeviceParametersStruct);
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
