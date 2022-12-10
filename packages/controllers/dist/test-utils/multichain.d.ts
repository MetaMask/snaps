import { SnapEndowments } from '..';
import { MultiChainController } from '../multichain';
export declare const getMultiChainControllerMessenger: (messenger?: import("@metamask/controllers").ControllerMessenger<import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents>) => import("@metamask/controllers").RestrictedControllerMessenger<"MultiChainController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("..").HandleSnapRequest | import("..").GetAllSnaps | import("..").IncrementActiveReferences | import("..").DecrementActiveReferences, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("..").SnapStateChange | import("..").SnapAdded | import("..").SnapBlocked | import("..").SnapInstalled | import("..").SnapRemoved | import("..").SnapUnblocked | import("..").SnapUpdated | import("..").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "SnapController:handleRequest" | "SnapController:getAll" | "SnapController:incrementActiveReferences" | "SnapController:decrementActiveReferences", string>;
export declare const getMultiChainController: () => {
    rootMessenger: import("@metamask/controllers").ControllerMessenger<import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents>;
    multiChainControllerMessenger: import("@metamask/controllers").RestrictedControllerMessenger<"MultiChainController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("..").HandleSnapRequest | import("..").GetAllSnaps | import("..").IncrementActiveReferences | import("..").DecrementActiveReferences, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("..").SnapStateChange | import("..").SnapAdded | import("..").SnapBlocked | import("..").SnapInstalled | import("..").SnapRemoved | import("..").SnapUnblocked | import("..").SnapUpdated | import("..").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "SnapController:handleRequest" | "SnapController:getAll" | "SnapController:incrementActiveReferences" | "SnapController:decrementActiveReferences", string>;
    multiChainController: MultiChainController;
    snapController: import("..").SnapController;
    snapControllerMessenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("@metamask/controllers").RevokePermissions | import("@metamask/controllers").RevokeAllPermissions | import("@metamask/controllers").RevokePermissionForAllSubjects | import("@metamask/controllers").GetEndowments | import("..").HandleRpcRequestAction | import("..").ExecuteSnapAction | import("..").TerminateSnapAction | import("..").TerminateAllSnapsAction | import("..").GetSnap | import("..").HandleSnapRequest | import("..").GetSnapState | import("..").HasSnap | import("..").UpdateSnapState | import("..").ClearSnapState | import("..").UpdateBlockedSnaps | import("..").EnableSnap | import("..").DisableSnap | import("..").RemoveSnap | import("..").GetPermittedSnaps | import("..").GetAllSnaps | import("..").IncrementActiveReferences | import("..").DecrementActiveReferences | import("..").InstallSnaps | import("..").RemoveSnapError, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("..").SnapStateChange | import("..").SnapAdded | import("..").SnapBlocked | import("..").SnapInstalled | import("..").SnapRemoved | import("..").SnapUnblocked | import("..").SnapUpdated | import("..").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps" | "SnapController:get" | "SnapController:handleRequest" | "SnapController:getSnapState" | "SnapController:has" | "SnapController:updateSnapState" | "SnapController:clearSnapState" | "SnapController:updateBlockedSnaps" | "SnapController:enable" | "SnapController:disable" | "SnapController:remove" | "SnapController:getPermitted" | "SnapController:getAll" | "SnapController:incrementActiveReferences" | "SnapController:decrementActiveReferences" | "SnapController:install" | "SnapController:removeSnapError", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse" | "SnapController:stateChange" | "SnapController:snapAdded" | "SnapController:snapBlocked" | "SnapController:snapInstalled" | "SnapController:snapRemoved" | "SnapController:snapUnblocked" | "SnapController:snapUpdated" | "SnapController:snapTerminated">;
};
export declare const getMultiChainControllerWithEES: (options?: {
    snapControllerOptions: {
        closeAllConnections: (origin: string) => void;
        environmentEndowmentPermissions: string[];
        fetchFunction?: typeof fetch | undefined;
        featureFlags: {
            dappsCanUpdateSnaps?: true | undefined;
        };
        getAppKey: (subject: string, appKeyType: import("..").AppKeyType) => Promise<string>;
        idleTimeCheckInterval?: number | undefined;
        checkBlockList: import("..").CheckSnapBlockList;
        maxIdleTime?: number | undefined;
        messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
        maxRequestTime?: number | undefined;
        npmRegistryUrl?: string | undefined;
        state?: import("..").PersistedSnapControllerState | undefined;
    } & {
        rootMessenger: import("@metamask/controllers").ControllerMessenger<import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents>;
    };
}) => {
    rootMessenger: import("@metamask/controllers").ControllerMessenger<import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents>;
    multiChainControllerMessenger: import("@metamask/controllers").RestrictedControllerMessenger<"MultiChainController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("..").HandleSnapRequest | import("..").GetAllSnaps | import("..").IncrementActiveReferences | import("..").DecrementActiveReferences, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("..").SnapStateChange | import("..").SnapAdded | import("..").SnapBlocked | import("..").SnapInstalled | import("..").SnapRemoved | import("..").SnapUnblocked | import("..").SnapUpdated | import("..").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "SnapController:handleRequest" | "SnapController:getAll" | "SnapController:incrementActiveReferences" | "SnapController:decrementActiveReferences", string>;
    multiChainController: MultiChainController;
    snapController: import("..").SnapController;
    snapControllerMessenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", import("..").SnapControllerActions | import("..").AllowedActions, import("..").ExecutionServiceEvents | import("..").SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    executionService: import("..").NodeThreadExecutionService;
};
export declare const MOCK_EIP155_NAMESPACE: {
    methods: string[];
    events: string[];
    chains: {
        id: string;
        name: string;
    }[];
};
export declare const MOCK_BIP122_NAMESPACE: {
    methods: string[];
    chains: {
        id: string;
        name: string;
    }[];
};
export declare const MOCK_NAMESPACES: {
    eip155: {
        methods: string[];
        events: string[];
        chains: {
            id: string;
            name: string;
        }[];
    };
    bip122: {
        methods: string[];
        chains: {
            id: string;
            name: string;
        }[];
    };
};
export declare const MOCK_EIP155_NAMESPACE_REQUEST: {
    chains: string[];
    methods: string[];
    events: string[];
};
export declare const MOCK_BIP122_NAMESPACE_REQUEST: {
    chains: string[];
    methods: string[];
};
export declare const MOCK_NAMESPACES_REQUEST: {
    eip155: {
        chains: string[];
        methods: string[];
        events: string[];
    };
    bip122: {
        chains: string[];
        methods: string[];
    };
};
export declare const MOCK_CONNECT_ARGUMENTS: {
    requiredNamespaces: {
        eip155: {
            chains: string[];
            methods: string[];
            events: string[];
        };
        bip122: {
            chains: string[];
            methods: string[];
        };
    };
};
export declare const MOCK_KEYRING_BUNDLE = "\nclass Keyring {\n  async getAccounts() {\n    return ['eip155:1:foo'];\n  }\n  async handleRequest({request}) {\n    switch(request.method){\n      case 'eth_accounts':\n        return this.getAccounts();\n    }\n  }\n}\nmodule.exports.keyring = new Keyring();";
export declare const PERSISTED_MOCK_KEYRING_SNAP: import("@metamask/snap-utils").PersistedSnap;
export declare const MOCK_KEYRING_PERMISSION: {
    caveats: {
        type: string;
        value: {
            namespaces: {
                eip155: {
                    methods: string[];
                    events: string[];
                    chains: {
                        id: string;
                        name: string;
                    }[];
                };
                bip122: {
                    methods: string[];
                    chains: {
                        id: string;
                        name: string;
                    }[];
                };
            };
        };
    }[];
    date: number;
    id: string;
    invoker: string;
    parentCapability: SnapEndowments;
};
