import type { GenericPermissionController, SubjectMetadataController } from '@metamask/permission-controller';
import type { IframeExecutionService, SnapInterfaceController, StoredInterface } from '@metamask/snaps-controllers';
import type { DialogType } from '@metamask/snaps-sdk';
import type { LocalizationFile, SnapManifest, SnapRpcHookArgs, VirtualFile } from '@metamask/snaps-utils';
export declare enum SnapStatus {
    Ok = "ok",
    Loading = "loading",
    Error = "error"
}
export declare type HandlerUserInterface = {
    type: DialogType;
    snapId: string;
    snapName: string;
    id: string;
};
export declare type SnapInterface = StoredInterface & {
    id: string;
};
declare type SimulationState = {
    status: SnapStatus;
    executionService: IframeExecutionService | null;
    permissionController: GenericPermissionController | null;
    subjectMetadataController: SubjectMetadataController | null;
    snapInterfaceController: SnapInterfaceController | null;
    manifest: VirtualFile<SnapManifest> | null;
    sourceCode: VirtualFile<string> | null;
    auxiliaryFiles: VirtualFile[] | null;
    localizationFiles: VirtualFile<LocalizationFile>[] | null;
    icon?: VirtualFile<string>;
    ui?: HandlerUserInterface | null;
    snapInterface?: SnapInterface | null;
    snapState: string | null;
    unencryptedSnapState: string | null;
    requestId?: string;
};
export declare const INITIAL_STATE: SimulationState;
export declare const resolveUserInterface: import("@reduxjs/toolkit").ActionCreatorWithNonInferrablePayload<string>;
export declare const setStatus: import("@reduxjs/toolkit").ActionCreatorWithPayload<SnapStatus, "simulation/setStatus">, setExecutionService: import("@reduxjs/toolkit").ActionCreatorWithPayload<IframeExecutionService, "simulation/setExecutionService">, setPermissionController: import("@reduxjs/toolkit").ActionCreatorWithPayload<GenericPermissionController, "simulation/setPermissionController">, setSubjectMetadataController: import("@reduxjs/toolkit").ActionCreatorWithPayload<SubjectMetadataController, "simulation/setSubjectMetadataController">, setSnapInterfaceController: import("@reduxjs/toolkit").ActionCreatorWithPayload<SnapInterfaceController, "simulation/setSnapInterfaceController">, setManifest: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<{
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
}>, "simulation/setManifest">, setSourceCode: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<string>, "simulation/setSourceCode">, setIcon: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<string>, "simulation/setIcon">, setAuxiliaryFiles: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<unknown>[], "simulation/setAuxiliaryFiles">, setLocalizationFiles: import("@reduxjs/toolkit").ActionCreatorWithPayload<VirtualFile<{
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
}>[], "simulation/setLocalizationFiles">, setSnapInterface: import("@reduxjs/toolkit").ActionCreatorWithPayload<SnapInterface, "simulation/setSnapInterface">, setSnapInterfaceState: import("@reduxjs/toolkit").ActionCreatorWithPayload<Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | Record<string, string | boolean | {
    name: string;
    size: number;
    contentType: string;
    contents: string;
} | null> | null>, "simulation/setSnapInterfaceState">, showUserInterface: import("@reduxjs/toolkit").ActionCreatorWithPayload<HandlerUserInterface, "simulation/showUserInterface">, closeUserInterface: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"simulation/closeUserInterface">, setSnapState: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | null, "simulation/setSnapState">, setUnencryptedSnapState: import("@reduxjs/toolkit").ActionCreatorWithPayload<string | null, "simulation/setUnencryptedSnapState">, sendRequest: import("@reduxjs/toolkit").ActionCreatorWithPayload<SnapRpcHookArgs, "simulation/sendRequest">;
export declare const simulation: import("redux").Reducer<SimulationState, import("redux").AnyAction>;
export declare const getStatus: ((state: {
    simulation: typeof INITIAL_STATE;
}) => SnapStatus) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => SnapStatus, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getExecutionService: ((state: {
    simulation: typeof INITIAL_STATE;
}) => IframeExecutionService | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => IframeExecutionService | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getPermissionController: ((state: {
    simulation: typeof INITIAL_STATE;
}) => GenericPermissionController | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => GenericPermissionController | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSubjectMetadataController: ((state: {
    simulation: typeof INITIAL_STATE;
}) => SubjectMetadataController | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => SubjectMetadataController | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapInterfaceController: ((state: {
    simulation: typeof INITIAL_STATE;
}) => SnapInterfaceController | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => SnapInterfaceController | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapInterface: ((state: {
    simulation: typeof INITIAL_STATE;
}) => SnapInterface | null | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => SnapInterface | null | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapInterfaceContent: ((state: {
    simulation: typeof INITIAL_STATE;
}) => import("@metamask/snaps-sdk/jsx").JSXElement | undefined) & import("reselect").OutputSelectorFields<(args_0: SnapInterface | null | undefined) => import("@metamask/snaps-sdk/jsx").JSXElement | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapName: ((state: {
    simulation: typeof INITIAL_STATE;
}) => string | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => string | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getIcon: ((state: {
    simulation: typeof INITIAL_STATE;
}) => VirtualFile<string> | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => VirtualFile<string> | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getUserInterface: ((state: {
    simulation: typeof INITIAL_STATE;
}) => HandlerUserInterface | null | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => HandlerUserInterface | null | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapStateSelector: ((state: {
    simulation: typeof INITIAL_STATE;
}) => string | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => string | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getUnencryptedSnapStateSelector: ((state: {
    simulation: typeof INITIAL_STATE;
}) => string | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => string | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSnapManifest: ((state: {
    simulation: typeof INITIAL_STATE;
}) => {
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
} | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => {
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
} | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getLocalizedSnapManifest: ((state: {
    simulation: typeof INITIAL_STATE;
}) => {
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
} | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => {
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
} | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getSourceCode: ((state: {
    simulation: typeof INITIAL_STATE;
}) => VirtualFile<string> | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => VirtualFile<string> | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getAuxiliaryFiles: ((state: {
    simulation: typeof INITIAL_STATE;
}) => VirtualFile<unknown>[] | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => VirtualFile<unknown>[] | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getLocalizationFiles: ((state: {
    simulation: typeof INITIAL_STATE;
}) => VirtualFile<{
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
}>[] | null) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => VirtualFile<{
    locale: string;
    messages: Record<string, {
        message: string;
        description?: string | undefined;
    }>;
}>[] | null, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export declare const getRequestId: ((state: {
    simulation: typeof INITIAL_STATE;
}) => string | undefined) & import("reselect").OutputSelectorFields<(args_0: SimulationState) => string | undefined, {
    clearCache: () => void;
}> & {
    clearCache: () => void;
};
export {};
