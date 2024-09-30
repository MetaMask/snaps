import type { CaipChainId, Json, JsonRpcRequest } from '@metamask/utils';

/**
 * The request parameters for the `snap_experimentalProviderRequest` method.
 *
 * @property chainId - The CAIP-2 chain ID to make the request to.
 * @property request - The JSON-RPC request.
 */
export type ProviderRequestParams = {
  chainId: CaipChainId;
  request: JsonRpcRequest;
};

/**
 * The result returned by the `snap_experimentalProviderRequest` method, which will be a JSON serializable value.
 */
export type ProviderRequestResult = Json;
