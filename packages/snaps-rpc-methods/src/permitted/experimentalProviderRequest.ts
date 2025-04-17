import type { JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine';
import type { PermittedHandlerExport } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type {
  JsonRpcRequest,
  ProviderRequestParams,
  ProviderRequestResult,
} from '@metamask/snaps-sdk';
import { type InferMatching } from '@metamask/snaps-utils';
import {
  StructError,
  create,
  object,
  optional,
  string,
  type,
} from '@metamask/superstruct';
import {
  bigIntToHex,
  parseCaipChainId,
  type PendingJsonRpcResponse,
  type Json,
  CaipChainIdStruct,
  JsonRpcParamsStruct,
} from '@metamask/utils';

import { SnapEndowments } from '../endowments';
import type { MethodHooksObject } from '../utils';

// Read-only methods that are currently allowed for this RPC method.
const METHOD_ALLOWLIST = Object.freeze([
  'eth_blockNumber',
  'eth_call',
  'eth_chainId',
  'eth_coinbase',
  'eth_estimateGas',
  'eth_feeHistory',
  'eth_gasPrice',
  'eth_getBalance',
  'eth_getBlockByHash',
  'eth_getBlockByNumber',
  'eth_getBlockTransactionCountByHash',
  'eth_getBlockTransactionCountByNumber',
  'eth_getCode',
  'eth_getFilterChanges',
  'eth_getFilterLogs',
  'eth_getLogs',
  'eth_getProof',
  'eth_getStorageAt',
  'eth_getTransactionByBlockHashAndIndex',
  'eth_getTransactionByBlockNumberAndIndex',
  'eth_getTransactionByHash',
  'eth_getTransactionCount',
  'eth_getTransactionReceipt',
  'eth_getUncleByBlockHashAndIndex',
  'eth_getUncleByBlockNumberAndIndex',
  'eth_getUncleCountByBlockHash',
  'eth_getUncleCountByBlockNumber',
  'eth_getWork',
  'eth_hashrate',
  'eth_mining',
  'eth_newBlockFilter',
  'eth_newFilter',
  'eth_newPendingTransactionFilter',
  'eth_protocolVersion',
  'eth_sendRawTransaction',
  'eth_submitHashrate',
  'eth_submitWork',
  'eth_syncing',
  'eth_uninstallFilter',
  'net_listening',
  'net_peerCount',
  'net_version',
  'web3_clientVersion',
  'web3_sha3',
]);

const hookNames: MethodHooksObject<ProviderRequestMethodHooks> = {
  hasPermission: true,
  getNetworkConfigurationByChainId: true,
  getNetworkClientById: true,
};

type NetworkConfiguration = {
  defaultRpcEndpointIndex: number;
  rpcEndpoints: { networkClientId: string }[];
};

export type ProviderRequestMethodHooks = {
  hasPermission: (permissionName: string) => boolean;

  getNetworkConfigurationByChainId: (
    chainId: string,
  ) => NetworkConfiguration | undefined;

  getNetworkClientById: (id: string) => {
    provider: { request: (request: Json) => Promise<Json> };
  };
};

export const providerRequestHandler: PermittedHandlerExport<
  ProviderRequestMethodHooks,
  ProviderRequestParameters,
  ProviderRequestResult
> = {
  methodNames: ['snap_experimentalProviderRequest'],
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

/**
 * The `snap_experimentalProviderRequest` method implementation.
 *
 * This RPC method lets Snaps make requests to MetaMask networks that are not currently selected in the UI.
 *
 * The RPC method requires the caller to have the endowment:ethereum-provider permission.
 *
 * NOTE: This implementation is experimental and may be removed or changed without warning.
 *
 * @param req - The JSON-RPC request object.
 * @param res - The JSON-RPC response object.
 * @param _next - The `json-rpc-engine` "next" callback. Not used by this
 * function.
 * @param end - The `json-rpc-engine` "end" callback.
 * @param hooks - The RPC method hooks.
 * @param hooks.hasPermission - Checks whether a given origin has a given permission.
 * @param hooks.getNetworkConfigurationByChainId - Get a network configuration for a given chain ID.
 * @param hooks.getNetworkClientById - Get a network client for a given ID.
 * @returns Nothing.
 */
async function providerRequestImplementation(
  req: JsonRpcRequest<ProviderRequestParams>,
  // `ProviderRequestResult` is an alias for `Json` (which is the default type
  // argument for `PendingJsonRpcResponse`), but that may not be the case in the
  // future. We use `ProviderRequestResult` here to make it clear that this is
  // the expected type of the result.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-arguments
  res: PendingJsonRpcResponse<ProviderRequestResult>,
  _next: unknown,
  end: JsonRpcEngineEndCallback,
  {
    hasPermission,
    getNetworkConfigurationByChainId,
    getNetworkClientById,
  }: ProviderRequestMethodHooks,
): Promise<void> {
  if (!hasPermission(SnapEndowments.EthereumProvider)) {
    return end(rpcErrors.methodNotFound());
  }

  const { params } = req;

  try {
    const { chainId, request } = getValidatedParams(params);

    if (!METHOD_ALLOWLIST.includes(request.method)) {
      return end(rpcErrors.methodNotFound());
    }

    const parsedChainId = parseCaipChainId(chainId);

    if (parsedChainId.namespace !== 'eip155') {
      return end(
        rpcErrors.invalidParams({
          message: 'Only EVM networks are currently supported.',
        }),
      );
    }

    const numericalChainId = BigInt(parsedChainId.reference);

    const networkConfiguration = getNetworkConfigurationByChainId(
      bigIntToHex(numericalChainId),
    );

    if (!networkConfiguration) {
      return end(
        rpcErrors.invalidParams({
          message: 'The requested network is not available.',
        }),
      );
    }

    const rpc =
      networkConfiguration.rpcEndpoints[
        networkConfiguration.defaultRpcEndpointIndex
      ];

    const networkClient = getNetworkClientById(rpc.networkClientId);

    const { provider } = networkClient;

    res.result = await provider.request(request);
  } catch (error) {
    return end(error);
  }

  return end();
}

/**
 * Validate the method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated updateInterface method parameter object.
 */
function getValidatedParams(params: unknown): ProviderRequestParameters {
  try {
    return create(params, ProviderRequestParametersStruct);
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
