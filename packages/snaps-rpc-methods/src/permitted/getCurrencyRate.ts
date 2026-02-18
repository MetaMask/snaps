import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  AvailableCurrency,
  CurrencyRate,
  GetCurrencyRateParams,
  GetCurrencyRateResult,
  JsonRpcRequest,
} from '@metamask/snaps-sdk';
import { currency, type InferMatching } from '@metamask/snaps-utils';
import { StructError, create, object, union } from '@metamask/superstruct';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type { MethodHooksObject } from '../utils';

const methodName = 'snap_getCurrencyRate';

const hookNames: MethodHooksObject<GetCurrencyRateMethodHooks> = {
  getCurrencyRate: true,
};

export type GetCurrencyRateMethodHooks = {
  /**
   * @param currency - The currency symbol.
   * Currently only 'btc' is supported.
   * @returns The {@link CurrencyRate} object.
   */
  getCurrencyRate: (currency: AvailableCurrency) => CurrencyRate | undefined;
};

export const getCurrencyRateHandler = {
  methodNames: [methodName] as const,
  implementation: getGetCurrencyRateImplementation,
  hookNames,
} satisfies PermittedHandlerExport<
  GetCurrencyRateMethodHooks,
  GetCurrencyRateParameters,
  GetCurrencyRateResult
>;

const GetCurrencyRateParametersStruct = object({
  currency: union([currency('btc')]),
});

export type GetCurrencyRateParameters = InferMatching<
  typeof GetCurrencyRateParametersStruct,
  GetCurrencyRateParams
>;

/**
 * The `snap_getCurrencyRate` method implementation.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.getCurrencyRate - The function to get the rate.
 * @returns Nothing.
 */
function getGetCurrencyRateImplementation(
  req: JsonRpcRequest<GetCurrencyRateParameters>,
  res: PendingJsonRpcResponse<GetCurrencyRateResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  { getCurrencyRate }: GetCurrencyRateMethodHooks,
): void {
  const { params } = req;

  try {
    const validatedParams = getValidatedParams(params);

    const { currency: selectedCurrency } = validatedParams;

    res.result = getCurrencyRate(selectedCurrency) ?? null;
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the getCurrencyRate method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getCurrencyRate method parameter object.
 */
function getValidatedParams(params: unknown): GetCurrencyRateParameters {
  try {
    return create(params, GetCurrencyRateParametersStruct);
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
