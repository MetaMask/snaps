import type { CaipAssetType, CaipChainId, Json } from '@metamask/utils';

export type ConfirmTransactionParams = {
  id?: string;
  chainId: CaipChainId;
  accountId: string;
  to: string;
  amount: string;
  assetId?: CaipAssetType;
  fee?: {
    amount: string;
    assetId?: CaipAssetType;
  };
  custom?: Record<string, Json>;
};

export type ConfirmTransactionResult = boolean;
