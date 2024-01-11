import type { Json, JsonRpcRequest, NonEmptyArray } from '@metamask/utils';

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
    chains?: ChainId[];
    matchers?: { tlds?: string[]; schemes?: string[] };
    maxRequestTime?: number;
  };
  'endowment:network-access': EmptyObject;
  'endowment:page-home'?: {
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

export type CaveatConstraint = {
  /**
   * The type of the caveat. The type is presumed to be meaningful in the
   * context of the capability it is associated with.
   *
   * In MetaMask, every permission can only have one caveat of each type.
   */
  readonly type: string;

  /**
   * Any additional data necessary to enforce the caveat.
   */
  readonly value: Json;
};

/**
 * Note: This type is copied instead of using dependency, because of bundle sizing reasons.
 *
 * A `ZCAP-LD`-like permission object. A permission is associated with a
 * particular `invoker`, which is the holder of the permission. Possessing the
 * permission grants access to a particular restricted resource, identified by
 * the `parentCapability`. The use of the restricted resource may be further
 * restricted by any `caveats` associated with the permission.
 * Note: this type is mirroring: https://github.com/MetaMask/core/blob/main/packages/permission-controller/src/Permission.ts#L39
 */
export type PermissionConstraint = {
  /**
   * The context(s) in which this capability is meaningful.
   *
   * It is required by the standard, but we make it optional since there is only
   * one context in our usage (i.e. the user's MetaMask instance).
   */
  readonly '@context'?: NonEmptyArray<string>;

  /**
   * The caveats of the permission.
   *
   * @see {@link Caveat} For more information.
   */
  readonly caveats: null | NonEmptyArray<CaveatConstraint>;

  /**
   * The creation date of the permission, in UNIX epoch time.
   */
  readonly date: number;

  /**
   * The GUID of the permission object.
   */
  readonly id: string;

  /**
   * The origin string of the subject that has the permission.
   */
  readonly invoker: string;

  /**
   * A pointer to the resource that possession of the capability grants
   * access to, for example a JSON-RPC method or endowment.
   */
  readonly parentCapability: string;
};

/**
 * Note: This type is copied instead of using dependency, because of bundle sizing reasons.
 *
 * Permissions associated with a PermissionController subject.
 * Note: this is mirroring https://github.com/MetaMask/core/blob/main/packages/permission-controller/src/PermissionController.ts#L138
 */
export type SubjectPermissions<Permission extends PermissionConstraint> =
  Record<Permission['parentCapability'], Permission>;
