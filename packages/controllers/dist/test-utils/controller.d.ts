import { ControllerMessenger } from '@metamask/controllers';
import { AllowedActions, PersistedSnapControllerState, SnapController, SnapControllerActions, SnapControllerEvents } from '../snaps';
import { CronjobControllerEvents } from '../cronjob/CronjobController';
export declare const getControllerMessenger: () => ControllerMessenger<SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents>;
export declare const getSnapControllerMessenger: (messenger?: ControllerMessenger<SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents>, mocked?: boolean) => import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("@metamask/controllers").RevokePermissions | import("@metamask/controllers").RevokeAllPermissions | import("@metamask/controllers").RevokePermissionForAllSubjects | import("@metamask/controllers").GetEndowments | import("..").HandleRpcRequestAction | import("..").ExecuteSnapAction | import("..").TerminateSnapAction | import("..").TerminateAllSnapsAction | import("../snaps").GetSnap | import("../snaps").HandleSnapRequest | import("../snaps").GetSnapState | import("../snaps").HasSnap | import("../snaps").UpdateSnapState | import("../snaps").ClearSnapState | import("../snaps").UpdateBlockedSnaps | import("../snaps").EnableSnap | import("../snaps").DisableSnap | import("../snaps").RemoveSnap | import("../snaps").GetPermittedSnaps | import("../snaps").GetAllSnaps | import("../snaps").IncrementActiveReferences | import("../snaps").DecrementActiveReferences | import("../snaps").InstallSnaps | import("../snaps").RemoveSnapError, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("../snaps").SnapStateChange | import("../snaps").SnapAdded | import("../snaps").SnapBlocked | import("../snaps").SnapInstalled | import("../snaps").SnapRemoved | import("../snaps").SnapUnblocked | import("../snaps").SnapUpdated | import("../snaps").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps" | "SnapController:get" | "SnapController:handleRequest" | "SnapController:getSnapState" | "SnapController:has" | "SnapController:updateSnapState" | "SnapController:clearSnapState" | "SnapController:updateBlockedSnaps" | "SnapController:enable" | "SnapController:disable" | "SnapController:remove" | "SnapController:getPermitted" | "SnapController:getAll" | "SnapController:incrementActiveReferences" | "SnapController:decrementActiveReferences" | "SnapController:install" | "SnapController:removeSnapError", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse" | "SnapController:stateChange" | "SnapController:snapAdded" | "SnapController:snapBlocked" | "SnapController:snapInstalled" | "SnapController:snapRemoved" | "SnapController:snapUnblocked" | "SnapController:snapUpdated" | "SnapController:snapTerminated">;
export declare type SnapControllerConstructorParams = ConstructorParameters<typeof SnapController>[0];
export declare type PartialSnapControllerConstructorParams = Partial<Omit<ConstructorParameters<typeof SnapController>[0], 'state'> & {
    state: Partial<SnapControllerConstructorParams['state']>;
}>;
export declare const getSnapControllerOptions: (opts?: Partial<Omit<{
    closeAllConnections: (origin: string) => void;
    environmentEndowmentPermissions: string[];
    fetchFunction?: typeof fetch | undefined;
    featureFlags: {
        dappsCanUpdateSnaps?: true | undefined;
    };
    getAppKey: (subject: string, appKeyType: import("../snaps").AppKeyType) => Promise<string>;
    idleTimeCheckInterval?: number | undefined;
    checkBlockList: import("../snaps").CheckSnapBlockList;
    maxIdleTime?: number | undefined;
    messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    maxRequestTime?: number | undefined;
    npmRegistryUrl?: string | undefined;
    state?: PersistedSnapControllerState | undefined;
}, "state"> & {
    state: Partial<SnapControllerConstructorParams['state']>;
}> | undefined) => {
    closeAllConnections: (origin: string) => void;
    environmentEndowmentPermissions: string[];
    fetchFunction?: typeof fetch | undefined;
    featureFlags: {
        dappsCanUpdateSnaps?: true | undefined;
    };
    getAppKey: (subject: string, appKeyType: import("../snaps").AppKeyType) => Promise<string>;
    idleTimeCheckInterval?: number | undefined;
    checkBlockList: import("../snaps").CheckSnapBlockList;
    maxIdleTime?: number | undefined;
    messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    maxRequestTime?: number | undefined;
    npmRegistryUrl?: string | undefined;
    state?: PersistedSnapControllerState | undefined;
};
export declare type GetSnapControllerWithEESOptionsParam = Omit<PartialSnapControllerConstructorParams, 'messenger'> & {
    rootMessenger?: ReturnType<typeof getControllerMessenger>;
};
export declare const getSnapControllerWithEESOptions: (opts?: GetSnapControllerWithEESOptionsParam) => {
    closeAllConnections: (origin: string) => void;
    environmentEndowmentPermissions: string[];
    fetchFunction?: typeof fetch | undefined;
    featureFlags: {
        dappsCanUpdateSnaps?: true | undefined;
    };
    getAppKey: (subject: string, appKeyType: import("../snaps").AppKeyType) => Promise<string>;
    idleTimeCheckInterval?: number | undefined;
    checkBlockList: import("../snaps").CheckSnapBlockList;
    maxIdleTime?: number | undefined;
    messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    maxRequestTime?: number | undefined;
    npmRegistryUrl?: string | undefined;
    state?: PersistedSnapControllerState | undefined;
} & {
    rootMessenger: ControllerMessenger<SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents>;
};
export declare const getSnapController: (options?: {
    closeAllConnections: (origin: string) => void;
    environmentEndowmentPermissions: string[];
    fetchFunction?: typeof fetch | undefined;
    featureFlags: {
        dappsCanUpdateSnaps?: true | undefined;
    };
    getAppKey: (subject: string, appKeyType: import("../snaps").AppKeyType) => Promise<string>;
    idleTimeCheckInterval?: number | undefined;
    checkBlockList: import("../snaps").CheckSnapBlockList;
    maxIdleTime?: number | undefined;
    messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    maxRequestTime?: number | undefined;
    npmRegistryUrl?: string | undefined;
    state?: PersistedSnapControllerState | undefined;
}) => SnapController;
export declare const getSnapControllerWithEES: (options?: {
    closeAllConnections: (origin: string) => void;
    environmentEndowmentPermissions: string[];
    fetchFunction?: typeof fetch | undefined;
    featureFlags: {
        dappsCanUpdateSnaps?: true | undefined;
    };
    getAppKey: (subject: string, appKeyType: import("../snaps").AppKeyType) => Promise<string>;
    idleTimeCheckInterval?: number | undefined;
    checkBlockList: import("../snaps").CheckSnapBlockList;
    maxIdleTime?: number | undefined;
    messenger: import("@metamask/controllers").RestrictedControllerMessenger<"SnapController", SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse">;
    maxRequestTime?: number | undefined;
    npmRegistryUrl?: string | undefined;
    state?: PersistedSnapControllerState | undefined;
} & {
    rootMessenger: ControllerMessenger<SnapControllerActions | AllowedActions, import("..").ExecutionServiceEvents | SnapControllerEvents>;
}, service?: import("..").NodeThreadExecutionService | undefined) => readonly [SnapController, import("..").NodeThreadExecutionService];
export declare const getPersistedSnapsState: (...snaps: PersistedSnapControllerState['snaps'][string][]) => PersistedSnapControllerState['snaps'];
export declare const getRootCronjobControllerMessenger: () => ControllerMessenger<import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("@metamask/controllers").RevokePermissions | import("@metamask/controllers").RevokeAllPermissions | import("@metamask/controllers").RevokePermissionForAllSubjects | import("@metamask/controllers").GetEndowments | import("..").HandleRpcRequestAction | import("..").ExecuteSnapAction | import("..").TerminateSnapAction | import("..").TerminateAllSnapsAction | import("../snaps").GetSnap | import("../snaps").HandleSnapRequest | import("../snaps").GetAllSnaps, import("..").ExecutionServiceEvents | CronjobControllerEvents>;
export declare const getRestrictedCronjobControllerMessenger: (messenger?: ControllerMessenger<import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("@metamask/controllers").RevokePermissions | import("@metamask/controllers").RevokeAllPermissions | import("@metamask/controllers").RevokePermissionForAllSubjects | import("@metamask/controllers").GetEndowments | import("..").HandleRpcRequestAction | import("..").ExecuteSnapAction | import("..").TerminateSnapAction | import("..").TerminateAllSnapsAction | import("../snaps").GetSnap | import("../snaps").HandleSnapRequest | import("../snaps").GetAllSnaps, import("..").ExecutionServiceEvents | CronjobControllerEvents>, mocked?: boolean) => import("@metamask/controllers").RestrictedControllerMessenger<"CronjobController", import("@metamask/controllers").AddApprovalRequest | import("@metamask/controllers").GetPermissions | import("@metamask/controllers").HasPermissions | import("@metamask/controllers").HasPermission | import("@metamask/controllers").GrantPermissions | import("@metamask/controllers").RevokePermissions | import("@metamask/controllers").RevokeAllPermissions | import("@metamask/controllers").RevokePermissionForAllSubjects | import("@metamask/controllers").GetEndowments | import("..").HandleRpcRequestAction | import("..").ExecuteSnapAction | import("..").TerminateSnapAction | import("..").TerminateAllSnapsAction | import("../snaps").GetSnap | import("../snaps").HandleSnapRequest | import("../snaps").GetAllSnaps, import("..").ErrorMessageEvent | import("..").OutboundRequest | import("..").OutboundResponse | import("../snaps").SnapAdded | import("../snaps").SnapBlocked | import("../snaps").SnapInstalled | import("../snaps").SnapRemoved | import("../snaps").SnapUnblocked | import("../snaps").SnapUpdated | import("../snaps").SnapTerminated, "ApprovalController:addRequest" | "PermissionController:getPermissions" | "PermissionController:hasPermissions" | "PermissionController:hasPermission" | "PermissionController:grantPermissions" | "PermissionController:revokePermissions" | "PermissionController:revokeAllPermissions" | "PermissionController:revokePermissionForAllSubjects" | "PermissionController:getEndowments" | "ExecutionService:handleRpcRequest" | "ExecutionService:executeSnap" | "ExecutionService:terminateSnap" | "ExecutionService:terminateAllSnaps" | "SnapController:get" | "SnapController:handleRequest" | "SnapController:getAll", "ExecutionService:unhandledError" | "ExecutionService:outboundRequest" | "ExecutionService:outboundResponse" | "SnapController:snapAdded" | "SnapController:snapBlocked" | "SnapController:snapInstalled" | "SnapController:snapRemoved" | "SnapController:snapUnblocked" | "SnapController:snapUpdated" | "SnapController:snapTerminated">;
