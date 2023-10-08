import type { AddApprovalRequest, UpdateRequestState } from '@metamask/approval-controller';
import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import type { GetEndowments, GetPermissions, GetSubjectMetadata, GetSubjects, GrantPermissions, HasPermission, HasPermissions, RevokeAllPermissions, RevokePermissionForAllSubjects, RevokePermissions, UpdateCaveat } from '@metamask/permission-controller';
import type { BlockReason } from '@metamask/snaps-registry';
import type { InstallSnapsResult, PersistedSnap, RequestedSnapPermissions, Snap, SnapId, SnapRpcHook, SnapRpcHookArgs, StatusContext, StatusEvents, StatusStates, TruncatedSnap, ValidatedSnapId } from '@metamask/snaps-utils';
import { SnapStatusEvents } from '@metamask/snaps-utils';
import type { Json, NonEmptyArray } from '@metamask/utils';
import type { StateMachine } from '@xstate/fsm';
import type { Patch } from 'immer';
import type { ExecuteSnapAction, ExecutionServiceEvents, HandleRpcRequestAction, SnapErrorJson, TerminateAllSnapsAction, TerminateSnapAction } from '../services';
import type { SnapLocation } from './location';
import { detectSnapLocation } from './location';
import type { GetMetadata, GetResult, SnapsRegistryMetadata, Update } from './registry';
import { Timer } from './Timer';
export declare const controllerName = "SnapController";
export declare const SNAP_APPROVAL_INSTALL = "wallet_installSnap";
export declare const SNAP_APPROVAL_UPDATE = "wallet_updateSnap";
export declare const SNAP_APPROVAL_RESULT = "wallet_installSnapResult";
export declare type PendingRequest = {
    requestId: unknown;
    timer: Timer;
};
/**
 * A wrapper type for any data stored during runtime of Snaps.
 * It is not persisted in state as it contains non-serializable data and is only relevant for the
 * current session.
 */
export interface SnapRuntimeData {
    /**
     * A promise that resolves when the Snap has finished installing
     */
    installPromise: null | Promise<PersistedSnap>;
    /**
     * A Unix timestamp for the last time the Snap received an RPC request
     */
    lastRequest: null | number;
    /**
     * The current number of active references where this Snap is being used
     */
    activeReferences: number;
    /**
     * The current pending inbound requests, meaning requests that are processed by snaps.
     */
    pendingInboundRequests: PendingRequest[];
    /**
     * The current pending outbound requests, meaning requests made from snaps towards the MetaMask
     * extension.
     */
    pendingOutboundRequests: number;
    /**
     * RPC handler designated for the Snap
     */
    rpcHandler: null | SnapRpcHook;
    /**
     * The finite state machine interpreter for possible states that the Snap can be in such as
     * stopped, running, blocked
     *
     * @see {@link SnapController:constructor}
     */
    interpreter: StateMachine.Service<StatusContext, StatusEvents, StatusStates>;
}
export declare type SnapError = {
    message: string;
    code: number;
    data?: Json;
};
declare type CloseAllConnectionsFunction = (origin: string) => void;
declare type StoredSnaps = Record<ValidatedSnapId, Snap>;
export declare type SnapControllerState = {
    snaps: StoredSnaps;
    snapStates: Record<ValidatedSnapId, string | null>;
    snapErrors: {
        [internalID: string]: SnapError & {
            internalID: string;
        };
    };
};
export declare type PersistedSnapControllerState = SnapControllerState & {
    snaps: Record<ValidatedSnapId, PersistedSnap>;
    snapStates: Record<ValidatedSnapId, string>;
};
/**
 * Gets the specified Snap from state.
 */
export declare type GetSnap = {
    type: `${typeof controllerName}:get`;
    handler: SnapController['get'];
};
/**
 * Handles sending an inbound request to a snap and returns its result.
 */
export declare type HandleSnapRequest = {
    type: `${typeof controllerName}:handleRequest`;
    handler: SnapController['handleRequest'];
};
/**
 * Gets the specified Snap's persisted state.
 */
export declare type GetSnapState = {
    type: `${typeof controllerName}:getSnapState`;
    handler: SnapController['getSnapState'];
};
/**
 * Checks if the specified snap exists in state.
 */
export declare type HasSnap = {
    type: `${typeof controllerName}:has`;
    handler: SnapController['has'];
};
/**
 * Updates the specified Snap's persisted state.
 */
export declare type UpdateSnapState = {
    type: `${typeof controllerName}:updateSnapState`;
    handler: SnapController['updateSnapState'];
};
/**
 * Clears the specified Snap's persisted state.
 */
export declare type ClearSnapState = {
    type: `${typeof controllerName}:clearSnapState`;
    handler: SnapController['clearSnapState'];
};
/**
 * Checks all installed snaps against the blocklist.
 */
export declare type UpdateBlockedSnaps = {
    type: `${typeof controllerName}:updateBlockedSnaps`;
    handler: SnapController['updateBlockedSnaps'];
};
export declare type EnableSnap = {
    type: `${typeof controllerName}:enable`;
    handler: SnapController['enableSnap'];
};
export declare type DisableSnap = {
    type: `${typeof controllerName}:disable`;
    handler: SnapController['disableSnap'];
};
export declare type RemoveSnap = {
    type: `${typeof controllerName}:remove`;
    handler: SnapController['removeSnap'];
};
export declare type GetPermittedSnaps = {
    type: `${typeof controllerName}:getPermitted`;
    handler: SnapController['getPermittedSnaps'];
};
export declare type GetAllSnaps = {
    type: `${typeof controllerName}:getAll`;
    handler: SnapController['getAllSnaps'];
};
export declare type IncrementActiveReferences = {
    type: `${typeof controllerName}:incrementActiveReferences`;
    handler: SnapController['incrementActiveReferences'];
};
export declare type DecrementActiveReferences = {
    type: `${typeof controllerName}:decrementActiveReferences`;
    handler: SnapController['decrementActiveReferences'];
};
export declare type InstallSnaps = {
    type: `${typeof controllerName}:install`;
    handler: SnapController['installSnaps'];
};
export declare type RemoveSnapError = {
    type: `${typeof controllerName}:removeSnapError`;
    handler: SnapController['removeSnapError'];
};
export declare type GetRegistryMetadata = {
    type: `${typeof controllerName}:getRegistryMetadata`;
    handler: SnapController['getRegistryMetadata'];
};
export declare type DisconnectOrigin = {
    type: `${typeof controllerName}:disconnectOrigin`;
    handler: SnapController['removeSnapFromSubject'];
};
export declare type RevokeDynamicPermissions = {
    type: `${typeof controllerName}:revokeDynamicPermissions`;
    handler: SnapController['revokeDynamicSnapPermissions'];
};
export declare type SnapControllerActions = ClearSnapState | GetSnap | GetSnapState | HandleSnapRequest | HasSnap | UpdateBlockedSnaps | UpdateSnapState | EnableSnap | DisableSnap | RemoveSnap | GetPermittedSnaps | InstallSnaps | RemoveSnapError | GetAllSnaps | IncrementActiveReferences | DecrementActiveReferences | GetRegistryMetadata | DisconnectOrigin | RevokeDynamicPermissions;
export declare type SnapStateChange = {
    type: `${typeof controllerName}:stateChange`;
    payload: [SnapControllerState, Patch[]];
};
/**
 * Emitted when a Snap has been added to state during installation.
 */
export declare type SnapAdded = {
    type: `${typeof controllerName}:snapAdded`;
    payload: [snap: Snap, svgIcon: string | undefined];
};
/**
 * Emitted when an installed snap has been blocked.
 */
export declare type SnapBlocked = {
    type: `${typeof controllerName}:snapBlocked`;
    payload: [snapId: string, blockedSnapInfo?: BlockReason];
};
/**
 * Emitted when a snap has been started after being added and authorized during
 * installation.
 */
export declare type SnapInstalled = {
    type: `${typeof controllerName}:snapInstalled`;
    payload: [snap: TruncatedSnap];
};
/**
 * Emitted when a snap that has previously been fully installed, is uninstalled.
 */
export declare type SnapUninstalled = {
    type: `${typeof controllerName}:snapUninstalled`;
    payload: [snap: TruncatedSnap];
};
/**
 * Emitted when a snap is removed from state, this may happen even
 * if a snap has not fully completed installation.
 */
export declare type SnapRemoved = {
    type: `${typeof controllerName}:snapRemoved`;
    payload: [snap: TruncatedSnap];
};
/**
 * Emitted when an installed snap has been unblocked.
 */
export declare type SnapUnblocked = {
    type: `${typeof controllerName}:snapUnblocked`;
    payload: [snapId: string];
};
/**
 * Emitted when a snap is updated.
 */
export declare type SnapUpdated = {
    type: `${typeof controllerName}:snapUpdated`;
    payload: [snap: TruncatedSnap, oldVersion: string];
};
/**
 * Emitted when a snap is rolled back.
 */
export declare type SnapRolledback = {
    type: `${typeof controllerName}:snapRolledback`;
    payload: [snap: TruncatedSnap, failedVersion: string];
};
/**
 * Emitted when a Snap is terminated. This is different from the snap being
 * stopped as it can also be triggered when a snap fails initialization.
 */
export declare type SnapTerminated = {
    type: `${typeof controllerName}:snapTerminated`;
    payload: [snap: TruncatedSnap];
};
/**
 * Emitted when a Snap is enabled by a user.
 * This is not emitted by default when installing a snap.
 */
export declare type SnapEnabled = {
    type: `${typeof controllerName}:snapEnabled`;
    payload: [snap: TruncatedSnap];
};
/**
 * Emitted when a Snap is disabled by a user.
 */
export declare type SnapDisabled = {
    type: `${typeof controllerName}:snapDisabled`;
    payload: [snap: TruncatedSnap];
};
export declare type SnapControllerEvents = SnapAdded | SnapBlocked | SnapInstalled | SnapUninstalled | SnapRemoved | SnapStateChange | SnapUnblocked | SnapUpdated | SnapRolledback | SnapTerminated | SnapEnabled | SnapDisabled;
export declare type AllowedActions = GetEndowments | GetPermissions | GetSubjects | GetSubjectMetadata | HasPermission | HasPermissions | RevokePermissions | RevokeAllPermissions | RevokePermissionForAllSubjects | GrantPermissions | AddApprovalRequest | HandleRpcRequestAction | ExecuteSnapAction | TerminateAllSnapsAction | TerminateSnapAction | UpdateCaveat | UpdateRequestState | GetResult | GetMetadata | Update;
export declare type AllowedEvents = ExecutionServiceEvents | SnapInstalled | SnapUpdated;
declare type SnapControllerMessenger = RestrictedControllerMessenger<typeof controllerName, SnapControllerActions | AllowedActions, SnapControllerEvents | AllowedEvents, AllowedActions['type'], AllowedEvents['type']>;
declare type FeatureFlags = {
    requireAllowlist?: true;
    allowLocalSnaps?: true;
};
declare type SnapControllerArgs = {
    /**
     * A teardown function that allows the host to clean up its instrumentation
     * for a running snap.
     */
    closeAllConnections: CloseAllConnectionsFunction;
    /**
     * A list of permissions that are allowed to be dynamic, meaning they can be revoked from the snap whenever.
     */
    dynamicPermissions: string[];
    /**
     * The names of endowment permissions whose values are the names of JavaScript
     * APIs that will be added to the snap execution environment at runtime.
     */
    environmentEndowmentPermissions: string[];
    /**
     * Excluded permissions with its associated error message used to forbid certain permssions.
     */
    excludedPermissions: Record<string, string>;
    /**
     * The function that will be used by the controller fo make network requests.
     * Should be compatible with {@link fetch}.
     */
    fetchFunction?: typeof fetch;
    /**
     * Flags that enable or disable features in the controller.
     * See {@link FeatureFlags}.
     */
    featureFlags: FeatureFlags;
    /**
     * How frequently to check whether a snap is idle.
     */
    idleTimeCheckInterval?: number;
    /**
     * The maximum amount of time that a snap may be idle.
     */
    maxIdleTime?: number;
    /**
     * The controller messenger.
     */
    messenger: SnapControllerMessenger;
    /**
     * The maximum amount of time a snap may take to process an RPC request,
     * unless it is permitted to take longer.
     */
    maxRequestTime?: number;
    /**
     * The npm registry URL that will be used to fetch published snaps.
     */
    npmRegistryUrl?: string;
    /**
     * Persisted state that will be used for rehydration.
     */
    state?: PersistedSnapControllerState;
    /**
     * A function that takes Snap Id and converts it into a class that fetches files.
     *
     * Used for test overrides.
     */
    detectSnapLocation?: typeof detectSnapLocation;
};
export declare class SnapController extends BaseController<string, SnapControllerState, SnapControllerMessenger> {
    #private;
    private readonly maxRequestTime;
    constructor({ closeAllConnections, messenger, state, dynamicPermissions, environmentEndowmentPermissions, excludedPermissions, idleTimeCheckInterval, maxIdleTime, maxRequestTime, fetchFunction, featureFlags, detectSnapLocation: detectSnapLocationFunction, }: SnapControllerArgs);
    /**
     * Checks all installed snaps against the block list and
     * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
     * for more information.
     */
    updateBlockedSnaps(): Promise<void>;
    _onUnhandledSnapError(snapId: SnapId, error: SnapErrorJson): void;
    _onOutboundRequest(snapId: SnapId): void;
    _onOutboundResponse(snapId: SnapId): void;
    /**
     * Starts the given snap. Throws an error if no such snap exists
     * or if it is already running.
     *
     * @param snapId - The id of the Snap to start.
     */
    startSnap(snapId: ValidatedSnapId): Promise<void>;
    /**
     * Enables the given snap. A snap can only be started if it is enabled. A snap
     * can only be enabled if it isn't blocked.
     *
     * @param snapId - The id of the Snap to enable.
     */
    enableSnap(snapId: ValidatedSnapId): void;
    /**
     * Disables the given snap. A snap can only be started if it is enabled.
     *
     * @param snapId - The id of the Snap to disable.
     * @returns A promise that resolves once the snap has been disabled.
     */
    disableSnap(snapId: ValidatedSnapId): Promise<void>;
    /**
     * Stops the given snap, removes all hooks, closes all connections, and
     * terminates its worker.
     *
     * @param snapId - The id of the Snap to stop.
     * @param statusEvent - The Snap status event that caused the snap to be
     * stopped.
     */
    stopSnap(snapId: ValidatedSnapId, statusEvent?: SnapStatusEvents.Stop | SnapStatusEvents.Crash): Promise<void>;
    /**
     * Returns whether the given snap is running.
     * Throws an error if the snap doesn't exist.
     *
     * @param snapId - The id of the Snap to check.
     * @returns `true` if the snap is running, otherwise `false`.
     */
    isRunning(snapId: ValidatedSnapId): boolean;
    /**
     * Returns whether the given snap has been added to state.
     *
     * @param snapId - The id of the Snap to check for.
     * @returns `true` if the snap exists in the controller state, otherwise `false`.
     */
    has(snapId: ValidatedSnapId): boolean;
    /**
     * Gets the snap with the given id if it exists, including all data.
     * This should not be used if the snap is to be serializable, as e.g.
     * the snap sourceCode may be quite large.
     *
     * @param snapId - The id of the Snap to get.
     * @returns The entire snap object from the controller state.
     */
    get(snapId: SnapId): Snap | undefined;
    /**
     * Gets the snap with the given id, throws if doesn't.
     * This should not be used if the snap is to be serializable, as e.g.
     * the snap sourceCode may be quite large.
     *
     * @see {@link SnapController.get}
     * @throws {@link Error}. If the snap doesn't exist
     * @param snapId - The id of the snap to get.
     * @returns The entire snap object.
     */
    getExpect(snapId: ValidatedSnapId): Snap;
    /**
     * Gets the snap with the given id if it exists, excluding any
     * non-serializable or expensive-to-serialize data.
     *
     * @param snapId - The id of the Snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    getTruncated(snapId: ValidatedSnapId): TruncatedSnap | null;
    /**
     * Gets the snap with the given id, throw if it doesn't exist.
     *
     * @throws {@link Error}. If snap doesn't exist
     * @param snapId - The id of the snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    getTruncatedExpect(snapId: ValidatedSnapId): TruncatedSnap;
    /**
     * Updates the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be updated.
     * @param newSnapState - The new state of the snap.
     */
    updateSnapState(snapId: ValidatedSnapId, newSnapState: string): Promise<void>;
    /**
     * Clears the state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be cleared.
     */
    clearSnapState(snapId: ValidatedSnapId): void;
    /**
     * Adds error from a snap to the SnapController state.
     *
     * @param snapError - The error to store on the SnapController.
     */
    addSnapError(snapError: SnapError): void;
    /**
     * Removes an error by internalID from the SnapControllers state.
     *
     * @param internalID - The internal error ID to remove on the SnapController.
     */
    removeSnapError(internalID: string): void;
    /**
     * Clears all errors from the SnapControllers state.
     */
    clearSnapErrors(): void;
    /**
     * Gets the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state to get.
     * @returns A promise that resolves with the decrypted snap state or null if no state exists.
     * @throws If the snap state decryption fails.
     */
    getSnapState(snapId: ValidatedSnapId): Promise<Json>;
    /**
     * Completely clear the controller's state: delete all associated data,
     * handlers, event listeners, and permissions; tear down all snap providers.
     */
    clearState(): Promise<void>;
    /**
     * Removes the given snap from state, and clears all associated handlers
     * and listeners.
     *
     * @param snapId - The id of the Snap.
     * @returns A promise that resolves once the snap has been removed.
     */
    removeSnap(snapId: ValidatedSnapId): Promise<void>;
    /**
     * Stops the given snaps, removes them from state, and clears all associated
     * permissions, handlers, and listeners.
     *
     * @param snapIds - The ids of the Snaps.
     */
    removeSnaps(snapIds: ValidatedSnapId[]): Promise<void>;
    /**
     * Removes a snap's permission (caveat) from the specified subject.
     *
     * @param origin - The origin from which to remove the snap.
     * @param snapId - The id of the snap to remove.
     */
    removeSnapFromSubject(origin: string, snapId: ValidatedSnapId): void;
    /**
     * Checks if a list of permissions are dynamic and allowed to be revoked, if they are they will all be revoked.
     *
     * @param snapId - The snap ID.
     * @param permissionNames - The names of the permissions.
     * @throws If non-dynamic permissions are passed.
     */
    revokeDynamicSnapPermissions(snapId: string, permissionNames: NonEmptyArray<string>): void;
    /**
     * Handles incrementing the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced.
     */
    incrementActiveReferences(snapId: ValidatedSnapId): void;
    /**
     * Handles decrement the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced..
     */
    decrementActiveReferences(snapId: ValidatedSnapId): void;
    /**
     * Gets all snaps in their truncated format.
     *
     * @returns All installed snaps in their truncated format.
     */
    getAllSnaps(): TruncatedSnap[];
    /**
     * Gets the serialized permitted snaps of the given origin, if any.
     *
     * @param origin - The origin whose permitted snaps to retrieve.
     * @returns The serialized permitted snaps for the origin.
     */
    getPermittedSnaps(origin: string): InstallSnapsResult;
    /**
     * Installs the snaps requested by the given origin, returning the snap
     * object if the origin is permitted to install it, and an authorization error
     * otherwise.
     *
     * @param origin - The origin that requested to install the snaps.
     * @param requestedSnaps - The snaps to install.
     * @returns An object of snap ids and snap objects, or errors if a
     * snap couldn't be installed.
     */
    installSnaps(origin: string, requestedSnaps: RequestedSnapPermissions): Promise<InstallSnapsResult>;
    /**
     * Adds, authorizes, and runs the given snap with a snap provider.
     * Results from this method should be efficiently serializable.
     *
     * @param origin - The origin requesting the snap.
     * @param snapId - The id of the snap.
     * @param location - The location implementation of the snap.
     * @param versionRange - The semver range of the snap to install.
     * @returns The resulting snap object, or an error if something went wrong.
     */
    private processRequestedSnap;
    /**
     * Updates an installed snap. The flow is similar to
     * {@link SnapController.installSnaps}. The user will be asked if they want
     * to update, then approve any permission changes, and finally the snap will
     * be restarted.
     *
     * The update will fail if the user rejects any prompt or if the new version
     * of the snap is blocked.
     *
     * If the original version of the snap was blocked and the update succeeded,
     * the snap will be unblocked and enabled before it is restarted.
     *
     * @param origin - The origin requesting the snap update.
     * @param snapId - The id of the Snap to be updated.
     * @param location - The location implementation of the snap.
     * @param newVersionRange - A semver version range in which the maximum version will be chosen.
     * @param emitEvent - An optional boolean flag to indicate whether this update should emit an event.
     * @returns The snap metadata if updated, `null` otherwise.
     */
    updateSnap(origin: string, snapId: ValidatedSnapId, location: SnapLocation, newVersionRange?: string, emitEvent?: boolean): Promise<TruncatedSnap>;
    /**
     * Get metadata for the given snap ID.
     *
     * @param snapId - The ID of the snap to get metadata for.
     * @returns The metadata for the given snap ID, or `null` if the snap is not
     * verified.
     */
    getRegistryMetadata(snapId: ValidatedSnapId): Promise<SnapsRegistryMetadata | null>;
    /**
     * Initiates a request for the given snap's initial permissions.
     * Must be called in order. See processRequestedSnap.
     *
     * This function is not hash private yet because of tests.
     *
     * @param snapId - The id of the Snap.
     * @param pendingApproval - Pending approval to update.
     * @returns The snap's approvedPermissions.
     */
    private authorize;
    destroy(): void;
    /**
     * Passes a JSON-RPC request object to the RPC handler function of a snap.
     *
     * @param options - A bag of options.
     * @param options.snapId - The ID of the recipient snap.
     * @param options.origin - The origin of the RPC request.
     * @param options.handler - The handler to trigger on the snap for the request.
     * @param options.request - The JSON-RPC request object.
     * @returns The result of the JSON-RPC request.
     */
    handleRequest({ snapId, origin, handler: handlerType, request: rawRequest, }: SnapRpcHookArgs & {
        snapId: ValidatedSnapId;
    }): Promise<unknown>;
}
export {};
