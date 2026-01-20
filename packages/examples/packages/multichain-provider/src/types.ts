import type { CaipChainId } from '@metamask/utils';

export type BaseParams = {
  scope: CaipChainId;
};

/**
 * The parameters for calling the `signMessage` JSON-RPC method.
 */
export type SignMessageParams = BaseParams & {
  message: string;
};

/**
 * The parameters for calling the `signTypedData` JSON-RPC method.
 */
export type SignTypedDataParams = BaseParams & {
  message: string;
};
