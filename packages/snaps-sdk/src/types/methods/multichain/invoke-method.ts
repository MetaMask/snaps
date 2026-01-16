import type { CaipChainId, Json, JsonRpcRequest } from '@metamask/utils';

/**
 * The request parameters for the `wallet_invokeMethod` method.
 *
 * @property scope - The scope on which to invoke the method.
 * @property request - The request to send.
 */
export type InvokeMethodParams = {
  scope: CaipChainId;
  request: Pick<JsonRpcRequest, 'method' | 'params'>;
};

/**
 * The result returned for the `wallet_invokeMethod` method.
 *
 * This method returns the response of the wrapped request.
 */
export type InvokeMethodResult = Json;
