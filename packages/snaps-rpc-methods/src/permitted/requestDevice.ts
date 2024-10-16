import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import type {
  JsonRpcRequest,
  ProviderRequestParams,
  ProviderRequestResult,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import { object, optional, string, type } from '@metamask/superstruct';
import {
  type PendingJsonRpcResponse,
  CaipChainIdStruct,
  JsonRpcParamsStruct,
} from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<ProviderRequestMethodHooks> = {
  requestDevices: true,
};

export type ProviderRequestMethodHooks = {
  requestDevices: () => any;
};

export const providerRequestHandler: PermittedHandlerExport<
  ProviderRequestMethodHooks,
  ProviderRequestParameters,
  ProviderRequestResult
> = {
  methodNames: ['snap_requestDevice'],
  implementation: providerRequestImplementation,
  hookNames,
};

const ProviderRequestParametersStruct = object({
  chainId: CaipChainIdStruct,
  request: type({
    method: string(),
    params: optional(JsonRpcParamsStruct),
  }),
});

export type ProviderRequestParameters = InferMatching<
  typeof ProviderRequestParametersStruct,
  ProviderRequestParams
>;

async function providerRequestImplementation(
  req: JsonRpcRequest<ProviderRequestParams>,
  res: PendingJsonRpcResponse<ProviderRequestResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { requestDevices }: ProviderRequestMethodHooks,
): Promise<void> {
  const { params } = req;

  try {
    res.result = await requestDevices();
  } catch (error) {
    return end(error);
  }

  return end();
}
