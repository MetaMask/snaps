import type { SupportedCurve } from '@metamask/key-tree';
import type { CaipChainId, JsonRpcRequest } from '@metamask/utils';

export type EmptyObject = Record<string, never>;

type CronjobRequest = {
  request: Omit<JsonRpcRequest, 'jsonrpc' | 'id'>;
};

type CronjobWithExpression = CronjobRequest & {
  expression: string;
};

type CronjobWithDuration = CronjobRequest & {
  duration: string;
};

export type Cronjob = CronjobWithExpression | CronjobWithDuration;

export type NameLookupMatchers =
  | {
      tlds: string[];
    }
  | {
      schemes: string[];
    }
  | {
      tlds: string[];
      schemes: string[];
    };

export type Bip32Entropy = {
  curve: SupportedCurve;
  path: string[];
};

export type Bip44Entropy = {
  coinType: number;
};

export type RequestedSnap = {
  version?: string;
};

export type InitialPermissions = Partial<{
  'endowment:cronjob': {
    jobs?: Cronjob[];
    maxRequestTime?: number;
  };
  'endowment:ethereum-provider': EmptyObject;
  'endowment:keyring': {
    allowedOrigins?: string[];
    maxRequestTime?: number;
  };
  'endowment:lifecycle-hooks'?: {
    maxRequestTime?: number;
  };
  'endowment:name-lookup': {
    chains?: CaipChainId[];
    matchers?: NameLookupMatchers;
    maxRequestTime?: number;
  };
  'endowment:network-access': EmptyObject;
  'endowment:page-home'?: {
    maxRequestTime?: number;
  };
  'endowment:page-settings'?: {
    maxRequestTime?: number;
  };
  'endowment:rpc': {
    dapps?: boolean;
    snaps?: boolean;
    allowedOrigins?: string[];
    maxRequestTime?: number;
  };
  'endowment:signature-insight': {
    allowSignatureOrigin?: boolean;
    maxRequestTime?: number;
  };
  'endowment:transaction-insight': {
    allowTransactionOrigin?: boolean;
    maxRequestTime?: number;
  };
  'endowment:transaction-details-insight': {
    allowTransactionDetailsOrigin?: boolean;
    maxRequestTime?: number;
  };
  'endowment:webassembly': EmptyObject;

  /* eslint-disable @typescript-eslint/naming-convention */
  snap_dialog: EmptyObject;
  snap_getBip32Entropy: Bip32Entropy[];
  snap_getBip32PublicKey: Bip32Entropy[];
  snap_getBip44Entropy: Bip44Entropy[];
  snap_getEntropy: EmptyObject;
  snap_getLocale: EmptyObject;
  snap_manageAccounts: EmptyObject;
  snap_manageState: EmptyObject;
  snap_notify: EmptyObject;
  wallet_snap: Record<string, RequestedSnap>;
  /* eslint-enable @typescript-eslint/naming-convention */
}>;
