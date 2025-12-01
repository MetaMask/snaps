import type { CaipChainId } from '@metamask/utils';

export type BaseParams = {
  scope: CaipChainId;
};

export type PersonalSignParams = BaseParams & {
  message: string;
};

export type SignTypedDataParams = {
  message: string;
};
