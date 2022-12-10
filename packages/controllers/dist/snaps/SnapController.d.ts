import { AddApprovalRequest, BaseControllerV2 as BaseController, GetEndowments, GetPermissions, GrantPermissions, HasPermission, HasPermissions, RestrictedControllerMessenger, RevokeAllPermissions, RevokePermissionForAllSubjects, RevokePermissions } from '@metamask/controllers';
import { SnapId, SnapRpcHook, SnapRpcHookArgs, ValidatedSnapId, Snap, StatusContext, StatusEvents, StatusStates, BlockedSnapInfo, TruncatedSnap, InstallSnapsResult, RequestedSnapPermissions, SnapStatusEvents, PersistedSnap } from '@metamask/snap-utils';
import { Json } from '@metamask/utils';
import { StateMachine } from '@xstate/fsm';
import type { Patch } from 'immer';
import { ExecuteSnapAction, ExecutionServiceEvents, HandleRpcRequestAction, SnapErrorJson, TerminateAllSnapsAction, TerminateSnapAction } from '../services/ExecutionService';
import { Timer } from './Timer';
export declare const controllerName = "SnapController";
export declare const SNAP_APPROVAL_INSTALL = "wallet_installSnap";
export declare const SNAP_APPROVAL_UPDATE = "wallet_updateSnap";
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
    /**
     * The snap source code
     */
    sourceCode: null | string;
    /**
     * The snap state (encrypted)
     */
    state: null | string;
}
export declare type SnapError = {
    message: string;
    code: number;
    data?: Json;
};
declare type CloseAllConnectionsFunction = (origin: string) => void;
declare type StoredSnaps = Record<SnapId, Snap>;
export declare type SnapControllerState = {
    snaps: StoredSnaps;
    snapStates: {};
    snapErrors: {
        [internalID: string]: SnapError & {
            internalID: string;
        };
    };
};
export declare type PersistedSnapControllerState = SnapControllerState & {
    snaps: Record<SnapId, PersistedSnap>;
    snapStates: Record<SnapId, string>;
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
export declare type SnapControllerActions = ClearSnapState | GetSnap | GetSnapState | HandleSnapRequest | HasSnap | UpdateBlockedSnaps | UpdateSnapState | EnableSnap | DisableSnap | RemoveSnap | GetPermittedSnaps | InstallSnaps | RemoveSnapError | GetAllSnaps | IncrementActiveReferences | DecrementActiveReferences;
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
    payload: [snapId: string, blockedSnapInfo: BlockedSnapInfo];
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
 * Emitted when a snap is removed.
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
 * Emitted when a Snap is terminated. This is different from the snap being
 * stopped as it can also be triggered when a snap fails initialization.
 */
export declare type SnapTerminated = {
    type: `${typeof controllerName}:snapTerminated`;
    payload: [snap: TruncatedSnap];
};
export declare type SnapControllerEvents = SnapAdded | SnapBlocked | SnapInstalled | SnapRemoved | SnapStateChange | SnapUnblocked | SnapUpdated | SnapTerminated;
export declare type AllowedActions = GetEndowments | GetPermissions | HasPermission | HasPermissions | RevokePermissions | RevokeAllPermissions | RevokePermissionForAllSubjects | GrantPermissions | AddApprovalRequest | HandleRpcRequestAction | ExecuteSnapAction | TerminateAllSnapsAction | TerminateSnapAction;
export declare type AllowedEvents = ExecutionServiceEvents;
declare type SnapControllerMessenger = RestrictedControllerMessenger<typeof controllerName, SnapControllerActions | AllowedActions, SnapControllerEvents | AllowedEvents, AllowedActions['type'], AllowedEvents['type']>;
export declare enum AppKeyType {
    stateEncryption = "stateEncryption"
}
declare type GetAppKey = (subject: string, appKeyType: AppKeyType) => Promise<string>;
declare type FeatureFlags = {
    /**
     * We still need to implement new UI approval page in metamask-extension before we can allow
     * DApps to update Snaps. After it's added, this flag can be removed.
     *
     * @see {SNAP_APPROVAL_UPDATE}
     * @see {SnapController.processRequestedSnap}
     */
    dappsCanUpdateSnaps?: true;
};
declare type SemVerVersion = string;
declare type SnapInfo = {
    version: SemVerVersion;
    shasum: string;
};
export declare type CheckSnapBlockListArg = Record<SnapId, SnapInfo>;
export declare type CheckSnapBlockListResult = Record<SnapId, {
    blocked: true;
    reason?: string;
    infoUrl?: string;
} | {
    blocked: false;
}>;
/**
 * Checks whether a version of a snap is blocked.
 */
export declare type CheckSnapBlockList = (snapsToCheck: CheckSnapBlockListArg) => Promise<CheckSnapBlockListResult>;
declare type SnapControllerArgs = {
    /**
     * A teardown function that allows the host to clean up its instrumentation
     * for a running snap.
     */
    closeAllConnections: CloseAllConnectionsFunction;
    /**
     * The names of endowment permissions whose values are the names of JavaScript
     * APIs that will be added to the snap execution environment at runtime.
     */
    environmentEndowmentPermissions: string[];
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
     * A function to get an "app key" for a specific subject.
     */
    getAppKey: GetAppKey;
    /**
     * How frequently to check whether a snap is idle.
     */
    idleTimeCheckInterval?: number;
    /**
     * A function that checks whether the specified snap and version is blocked.
     */
    checkBlockList: CheckSnapBlockList;
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
};
export declare class SnapController extends BaseController<string, SnapControllerState, SnapControllerMessenger> {
    private _closeAllConnections;
    private _environmentEndowmentPermissions;
    private _featureFlags;
    private _fetchFunction;
    private _idleTimeCheckInterval;
    private _checkSnapBlockList;
    private _maxIdleTime;
    private _maxRequestTime;
    private _npmRegistryUrl?;
    private _snapsRuntimeData;
    private _getAppKey;
    private _timeoutForLastRequestStatus?;
    private _statusMachine;
    constructor({ closeAllConnections, messenger, state, getAppKey, environmentEndowmentPermissions, npmRegistryUrl, idleTimeCheckInterval, checkBlockList, maxIdleTime, maxRequestTime, fetchFunction, featureFlags, }: SnapControllerArgs);
    /**
     * We track status of a Snap using a finite-state-machine.
     * It keeps track of whether the snap is started / stopped / etc.
     *
     * @see {@link SnapController.transition} for interacting with the machine.
     */
    private initializeStateMachine;
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    private registerMessageHandlers;
    _pollForLastRequestStatus(): void;
    /**
     * Checks all installed snaps against the block list and
     * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
     * for more information.
     */
    updateBlockedSnaps(): Promise<void>;
    /**
     * Blocks an installed snap and prevents it from being started again. Emits
     * {@link SnapBlocked}. Does nothing if the snap is not installed.
     *
     * @param snapId - The snap to block.
     * @param blockedSnapInfo - Information detailing why the snap is blocked.
     */
    private _blockSnap;
    /**
     * Unblocks a snap so that it can be enabled and started again. Emits
     * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
     * unblocked.
     *
     * @param snapId - The id of the snap to unblock.
     */
    private _unblockSnap;
    /**
     * Checks the block list to determine whether a version of a snap is blocked.
     *
     * @param snapId - The snap id to check.
     * @param snapInfo - Snap information containing version and shasum.
     * @returns Whether the version of the snap is blocked or not.
     */
    isBlocked(snapId: ValidatedSnapId, snapInfo: SnapInfo): Promise<boolean>;
    /**
     * Asserts that a version of a snap is not blocked. Succeeds automatically
     * if {@link SnapController._checkSnapBlockList} is undefined.
     *
     * @param snapId - The id of the snap to check.
     * @param snapInfo - Snap information containing version and shasum.
     */
    private _assertIsUnblocked;
    _stopSnapsLastRequestPastMax(): Promise<void[]>;
    _onUnhandledSnapError(snapId: SnapId, error: SnapErrorJson): Promise<void>;
    _onOutboundRequest(snapId: SnapId): Promise<void>;
    _onOutboundResponse(snapId: SnapId): Promise<void>;
    /**
     * Transitions between states using `snapStatusStateMachineConfig` as the template to figure out
     * the next state. This transition function uses a very minimal subset of XState conventions:
     * - supports initial state
     * - .on supports raw event target string
     * - .on supports {target, cond} object
     * - the arguments for `cond` is the `SerializedSnap` instead of Xstate convention of `(event,
     * context) => boolean`
     *
     * @param snapId - The id of the snap to transition.
     * @param event - The event enum to use to transition.
     */
    private transition;
    /**
     * Starts the given snap. Throws an error if no such snap exists
     * or if it is already running.
     *
     * @param snapId - The id of the Snap to start.
     */
    startSnap(snapId: SnapId): Promise<void>;
    /**
     * Enables the given snap. A snap can only be started if it is enabled. A snap
     * can only be enabled if it isn't blocked.
     *
     * @param snapId - The id of the Snap to enable.
     */
    enableSnap(snapId: SnapId): void;
    /**
     * Disables the given snap. A snap can only be started if it is enabled.
     *
     * @param snapId - The id of the Snap to disable.
     * @returns A promise that resolves once the snap has been disabled.
     */
    disableSnap(snapId: SnapId): Promise<void>;
    /**
     * Stops the given snap, removes all hooks, closes all connections, and
     * terminates its worker.
     *
     * @param snapId - The id of the Snap to stop.
     * @param statusEvent - The Snap status event that caused the snap to be
     * stopped.
     */
    stopSnap(snapId: SnapId, statusEvent?: SnapStatusEvents.Stop | SnapStatusEvents.Crash): Promise<void>;
    /**
     * Terminates the specified snap and emits the `snapTerminated` event.
     *
     * @param snapId - The snap to terminate.
     */
    private terminateSnap;
    /**
     * Returns whether the given snap is running.
     * Throws an error if the snap doesn't exist.
     *
     * @param snapId - The id of the Snap to check.
     * @returns `true` if the snap is running, otherwise `false`.
     */
    isRunning(snapId: SnapId): boolean;
    /**
     * Returns whether the given snap has been added to state.
     *
     * @param snapId - The id of the Snap to check for.
     * @returns `true` if the snap exists in the controller state, otherwise `false`.
     */
    has(snapId: SnapId): boolean;
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
    getExpect(snapId: SnapId): Snap;
    /**
     * Gets the snap with the given id if it exists, excluding any
     * non-serializable or expensive-to-serialize data.
     *
     * @param snapId - The id of the Snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    getTruncated(snapId: SnapId): TruncatedSnap | null;
    /**
     * Gets the snap with the given id, throw if it doesn't exist.
     *
     * @throws {@link Error}. If snap doesn't exist
     * @param snapId - The id of the snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    getTruncatedExpect(snapId: SnapId): TruncatedSnap;
    /**
     * Updates the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be updated.
     * @param newSnapState - The new state of the snap.
     */
    updateSnapState(snapId: SnapId, newSnapState: Json): Promise<void>;
    /**
     * Clears the state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be cleared.
     */
    clearSnapState(snapId: SnapId): Promise<void>;
    /**
     * Adds error from a snap to the SnapController state.
     *
     * @param snapError - The error to store on the SnapController.
     */
    addSnapError(snapError: SnapError): void;
    /**
     * Removes an error by internalID from a the SnapControllers state.
     *
     * @param internalID - The internal error ID to remove on the SnapController.
     */
    removeSnapError(internalID: string): Promise<void>;
    /**
     * Clears all errors from the SnapControllers state.
     *
     */
    clearSnapErrors(): Promise<void>;
    /**
     * Gets the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state to get.
     * @returns A promise that resolves with the decrypted snap state or null if no state exists.
     * @throws If the snap state decryption fails.
     */
    getSnapState(snapId: SnapId): Promise<Json>;
    private getEncryptionKey;
    private encryptSnapState;
    private decryptSnapState;
    /**
     * Completely clear the controller's state: delete all associated data,
     * handlers, event listeners, and permissions; tear down all snap providers.
     */
    clearState(): void;
    /**
     * Removes the given snap from state, and clears all associated handlers
     * and listeners.
     *
     * @param snapId - The id of the Snap.
     * @returns A promise that resolves once the snap has been removed.
     */
    removeSnap(snapId: SnapId): Promise<void>;
    /**
     * Stops the given snaps, removes them from state, and clears all associated
     * permissions, handlers, and listeners.
     *
     * @param snapIds - The ids of the Snaps.
     */
    removeSnaps(snapIds: string[]): Promise<void>;
    /**
     * Safely revokes all permissions granted to a Snap.
     *
     * @param snapId - The snap ID.
     */
    private revokeAllSnapPermissions;
    /**
     * Handles incrementing the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced.
     */
    incrementActiveReferences(snapId: SnapId): void;
    /**
     * Handles decrement the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced..
     */
    decrementActiveReferences(snapId: SnapId): void;
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
    getPermittedSnaps(origin: string): Promise<InstallSnapsResult>;
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
     * @param newVersionRange - A semver version range in which the maximum version will be chosen.
     * @returns The snap metadata if updated, `null` otherwise.
     */
    updateSnap(origin: string, snapId: ValidatedSnapId, newVersionRange?: string): Promise<TruncatedSnap | null>;
    /**
     * Returns a promise representing the complete installation of the requested snap.
     * If the snap is already being installed, the previously pending promise will be returned.
     *
     * @param args - Object containing the snap id and either the URL of the snap's manifest,
     * or the snap's manifest and source code. The object may also optionally contain a target
     * version.
     * @returns The resulting snap object.
     */
    private _add;
    private _startSnap;
    /**
     * Gets the names of all endowments that will be added to the Snap's
     * Compartment when it executes. These should be the names of global
     * JavaScript APIs accessible in the root realm of the execution environment.
     *
     * Throws an error if the endowment getter for a permission returns a truthy
     * value that is not an array of strings.
     *
     * @param snapId - The id of the snap whose SES endowments to get.
     * @returns An array of the names of the endowments.
     */
    private _getEndowments;
    /**
     * Sets a snap in state. Called when a snap is installed or updated. Performs
     * various validation checks on the received arguments, and will throw if
     * validation fails.
     *
     * The snap will be enabled and unblocked by the time this method returns,
     * regardless of its previous state.
     *
     * See {@link SnapController.add} and {@link SnapController.updateSnap} for
     * usage.
     *
     * @param args - The add snap args.
     * @returns The resulting snap object.
     */
    private _set;
    /**
     * Fetches the manifest and source code of a snap.
     *
     * @param snapId - The id of the Snap.
     * @param versionRange - The SemVer version of the Snap to fetch.
     * @returns A tuple of the Snap manifest object and the Snap source code.
     */
    private _fetchSnap;
    private _fetchNpmSnap;
    /**
     * Fetches the manifest and source code of a local snap.
     *
     * @param localhostUrl - The localhost URL to download from.
     * @returns The validated manifest and the source code.
     */
    private _fetchLocalSnap;
    /**
     * Map initial permissions as defined in a Snap manifest to something that can
     * be processed by the PermissionsController. Each caveat mapping function
     * should return a valid permission caveat value.
     *
     * This function does not validate the caveat values, since that is done by
     * the PermissionsController itself, upon requesting the permissions.
     *
     * @param initialPermissions - The initial permissions to process.
     * @returns The processed permissions.
     * @private
     */
    private processSnapPermissions;
    /**
     * Initiates a request for the given snap's initial permissions.
     * Must be called in order. See processRequestedSnap.
     *
     * @param origin - The origin of the install request.
     * @param snapId - The id of the Snap.
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
    handleRequest({ snapId, origin, handler: handlerType, request, }: SnapRpcHookArgs & {
        snapId: SnapId;
    }): Promise<unknown>;
    /**
     * Gets the RPC message handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC handler for the given snap.
     */
    private getRpcRequestHandler;
    /**
     * Awaits the specified promise and rejects if the promise doesn't resolve
     * before the timeout.
     *
     * @param snapId - The snap id.
     * @param promise - The promise to await.
     * @param timer - An optional timer object to control the timeout.
     * @returns The result of the promise or rejects if the promise times out.
     * @template PromiseValue - The value of the Promise.
     */
    private _executeWithTimeout;
    private _recordSnapRpcRequestStart;
    private _recordSnapRpcRequestFinish;
    private getRuntime;
    private getRuntimeExpect;
    private setupRuntime;
    private calculatePermissionsChange;
}
export {};
