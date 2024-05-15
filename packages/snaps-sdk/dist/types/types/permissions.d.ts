import type { JsonRpcRequest } from '@metamask/utils';
import type { ChainId } from './caip';
export declare type EmptyObject = Record<string, never>;
export declare type Cronjob = {
    expression: string;
    request: Omit<JsonRpcRequest, 'jsonrpc' | 'id'>;
};
export declare type NameLookupMatchers = {
    tlds: string[];
} | {
    schemes: string[];
} | {
    tlds: string[];
    schemes: string[];
};
export declare type Bip32Entropy = {
    curve: 'secp256k1' | 'ed25519';
    path: string[];
};
export declare type Bip44Entropy = {
    coinType: number;
};
export declare type RequestedSnap = {
    version?: string;
};
export declare type InitialPermissions = Partial<{
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
        matchers?: NameLookupMatchers;
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
}>;
