import type { JsonRpcRequest } from '@metamask/utils';

import type { ChainId } from './caip';

export type EmptyObject = Record<string, never>;

export type Cronjob = {
  expression: string;
  request: Omit<JsonRpcRequest, 'jsonrpc' | 'id'>;
};

export type Bip32Entropy = {
  curve: 'secp256k1' | 'ed25519';
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
    jobs: Cronjob[];
  };
  'endowment:ethereum-provider': EmptyObject;
  'endowment:keyring': {
    allowedOrigins?: string[];
  };
  'endowment:lifecycle-hooks': EmptyObject;
  'endowment:name-lookup': ChainId[];
  'endowment:network-access': EmptyObject;
  'endowment:page-home': EmptyObject;
  'endowment:rpc': {
    dapps?: boolean;
    snaps?: boolean;
    allowedOrigins?: string[];
  };
  'endowment:signature-insight': {
    allowSignatureOrigin?: boolean;
  };
  'endowment:transaction-insight': {
    allowTransactionOrigin?: boolean;
  };
  'endowment:webassembly': EmptyObject;

  /* eslint-disable @typescript-eslint/naming-convention */
  eth_accounts: EmptyObject;
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
