export declare const reducer: import("redux").Reducer<import("redux").CombinedState<{
    configuration: {
        open: boolean;
        snapId: string;
        snapVersion: string | undefined;
        srp: string;
        sesEnabled: boolean;
    };
    console: {
        entries: import("../features/console/slice").ConsoleEntry[];
    };
    manifest: import("../features/manifest/slice").ManifestState;
    notifications: import("../features/notifications/slice").NotificationsState;
    simulation: {
        status: import("../features/simulation/slice").SnapStatus;
        executionService: import("@metamask/snaps-controllers").IframeExecutionService | null;
        permissionController: import("@metamask/permission-controller").GenericPermissionController | null;
        subjectMetadataController: import("@metamask/permission-controller").SubjectMetadataController | null;
        snapInterfaceController: import("@metamask/snaps-controllers").SnapInterfaceController | null;
        manifest: import("@metamask/snaps-utils").VirtualFile<{
            description: string;
            version: import("@metamask/utils").SemVerVersion;
            source: {
                location: {
                    npm: {
                        registry: "https://registry.npmjs.org/" | "https://registry.npmjs.org";
                        filePath: string;
                        packageName: string;
                        iconPath?: string | undefined;
                    };
                };
                shasum: string;
                files?: string[] | undefined;
                locales?: string[] | undefined;
            };
            proposedName: string;
            initialPermissions: Partial<{
                'endowment:cronjob': {
                    jobs: import("@metamask/snaps-sdk").Cronjob[];
                    maxRequestTime?: number | undefined;
                };
                'endowment:ethereum-provider': import("@metamask/snaps-sdk").EmptyObject;
                'endowment:keyring': {
                    allowedOrigins?: string[] | undefined;
                    maxRequestTime?: number | undefined;
                };
                'endowment:lifecycle-hooks'?: {
                    maxRequestTime?: number | undefined;
                } | undefined;
                'endowment:name-lookup': {
                    chains?: `${string}:${string}`[] | undefined;
                    matchers?: import("@metamask/snaps-sdk").NameLookupMatchers | undefined;
                    maxRequestTime?: number | undefined;
                };
                'endowment:network-access': import("@metamask/snaps-sdk").EmptyObject;
                'endowment:page-home'?: {
                    maxRequestTime?: number | undefined;
                } | undefined;
                'endowment:rpc': {
                    dapps?: boolean | undefined;
                    snaps?: boolean | undefined;
                    allowedOrigins?: string[] | undefined;
                    maxRequestTime?: number | undefined;
                };
                'endowment:signature-insight': {
                    allowSignatureOrigin?: boolean | undefined;
                    maxRequestTime?: number | undefined;
                };
                'endowment:transaction-insight': {
                    allowTransactionOrigin?: boolean | undefined;
                    maxRequestTime?: number | undefined;
                };
                'endowment:webassembly': import("@metamask/snaps-sdk").EmptyObject;
                snap_dialog: import("@metamask/snaps-sdk").EmptyObject;
                snap_getBip32Entropy: import("@metamask/snaps-sdk").Bip32Entropy[];
                snap_getBip32PublicKey: import("@metamask/snaps-sdk").Bip32Entropy[];
                snap_getBip44Entropy: import("@metamask/snaps-sdk").Bip44Entropy[];
                snap_getEntropy: import("@metamask/snaps-sdk").EmptyObject;
                snap_getLocale: import("@metamask/snaps-sdk").EmptyObject;
                snap_manageAccounts: import("@metamask/snaps-sdk").EmptyObject;
                snap_manageState: import("@metamask/snaps-sdk").EmptyObject;
                snap_notify: import("@metamask/snaps-sdk").EmptyObject;
                wallet_snap: Record<string, import("@metamask/snaps-sdk").RequestedSnap>;
            }>;
            manifestVersion: "0.1";
            repository?: {
                type: string;
                url: string;
            } | undefined;
            initialConnections?: Record<string & URL, {}> | undefined;
            $schema?: string | undefined;
        }> | null;
        sourceCode: import("@metamask/snaps-utils").VirtualFile<string> | null;
        auxiliaryFiles: import("@metamask/snaps-utils").VirtualFile<unknown>[] | null;
        localizationFiles: import("@metamask/snaps-utils").VirtualFile<{
            locale: string;
            messages: Record<string, {
                message: string;
                description?: string | undefined;
            }>;
        }>[] | null;
        icon?: import("@metamask/snaps-utils").VirtualFile<string> | undefined;
        ui?: import("../features/simulation/slice").HandlerUserInterface | null | undefined;
        snapInterface?: import("../features/simulation/slice").SnapInterface | null | undefined;
        snapState: string | null;
        unencryptedSnapState: string | null;
        requestId?: string | undefined;
    };
    onRpcRequest: import("../features").HandlerState<{
        origin: string;
        request?: import("@metamask/utils").JsonRpcRequest<import("@metamask/utils").JsonRpcParams> | undefined;
    }, {
        error: import("@metamask/utils").JsonRpcError;
        id: string | number | null;
        jsonrpc: "2.0";
    } | import("@metamask/utils").JsonRpcSuccess<import("@metamask/utils").Json>>;
    onCronjob: import("../features").HandlerState<{
        origin: string;
        request?: import("@metamask/utils").JsonRpcRequest<import("@metamask/utils").JsonRpcParams> | undefined;
    }, {
        error: import("@metamask/utils").JsonRpcError;
        id: string | number | null;
        jsonrpc: "2.0";
    } | import("@metamask/utils").JsonRpcSuccess<import("@metamask/utils").Json>>;
    onTransaction: import("../features").HandlerState<{
        request?: import("@metamask/utils").JsonRpcRequest<{
            chainId: string;
            transaction: Record<string, any>;
            transactionOrigin?: string | undefined;
        }> | undefined;
    }, {
        error: import("@metamask/utils").JsonRpcError;
        id: string | number | null;
        jsonrpc: "2.0";
    } | import("@metamask/utils").JsonRpcSuccess<import("@metamask/utils").Json>>;
}>, import("redux").AnyAction>;
