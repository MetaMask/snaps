import type { Infer, Struct } from 'superstruct';
export declare const FORBIDDEN_COIN_TYPES: number[];
export declare const Bip32PathStruct: Struct<string[], Struct<string, null>>;
export declare const bip32entropy: <Type extends {
    path: string[];
    curve: string;
}, Schema>(struct: Struct<Type, Schema>) => Struct<Type, Schema>;
export declare const Bip32EntropyStruct: Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}, {
    path: Struct<string[], Struct<string, null>>;
    curve: Struct<"ed25519" | "secp256k1", {
        ed25519: "ed25519";
        secp256k1: "secp256k1";
    }>;
}>;
export declare type Bip32Entropy = Infer<typeof Bip32EntropyStruct>;
export declare const SnapGetBip32EntropyPermissionsStruct: Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}[], Struct<{
    path: string[];
    curve: "ed25519" | "secp256k1";
}, {
    path: Struct<string[], Struct<string, null>>;
    curve: Struct<"ed25519" | "secp256k1", {
        ed25519: "ed25519";
        secp256k1: "secp256k1";
    }>;
}>>;
export declare const SemVerRangeStruct: Struct<string, null>;
export declare const SnapIdsStruct: Struct<Record<string, {
    version?: string | undefined;
}>, null>;
export declare type SnapIds = Infer<typeof SnapIdsStruct>;
export declare const ChainIdsStruct: Struct<string[], Struct<string, null>>;
export declare const PermissionsStruct: Struct<{
    'endowment:network-access'?: {} | undefined;
    'endowment:webassembly'?: {} | undefined;
    'endowment:transaction-insight'?: {
        allowTransactionOrigin?: boolean | undefined;
    } | undefined;
    'endowment:cronjob'?: {
        jobs: {
            request: {
                method: string;
                params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                id?: string | number | null | undefined;
                jsonrpc?: "2.0" | undefined;
            };
            expression: string;
        }[];
    } | undefined;
    'endowment:rpc'?: {
        dapps?: boolean | undefined;
        snaps?: boolean | undefined;
        allowedOrigins?: string[] | undefined;
    } | undefined;
    'endowment:name-lookup'?: string[] | undefined;
    'endowment:keyring'?: {
        allowedOrigins?: string[] | undefined;
    } | undefined;
    snap_dialog?: {} | undefined;
    snap_confirm?: {} | undefined;
    snap_manageState?: {} | undefined;
    snap_manageAccounts?: {} | undefined;
    snap_notify?: {} | undefined;
    snap_getBip32Entropy?: {
        path: string[];
        curve: "ed25519" | "secp256k1";
    }[] | undefined;
    snap_getBip32PublicKey?: {
        path: string[];
        curve: "ed25519" | "secp256k1";
    }[] | undefined;
    snap_getBip44Entropy?: {
        coinType: number;
    }[] | undefined;
    snap_getEntropy?: {} | undefined;
    wallet_snap?: Record<string, {
        version?: string | undefined;
    }> | undefined;
}, {
    'endowment:network-access': Struct<{} | undefined, {}>;
    'endowment:webassembly': Struct<{} | undefined, {}>;
    'endowment:transaction-insight': Struct<{
        allowTransactionOrigin?: boolean | undefined;
    } | undefined, {
        allowTransactionOrigin: Struct<boolean | undefined, null>;
    }>;
    'endowment:cronjob': Struct<{
        jobs: {
            request: {
                method: string;
                params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                id?: string | number | null | undefined;
                jsonrpc?: "2.0" | undefined;
            };
            expression: string;
        }[];
    } | undefined, {
        jobs: Struct<{
            request: {
                method: string;
                params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                id?: string | number | null | undefined;
                jsonrpc?: "2.0" | undefined;
            };
            expression: string;
        }[], Struct<{
            request: {
                method: string;
                params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                id?: string | number | null | undefined;
                jsonrpc?: "2.0" | undefined;
            };
            expression: string;
        }, {
            expression: Struct<string, null>;
            request: Struct<{
                method: string;
                params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                id?: string | number | null | undefined;
                jsonrpc?: "2.0" | undefined;
            }, {
                params: Struct<Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined, null>;
                method: Struct<string, null>;
                id: Struct<string | number | null | undefined, unknown>;
                jsonrpc: Struct<"2.0" | undefined, unknown>;
            }>;
        }>>;
    }>;
    'endowment:rpc': Struct<{
        dapps?: boolean | undefined;
        snaps?: boolean | undefined;
        allowedOrigins?: string[] | undefined;
    } | undefined, {
        dapps: Struct<boolean | undefined, null>;
        snaps: Struct<boolean | undefined, null>;
        allowedOrigins: Struct<string[] | undefined, Struct<string, null>>;
    }>;
    'endowment:name-lookup': Struct<string[] | undefined, Struct<string, null>>;
    'endowment:keyring': Struct<{
        allowedOrigins?: string[] | undefined;
    } | undefined, {
        allowedOrigins: Struct<string[] | undefined, Struct<string, null>>;
    }>;
    snap_dialog: Struct<{} | undefined, {}>;
    snap_confirm: Struct<{} | undefined, {}>;
    snap_manageState: Struct<{} | undefined, {}>;
    snap_manageAccounts: Struct<{} | undefined, {}>;
    snap_notify: Struct<{} | undefined, {}>;
    snap_getBip32Entropy: Struct<{
        path: string[];
        curve: "ed25519" | "secp256k1";
    }[] | undefined, Struct<{
        path: string[];
        curve: "ed25519" | "secp256k1";
    }, {
        path: Struct<string[], Struct<string, null>>;
        curve: Struct<"ed25519" | "secp256k1", {
            ed25519: "ed25519";
            secp256k1: "secp256k1";
        }>;
    }>>;
    snap_getBip32PublicKey: Struct<{
        path: string[];
        curve: "ed25519" | "secp256k1";
    }[] | undefined, Struct<{
        path: string[];
        curve: "ed25519" | "secp256k1";
    }, {
        path: Struct<string[], Struct<string, null>>;
        curve: Struct<"ed25519" | "secp256k1", {
            ed25519: "ed25519";
            secp256k1: "secp256k1";
        }>;
    }>>;
    snap_getBip44Entropy: Struct<{
        coinType: number;
    }[] | undefined, Struct<{
        coinType: number;
    }, {
        coinType: Struct<number, null>;
    }>>;
    snap_getEntropy: Struct<{} | undefined, {}>;
    wallet_snap: Struct<Record<string, {
        version?: string | undefined;
    }> | undefined, null>;
}>;
export declare type SnapPermissions = Infer<typeof PermissionsStruct>;
export declare const SnapManifestStruct: Struct<{
    description: string;
    version: import("@metamask/utils").SemVerVersion;
    proposedName: string;
    source: {
        location: {
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        };
        shasum: string;
    };
    initialPermissions: {
        'endowment:network-access'?: {} | undefined;
        'endowment:webassembly'?: {} | undefined;
        'endowment:transaction-insight'?: {
            allowTransactionOrigin?: boolean | undefined;
        } | undefined;
        'endowment:cronjob'?: {
            jobs: {
                request: {
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                };
                expression: string;
            }[];
        } | undefined;
        'endowment:rpc'?: {
            dapps?: boolean | undefined;
            snaps?: boolean | undefined;
            allowedOrigins?: string[] | undefined;
        } | undefined;
        'endowment:name-lookup'?: string[] | undefined;
        'endowment:keyring'?: {
            allowedOrigins?: string[] | undefined;
        } | undefined;
        snap_dialog?: {} | undefined;
        snap_confirm?: {} | undefined;
        snap_manageState?: {} | undefined;
        snap_manageAccounts?: {} | undefined;
        snap_notify?: {} | undefined;
        snap_getBip32Entropy?: {
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined;
        snap_getBip32PublicKey?: {
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined;
        snap_getBip44Entropy?: {
            coinType: number;
        }[] | undefined;
        snap_getEntropy?: {} | undefined;
        wallet_snap?: Record<string, {
            version?: string | undefined;
        }> | undefined;
    };
    manifestVersion: "0.1";
    repository?: {
        type: string;
        url: string;
    } | undefined;
    $schema?: string | undefined;
}, {
    version: Struct<import("@metamask/utils").SemVerVersion, null>;
    description: Struct<string, null>;
    proposedName: Struct<string, null>;
    repository: Struct<{
        type: string;
        url: string;
    } | undefined, {
        type: Struct<string, null>;
        url: Struct<string, null>;
    }>;
    source: Struct<{
        location: {
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        };
        shasum: string;
    }, {
        shasum: Struct<string, null>;
        location: Struct<{
            npm: {
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            };
        }, {
            npm: Struct<{
                registry: "https://registry.npmjs.org" | "https://registry.npmjs.org/";
                filePath: string;
                packageName: string;
                iconPath?: string | undefined;
            }, {
                filePath: Struct<string, null>;
                iconPath: Struct<string | undefined, null>;
                packageName: Struct<string, null>;
                registry: Struct<"https://registry.npmjs.org" | "https://registry.npmjs.org/", null>;
            }>;
        }>;
    }>;
    initialPermissions: Struct<{
        'endowment:network-access'?: {} | undefined;
        'endowment:webassembly'?: {} | undefined;
        'endowment:transaction-insight'?: {
            allowTransactionOrigin?: boolean | undefined;
        } | undefined;
        'endowment:cronjob'?: {
            jobs: {
                request: {
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                };
                expression: string;
            }[];
        } | undefined;
        'endowment:rpc'?: {
            dapps?: boolean | undefined;
            snaps?: boolean | undefined;
            allowedOrigins?: string[] | undefined;
        } | undefined;
        'endowment:name-lookup'?: string[] | undefined;
        'endowment:keyring'?: {
            allowedOrigins?: string[] | undefined;
        } | undefined;
        snap_dialog?: {} | undefined;
        snap_confirm?: {} | undefined;
        snap_manageState?: {} | undefined;
        snap_manageAccounts?: {} | undefined;
        snap_notify?: {} | undefined;
        snap_getBip32Entropy?: {
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined;
        snap_getBip32PublicKey?: {
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined;
        snap_getBip44Entropy?: {
            coinType: number;
        }[] | undefined;
        snap_getEntropy?: {} | undefined;
        wallet_snap?: Record<string, {
            version?: string | undefined;
        }> | undefined;
    }, {
        'endowment:network-access': Struct<{} | undefined, {}>;
        'endowment:webassembly': Struct<{} | undefined, {}>;
        'endowment:transaction-insight': Struct<{
            allowTransactionOrigin?: boolean | undefined;
        } | undefined, {
            allowTransactionOrigin: Struct<boolean | undefined, null>;
        }>;
        'endowment:cronjob': Struct<{
            jobs: {
                request: {
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                };
                expression: string;
            }[];
        } | undefined, {
            jobs: Struct<{
                request: {
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                };
                expression: string;
            }[], Struct<{
                request: {
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                };
                expression: string;
            }, {
                expression: Struct<string, null>;
                request: Struct<{
                    method: string;
                    params?: Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined;
                    id?: string | number | null | undefined;
                    jsonrpc?: "2.0" | undefined;
                }, {
                    params: Struct<Record<string, import("@metamask/utils").Json> | import("@metamask/utils").Json[] | undefined, null>;
                    method: Struct<string, null>;
                    id: Struct<string | number | null | undefined, unknown>;
                    jsonrpc: Struct<"2.0" | undefined, unknown>;
                }>;
            }>>;
        }>;
        'endowment:rpc': Struct<{
            dapps?: boolean | undefined;
            snaps?: boolean | undefined;
            allowedOrigins?: string[] | undefined;
        } | undefined, {
            dapps: Struct<boolean | undefined, null>;
            snaps: Struct<boolean | undefined, null>;
            allowedOrigins: Struct<string[] | undefined, Struct<string, null>>;
        }>;
        'endowment:name-lookup': Struct<string[] | undefined, Struct<string, null>>;
        'endowment:keyring': Struct<{
            allowedOrigins?: string[] | undefined;
        } | undefined, {
            allowedOrigins: Struct<string[] | undefined, Struct<string, null>>;
        }>;
        snap_dialog: Struct<{} | undefined, {}>;
        snap_confirm: Struct<{} | undefined, {}>;
        snap_manageState: Struct<{} | undefined, {}>;
        snap_manageAccounts: Struct<{} | undefined, {}>;
        snap_notify: Struct<{} | undefined, {}>;
        snap_getBip32Entropy: Struct<{
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined, Struct<{
            path: string[];
            curve: "ed25519" | "secp256k1";
        }, {
            path: Struct<string[], Struct<string, null>>;
            curve: Struct<"ed25519" | "secp256k1", {
                ed25519: "ed25519";
                secp256k1: "secp256k1";
            }>;
        }>>;
        snap_getBip32PublicKey: Struct<{
            path: string[];
            curve: "ed25519" | "secp256k1";
        }[] | undefined, Struct<{
            path: string[];
            curve: "ed25519" | "secp256k1";
        }, {
            path: Struct<string[], Struct<string, null>>;
            curve: Struct<"ed25519" | "secp256k1", {
                ed25519: "ed25519";
                secp256k1: "secp256k1";
            }>;
        }>>;
        snap_getBip44Entropy: Struct<{
            coinType: number;
        }[] | undefined, Struct<{
            coinType: number;
        }, {
            coinType: Struct<number, null>;
        }>>;
        snap_getEntropy: Struct<{} | undefined, {}>;
        wallet_snap: Struct<Record<string, {
            version?: string | undefined;
        }> | undefined, null>;
    }>;
    manifestVersion: Struct<"0.1", "0.1">;
    $schema: Struct<string | undefined, null>;
}>;
export declare type SnapManifest = Infer<typeof SnapManifestStruct>;
/**
 * Check if the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @returns Whether the value is a valid {@link SnapManifest} object.
 */
export declare function isSnapManifest(value: unknown): value is SnapManifest;
/**
 * Assert that the given value is a valid {@link SnapManifest} object.
 *
 * @param value - The value to check.
 * @throws If the value is not a valid {@link SnapManifest} object.
 */
export declare function assertIsSnapManifest(value: unknown): asserts value is SnapManifest;
/**
 * Creates a {@link SnapManifest} object from JSON.
 *
 * @param value - The value to check.
 * @throws If the value cannot be coerced to a {@link SnapManifest} object.
 * @returns The created {@link SnapManifest} object.
 */
export declare function createSnapManifest(value: unknown): SnapManifest;
