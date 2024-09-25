import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  Cryptocurrency,
  GetRateParams,
  GetRateResult,
  JsonRpcRequest,
  Rate,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  StructError,
  create,
  literal,
  object,
  union,
} from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const hookNames: MethodHooksObject<GetRateMethodHooks> = {
  getRate: true,
};

export type GetRateMethodHooks = {
  /**
   * @param cryptocurrency - The cryptocurrency symbol.
   * Currently only 'btc' is supported.
   * @returns The {@link Rate} object.
   */
  getRate: (cryptocurrency: Cryptocurrency) => Rate | undefined;
};

export const getRateHandler: PermittedHandlerExport<
  GetRateMethodHooks,
  GetRateParameters,
  GetRateResult
> = {
  methodNames: ['snap_getRate'],
  implementation: getGetRateImplementation,
  hookNames,
};

const GetRateParametersStruct = object({
  cryptocurrency: union([literal('btc')]),
});

export type GetRateParameters = InferMatching<
  typeof GetRateParametersStruct,
  GetRateParams
>;

/**
 * The `snap_getRate` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getRate - The function to get the rate.
 * @returns Noting.
 */
function getGetRateImplementation(
  req: JsonRpcRequest<GetRateParameters>,
  res: PendingJsonRpcResponse<GetRateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getRate }: GetRateMethodHooks,
): void {
  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { cryptocurrency } = validatedParams;

    res.result = getRate(cryptocurrency) ?? null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the getRate method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getRate method parameter object.
 */
function getValidatedParams(params: unknown): GetRateParameters {
  try {
    return create(params, GetRateParametersStruct);
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
