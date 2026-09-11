import type { CaipAssetType, Json } from '@metamask/utils';

export type UpdateConfirmTransactionParams = {
  id: string;
  fee?: {
    amount: string;
    assetId?: CaipAssetType;
  };
  custom?: Record<string, Json>;
};

export type UpdateConfirmTransactionResult = null;
