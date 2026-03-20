import type { SupportedCurve } from '@metamask/key-tree';
import type { CaipChainId, JsonRpcParams } from '@metamask/utils';

export type EmptyObject = Record<string, never>;

type CronjobRequest = {
  /**
   * The request to provide to the `onCronjob` handler for the Snap to determine
   * how to handle the request, when the cronjob is triggered.
   */
  request: {
    /**
     * The method to call. This can be an arbitrary method, and is provided to
     * the `onCronjob` handler for the Snap to determine how to handle the
     * request.
     */
    method: string;

    /**
     * The parameters to pass to the method. This can be used to provide
     * additional information about the request, and is provided to the
     * `onCronjob` handler for the Snap to determine how to handle the request.
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

/**
 * Supported encoding formats for private keys.
 *
 * Mirrors `PrivateKeyEncoding` from `@metamask/keyring-api`.
 * Keep in sync with `PrivateKeyEncoding` in `@metamask/keyring-api`.
 */
type PrivateKeyEncoding = 'hexadecimal' | 'base58';

/**
 * Supported account types for keyring accounts.
 *
 * Mirrors `KeyringAccountType` from `@metamask/keyring-api`.
 * Keep in sync with `KeyringAccountType` in `@metamask/keyring-api`.
 */
type KeyringAccountType =
  | 'eip155:eoa'
  | 'eip155:erc4337'
  | 'bip122:p2pkh'
  | 'bip122:p2sh'
  | 'bip122:p2wpkh'
  | 'bip122:p2tr'
  | 'solana:data-account'
  | 'tron:eoa'
  | 'entropy:account';

/**
 * Capabilities object supported by a keyring Snap.
 *
 * Mirrors the shape validated by `KeyringCapabilitiesStruct` in
 * `@metamask/keyring-api`. Keep in sync with that struct.
 *
 * Runtime validation uses the struct in `@metamask/snaps-utils`; this type
 * exists purely for the `InitialPermissions` type signature.
 */
type Capabilities = {
  scopes: CaipChainId[];
  bip44?: {
    derivePath?: boolean;
    deriveIndex?: boolean;
    deriveIndexRange?: boolean;
    discover?: boolean;
  };
  privateKey?: {
    importFormats?: {
      encoding: PrivateKeyEncoding;
      type?: KeyringAccountType;
    }[];
    exportFormats?: {
      encoding: PrivateKeyEncoding;
    }[];
  };
  custom?: {
    createAccounts?: boolean;
  };
};

export type InitialPermissions = Partial<{
  'endowment:cronjob': {
    jobs?: Cronjob[];
    maxRequestTime?: number;
  };
  'endowment:ethereum-provider': EmptyObject;
  'endowment:keyring': {
    allowedOrigins?: string[];
    capabilities?: Capabilities;
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
