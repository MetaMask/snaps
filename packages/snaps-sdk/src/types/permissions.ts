import type { SupportedCurve } from '@metamask/key-tree';
import type { CaipChainId, JsonRpcParams } from '@metamask/utils';

export type EmptyObject = Record<string, never>;

type CronjobRequest = {
  /**
   * The request to execute when the cronjob is triggered.
   */
  request: {
    /**
     * The method to call.
     */
    method: string;

    /**
     * The parameters to pass to the method.
     */
    params?: JsonRpcParams;
  };
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
  /**
   * The curve to use for the derived key. This must be a curve supported by
   * [`@metamask/key-tree`](https://npmjs.com/package/@metamask/key-tree).
   */
  curve: SupportedCurve;

  /**
   * The derivation path to use for the derived key, represented as an array of
   * path segments. For example, the path `m/44'/1'/0'/0/0` would be represented
   * as `['m', "44'", "1'", "0'", '0', '0']`.
   */
  path: string[];
};

export type Bip44Entropy = {
  /**
   * The coin type to use for the derived key, as specified in the
   * [SLIP-44 registry](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).
   */
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
