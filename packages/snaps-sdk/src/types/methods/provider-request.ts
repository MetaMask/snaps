import type { CaipChainId, Json, JsonRpcParams } from '@metamask/utils';

/**
 * The request parameters for the `snap_experimentalProviderRequest` method.
 *
 * NOTE: This implementation is experimental and may be removed or changed without warning.
 *
 * @property chainId - The CAIP-2 chain ID to make the request to.
 * @property request - The JSON-RPC request.
 */
export type ProviderRequestParams = {
  chainId: CaipChainId;
  request: { method: string; params: JsonRpcParams } | { method: string };
};

/**
 * The result returned by the `snap_experimentalProviderRequest` method, which will be a JSON serializable value.
 *
 * NOTE: This implementation is experimental and may be removed or changed without warning.
 */
export type ProviderRequestResult = Json;
