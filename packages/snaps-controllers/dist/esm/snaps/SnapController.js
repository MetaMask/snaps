function _check_private_redeclaration(obj, privateCollection) {
    if (privateCollection.has(obj)) {
        throw new TypeError("Cannot initialize the same private elements twice on an object");
    }
}
function _class_apply_descriptor_get(receiver, descriptor) {
    if (descriptor.get) {
        return descriptor.get.call(receiver);
    }
    return descriptor.value;
}
function _class_apply_descriptor_set(receiver, descriptor, value) {
    if (descriptor.set) {
        descriptor.set.call(receiver, value);
    } else {
        if (!descriptor.writable) {
            throw new TypeError("attempted to set read only private field");
        }
        descriptor.value = value;
    }
}
function _class_extract_field_descriptor(receiver, privateMap, action) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to " + action + " private field on non-instance");
    }
    return privateMap.get(receiver);
}
function _class_private_field_get(receiver, privateMap) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "get");
    return _class_apply_descriptor_get(receiver, descriptor);
}
function _class_private_field_init(obj, privateMap, value) {
    _check_private_redeclaration(obj, privateMap);
    privateMap.set(obj, value);
}
function _class_private_field_set(receiver, privateMap, value) {
    var descriptor = _class_extract_field_descriptor(receiver, privateMap, "set");
    _class_apply_descriptor_set(receiver, descriptor, value);
    return value;
}
function _class_private_method_get(receiver, privateSet, fn) {
    if (!privateSet.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return fn;
}
function _class_private_method_init(obj, privateSet) {
    _check_private_redeclaration(obj, privateSet);
    privateSet.add(obj);
}
function _define_property(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import { SubjectType } from '@metamask/permission-controller';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import { assertIsSnapManifest, assertIsValidSnapId, DEFAULT_ENDOWMENTS, DEFAULT_REQUESTED_SNAP_VERSION, getErrorMessage, HandlerType, isOriginAllowed, logError, normalizeRelative, resolveVersionRange, SnapCaveatType, SnapStatus, SnapStatusEvents, validateFetchedSnap } from '@metamask/snaps-utils';
import { assert, assertIsJsonRpcRequest, Duration, gtRange, gtVersion, hasProperty, inMilliseconds, isNonEmptyArray, isValidSemVerRange, satisfiesVersionRange, timeSince } from '@metamask/utils';
import { createMachine, interpret } from '@xstate/fsm';
import { ethErrors } from 'eth-rpc-errors';
import { nanoid } from 'nanoid';
import { forceStrict, validateMachine } from '../fsm';
import { log } from '../logging';
import { hasTimedOut, setDiff, withTimeout } from '../utils';
import { handlerEndowments, SnapEndowments } from './endowments';
import { getKeyringCaveatOrigins } from './endowments/keyring';
import { getRpcCaveatOrigins } from './endowments/rpc';
import { detectSnapLocation } from './location';
import { processSnapPermissions } from './permissions';
import { SnapsRegistryStatus } from './registry';
import { RequestQueue } from './RequestQueue';
import { Timer } from './Timer';
export const controllerName = 'SnapController';
// TODO: Figure out how to name these
export const SNAP_APPROVAL_INSTALL = 'wallet_installSnap';
export const SNAP_APPROVAL_UPDATE = 'wallet_updateSnap';
export const SNAP_APPROVAL_RESULT = 'wallet_installSnapResult';
const TRUNCATED_SNAP_PROPERTIES = new Set([
    'initialPermissions',
    'id',
    'version',
    'enabled',
    'blocked'
]);
const defaultState = {
    snapErrors: {},
    snaps: {},
    snapStates: {}
};
/**
 * Truncates the properties of a snap to only ones that are easily serializable.
 *
 * @param snap - The snap to truncate.
 * @returns Object with serializable snap properties.
 */ function truncateSnap(snap) {
    const truncatedSnap = Object.keys(snap).reduce((serialized, key)=>{
        if (TRUNCATED_SNAP_PROPERTIES.has(key)) {
            serialized[key] = snap[key];
        }
        return serialized;
    }, {});
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    return truncatedSnap;
}
const name = 'SnapController';
var _closeAllConnections = /*#__PURE__*/ new WeakMap(), _dynamicPermissions = /*#__PURE__*/ new WeakMap(), _environmentEndowmentPermissions = /*#__PURE__*/ new WeakMap(), _excludedPermissions = /*#__PURE__*/ new WeakMap(), _featureFlags = /*#__PURE__*/ new WeakMap(), _fetchFunction = /*#__PURE__*/ new WeakMap(), _idleTimeCheckInterval = /*#__PURE__*/ new WeakMap(), _maxIdleTime = /*#__PURE__*/ new WeakMap(), _detectSnapLocation = /*#__PURE__*/ new WeakMap(), _snapsRuntimeData = /*#__PURE__*/ new WeakMap(), _rollbackSnapshots = /*#__PURE__*/ new WeakMap(), _timeoutForLastRequestStatus = /*#__PURE__*/ new WeakMap(), _statusMachine = /*#__PURE__*/ new WeakMap(), /**
   * We track status of a Snap using a finite-state-machine.
   * It keeps track of whether the snap is started / stopped / etc.
   *
   * @see {@link SnapController.transition} for interacting with the machine.
   */ // We initialize the machine in the instance because the status is currently tightly coupled
// with the SnapController - the guard checks for enabled status inside the SnapController state.
// In the future, side-effects could be added to the machine during transitions.
_initializeStateMachine = /*#__PURE__*/ new WeakSet(), /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */ _registerMessageHandlers = /*#__PURE__*/ new WeakSet(), _pollForLastRequestStatus = /*#__PURE__*/ new WeakSet(), _blockSnap = /*#__PURE__*/ new WeakSet(), /**
   * Unblocks a snap so that it can be enabled and started again. Emits
   * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
   * unblocked.
   *
   * @param snapId - The id of the snap to unblock.
   */ _unblockSnap = /*#__PURE__*/ new WeakSet(), _assertIsInstallAllowed = /*#__PURE__*/ new WeakSet(), _stopSnapsLastRequestPastMax = /*#__PURE__*/ new WeakSet(), /**
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
   */ _transition = /*#__PURE__*/ new WeakSet(), _terminateSnap = /*#__PURE__*/ new WeakSet(), /**
   * Removes a snap's permission (caveat) from all subjects.
   *
   * @param snapId - The id of the Snap.
   */ _removeSnapFromSubjects = /*#__PURE__*/ new WeakSet(), /**
   * Safely revokes all permissions granted to a Snap.
   *
   * @param snapId - The snap ID.
   */ _revokeAllSnapPermissions = /*#__PURE__*/ new WeakSet(), _createApproval = /*#__PURE__*/ new WeakSet(), _updateApproval = /*#__PURE__*/ new WeakSet(), _add = /*#__PURE__*/ new WeakSet(), _startSnap = /*#__PURE__*/ new WeakSet(), _getEndowments = /*#__PURE__*/ new WeakSet(), /**
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
   */ _set = /*#__PURE__*/ new WeakSet(), _fetchSnap = /*#__PURE__*/ new WeakSet(), _validateSnapPermissions = /*#__PURE__*/ new WeakSet(), /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   * @returns The RPC handler for the given snap.
   */ _getRpcRequestHandler = /*#__PURE__*/ new WeakSet(), _executeWithTimeout = /*#__PURE__*/ new WeakSet(), _recordSnapRpcRequestStart = /*#__PURE__*/ new WeakSet(), _recordSnapRpcRequestFinish = /*#__PURE__*/ new WeakSet(), /**
   * Retrieves the rollback snapshot of a snap.
   *
   * @param snapId - The snap id.
   * @returns A `RollbackSnapshot` or `undefined` if one doesn't exist.
   */ _getRollbackSnapshot = /*#__PURE__*/ new WeakSet(), /**
   * Creates a `RollbackSnapshot` that is used to help ensure
   * atomicity in multiple snap updates.
   *
   * @param snapId - The snap id.
   * @throws {@link Error}. If the snap exists before creation or if creation fails.
   * @returns A `RollbackSnapshot`.
   */ _createRollbackSnapshot = /*#__PURE__*/ new WeakSet(), _rollbackSnap = /*#__PURE__*/ new WeakSet(), _rollbackSnaps = /*#__PURE__*/ new WeakSet(), _getRuntime = /*#__PURE__*/ new WeakSet(), _getRuntimeExpect = /*#__PURE__*/ new WeakSet(), _setupRuntime = /*#__PURE__*/ new WeakSet(), _calculatePermissionsChange = /*#__PURE__*/ new WeakSet(), /**
   * Checks if a snap will pass version validation checks
   * with the new version range that is requested. The first
   * check that is done is to check if the existing snap version
   * falls inside the requested range. If it does, we want to return
   * false because we do not care to create a rollback snapshot in
   * that scenario. The second check is to ensure that the current
   * snap version is not greater than all possible versions in
   * the requested version range. If it is, then we also want
   * to return false in that scenario.
   *
   * @param snapId - The snap id.
   * @param newVersionRange - The new version range being requsted.
   * @returns `true` if validation checks pass and `false` if they do not.
   */ _isValidUpdate = /*#__PURE__*/ new WeakSet(), _callLifecycleHook = /*#__PURE__*/ new WeakSet();
/*
 * A snap is initialized in three phases:
 * - Add: Loads the snap from a remote source and parses it.
 * - Authorize: Requests the snap's required permissions from the user.
 * - Start: Initializes the snap in its SES realm with the authorized permissions.
 */ export class SnapController extends BaseController {
    /**
   * Checks all installed snaps against the block list and
   * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
   * for more information.
   */ async updateBlockedSnaps() {
        await this.messagingSystem.call('SnapsRegistry:update');
        const blockedSnaps = await this.messagingSystem.call('SnapsRegistry:get', Object.values(this.state.snaps).reduce((blockListArg, snap)=>{
            blockListArg[snap.id] = {
                version: snap.version,
                checksum: snap.manifest.source.shasum
            };
            return blockListArg;
        }, {}));
        await Promise.all(Object.entries(blockedSnaps).map(async ([snapId, { status, reason }])=>{
            if (status === SnapsRegistryStatus.Blocked) {
                return _class_private_method_get(this, _blockSnap, blockSnap).call(this, snapId, reason);
            }
            return _class_private_method_get(this, _unblockSnap, unblockSnap).call(this, snapId);
        }));
    }
    _onUnhandledSnapError(snapId, error) {
        this.stopSnap(snapId, SnapStatusEvents.Crash).then(()=>this.addSnapError(error)).catch((stopSnapError)=>{
            // TODO: Decide how to handle errors.
            logError(stopSnapError);
        });
    }
    _onOutboundRequest(snapId) {
        const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
        // Ideally we would only pause the pending request that is making the outbound request
        // but right now we don't have a way to know which request initiated the outbound request
        runtime.pendingInboundRequests.filter((pendingRequest)=>pendingRequest.timer.status === 'running').forEach((pendingRequest)=>pendingRequest.timer.pause());
        runtime.pendingOutboundRequests += 1;
    }
    _onOutboundResponse(snapId) {
        const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
        runtime.pendingOutboundRequests -= 1;
        if (runtime.pendingOutboundRequests === 0) {
            runtime.pendingInboundRequests.filter((pendingRequest)=>pendingRequest.timer.status === 'paused').forEach((pendingRequest)=>pendingRequest.timer.resume());
        }
    }
    /**
   * Starts the given snap. Throws an error if no such snap exists
   * or if it is already running.
   *
   * @param snapId - The id of the Snap to start.
   */ async startSnap(snapId) {
        const snap = this.state.snaps[snapId];
        if (snap.enabled === false) {
            throw new Error(`Snap "${snapId}" is disabled.`);
        }
        await _class_private_method_get(this, _startSnap, startSnap).call(this, {
            snapId,
            sourceCode: snap.sourceCode
        });
    }
    /**
   * Enables the given snap. A snap can only be started if it is enabled. A snap
   * can only be enabled if it isn't blocked.
   *
   * @param snapId - The id of the Snap to enable.
   */ enableSnap(snapId) {
        this.getExpect(snapId);
        if (this.state.snaps[snapId].blocked) {
            throw new Error(`Snap "${snapId}" is blocked and cannot be enabled.`);
        }
        this.update((state)=>{
            state.snaps[snapId].enabled = true;
        });
        this.messagingSystem.publish('SnapController:snapEnabled', this.getTruncatedExpect(snapId));
    }
    /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to disable.
   * @returns A promise that resolves once the snap has been disabled.
   */ async disableSnap(snapId) {
        if (!this.has(snapId)) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        this.update((state)=>{
            state.snaps[snapId].enabled = false;
        });
        if (this.isRunning(snapId)) {
            await this.stopSnap(snapId, SnapStatusEvents.Stop);
        }
        this.messagingSystem.publish('SnapController:snapDisabled', this.getTruncatedExpect(snapId));
    }
    /**
   * Stops the given snap, removes all hooks, closes all connections, and
   * terminates its worker.
   *
   * @param snapId - The id of the Snap to stop.
   * @param statusEvent - The Snap status event that caused the snap to be
   * stopped.
   */ async stopSnap(snapId, statusEvent = SnapStatusEvents.Stop) {
        const runtime = _class_private_method_get(this, _getRuntime, getRuntime).call(this, snapId);
        if (!runtime) {
            throw new Error(`The snap "${snapId}" is not running.`);
        }
        // Reset request tracking
        runtime.lastRequest = null;
        runtime.pendingInboundRequests = [];
        runtime.pendingOutboundRequests = 0;
        try {
            if (this.isRunning(snapId)) {
                _class_private_field_get(this, _closeAllConnections).call(this, snapId);
                await _class_private_method_get(this, _terminateSnap, terminateSnap).call(this, snapId);
            }
        } finally{
            if (this.isRunning(snapId)) {
                _class_private_method_get(this, _transition, transition).call(this, snapId, statusEvent);
            }
        }
    }
    /**
   * Returns whether the given snap is running.
   * Throws an error if the snap doesn't exist.
   *
   * @param snapId - The id of the Snap to check.
   * @returns `true` if the snap is running, otherwise `false`.
   */ isRunning(snapId) {
        return this.getExpect(snapId).status === 'running';
    }
    /**
   * Returns whether the given snap has been added to state.
   *
   * @param snapId - The id of the Snap to check for.
   * @returns `true` if the snap exists in the controller state, otherwise `false`.
   */ has(snapId) {
        return Boolean(this.get(snapId));
    }
    /**
   * Gets the snap with the given id if it exists, including all data.
   * This should not be used if the snap is to be serializable, as e.g.
   * the snap sourceCode may be quite large.
   *
   * @param snapId - The id of the Snap to get.
   * @returns The entire snap object from the controller state.
   */ get(snapId) {
        return this.state.snaps[snapId];
    }
    /**
   * Gets the snap with the given id, throws if doesn't.
   * This should not be used if the snap is to be serializable, as e.g.
   * the snap sourceCode may be quite large.
   *
   * @see {@link SnapController.get}
   * @throws {@link Error}. If the snap doesn't exist
   * @param snapId - The id of the snap to get.
   * @returns The entire snap object.
   */ getExpect(snapId) {
        const snap = this.get(snapId);
        assert(snap !== undefined, new Error(`Snap "${snapId}" not found.`));
        return snap;
    }
    /**
   * Gets the snap with the given id if it exists, excluding any
   * non-serializable or expensive-to-serialize data.
   *
   * @param snapId - The id of the Snap to get.
   * @returns A truncated version of the snap state, that is less expensive to serialize.
   */ // TODO(ritave): this.get returns undefined, this.getTruncated returns null
    getTruncated(snapId) {
        const snap = this.get(snapId);
        return snap ? truncateSnap(snap) : null;
    }
    /**
   * Gets the snap with the given id, throw if it doesn't exist.
   *
   * @throws {@link Error}. If snap doesn't exist
   * @param snapId - The id of the snap to get.
   * @returns A truncated version of the snap state, that is less expensive to serialize.
   */ getTruncatedExpect(snapId) {
        return truncateSnap(this.getExpect(snapId));
    }
    /**
   * Updates the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   */ async updateSnapState(snapId, newSnapState) {
        this.update((state)=>{
            state.snapStates[snapId] = newSnapState;
        });
    }
    /**
   * Clears the state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be cleared.
   */ clearSnapState(snapId) {
        this.update((state)=>{
            state.snapStates[snapId] = null;
        });
    }
    /**
   * Adds error from a snap to the SnapController state.
   *
   * @param snapError - The error to store on the SnapController.
   */ addSnapError(snapError) {
        this.update((state)=>{
            const id = nanoid();
            state.snapErrors[id] = {
                ...snapError,
                internalID: id
            };
        });
    }
    /**
   * Removes an error by internalID from the SnapControllers state.
   *
   * @param internalID - The internal error ID to remove on the SnapController.
   */ removeSnapError(internalID) {
        this.update((state)=>{
            delete state.snapErrors[internalID];
        });
    }
    /**
   * Clears all errors from the SnapControllers state.
   */ clearSnapErrors() {
        this.update((state)=>{
            state.snapErrors = {};
        });
    }
    /**
   * Gets the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state to get.
   * @returns A promise that resolves with the decrypted snap state or null if no state exists.
   * @throws If the snap state decryption fails.
   */ async getSnapState(snapId) {
        const state = this.state.snapStates[snapId];
        return state ?? null;
    }
    /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all snap providers.
   */ async clearState() {
        const snapIds = Object.keys(this.state.snaps);
        snapIds.forEach((snapId)=>{
            _class_private_field_get(this, _closeAllConnections).call(this, snapId);
        });
        await this.messagingSystem.call('ExecutionService:terminateAllSnaps');
        snapIds.forEach((snapId)=>_class_private_method_get(this, _revokeAllSnapPermissions, revokeAllSnapPermissions).call(this, snapId));
        this.update((state)=>{
            state.snaps = {};
            state.snapStates = {};
        });
    }
    /**
   * Removes the given snap from state, and clears all associated handlers
   * and listeners.
   *
   * @param snapId - The id of the Snap.
   * @returns A promise that resolves once the snap has been removed.
   */ async removeSnap(snapId) {
        return this.removeSnaps([
            snapId
        ]);
    }
    /**
   * Stops the given snaps, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param snapIds - The ids of the Snaps.
   */ async removeSnaps(snapIds) {
        if (!Array.isArray(snapIds)) {
            throw new Error('Expected array of snap ids.');
        }
        await Promise.all(snapIds.map(async (snapId)=>{
            const snap = this.getExpect(snapId);
            const truncated = this.getTruncatedExpect(snapId);
            // Disable the snap and revoke all of its permissions before deleting
            // it. This ensures that the snap will not be restarted or otherwise
            // affect the host environment while we are deleting it.
            await this.disableSnap(snapId);
            _class_private_method_get(this, _revokeAllSnapPermissions, revokeAllSnapPermissions).call(this, snapId);
            _class_private_method_get(this, _removeSnapFromSubjects, removeSnapFromSubjects).call(this, snapId);
            _class_private_field_get(this, _snapsRuntimeData).delete(snapId);
            this.update((state)=>{
                delete state.snaps[snapId];
                delete state.snapStates[snapId];
            });
            this.messagingSystem.publish(`SnapController:snapRemoved`, truncated);
            // If the snap has been fully installed before, also emit snapUninstalled.
            if (snap.status !== SnapStatus.Installing) {
                this.messagingSystem.publish(`SnapController:snapUninstalled`, truncated);
            }
        }));
    }
    /**
   * Removes a snap's permission (caveat) from the specified subject.
   *
   * @param origin - The origin from which to remove the snap.
   * @param snapId - The id of the snap to remove.
   */ removeSnapFromSubject(origin, snapId) {
        const subjectPermissions = this.messagingSystem.call('PermissionController:getPermissions', origin);
        const snapIdsCaveat = subjectPermissions?.[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat)=>caveat.type === SnapCaveatType.SnapIds);
        if (!snapIdsCaveat) {
            return;
        }
        const caveatHasSnap = Boolean(snapIdsCaveat.value?.[snapId]);
        if (caveatHasSnap) {
            const newCaveatValue = {
                ...snapIdsCaveat.value
            };
            delete newCaveatValue[snapId];
            if (Object.keys(newCaveatValue).length > 0) {
                this.messagingSystem.call('PermissionController:updateCaveat', origin, WALLET_SNAP_PERMISSION_KEY, SnapCaveatType.SnapIds, newCaveatValue);
            } else {
                this.messagingSystem.call('PermissionController:revokePermissions', {
                    [origin]: [
                        WALLET_SNAP_PERMISSION_KEY
                    ]
                });
            }
        }
    }
    /**
   * Checks if a list of permissions are dynamic and allowed to be revoked, if they are they will all be revoked.
   *
   * @param snapId - The snap ID.
   * @param permissionNames - The names of the permissions.
   * @throws If non-dynamic permissions are passed.
   */ revokeDynamicSnapPermissions(snapId, permissionNames) {
        assert(permissionNames.every((permissionName)=>_class_private_field_get(this, _dynamicPermissions).includes(permissionName)), 'Non-dynamic permissions cannot be revoked');
        this.messagingSystem.call('PermissionController:revokePermissions', {
            [snapId]: permissionNames
        });
    }
    /**
   * Handles incrementing the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced.
   */ incrementActiveReferences(snapId) {
        const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
        runtime.activeReferences += 1;
    }
    /**
   * Handles decrement the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced..
   */ decrementActiveReferences(snapId) {
        const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
        assert(runtime.activeReferences > 0, 'SnapController reference management is in an invalid state.');
        runtime.activeReferences -= 1;
    }
    /**
   * Gets all snaps in their truncated format.
   *
   * @returns All installed snaps in their truncated format.
   */ getAllSnaps() {
        return Object.values(this.state.snaps).map(truncateSnap);
    }
    /**
   * Gets the serialized permitted snaps of the given origin, if any.
   *
   * @param origin - The origin whose permitted snaps to retrieve.
   * @returns The serialized permitted snaps for the origin.
   */ getPermittedSnaps(origin) {
        const permissions = this.messagingSystem.call('PermissionController:getPermissions', origin) ?? {};
        const snaps = permissions[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat)=>caveat.type === SnapCaveatType.SnapIds)?.value ?? {};
        return Object.keys(snaps).reduce((permittedSnaps, snapId)=>{
            const snap = this.get(snapId);
            const truncatedSnap = this.getTruncated(snapId);
            if (truncatedSnap && snap?.status !== SnapStatus.Installing) {
                permittedSnaps[snapId] = truncatedSnap;
            }
            return permittedSnaps;
        }, {});
    }
    /**
   * Installs the snaps requested by the given origin, returning the snap
   * object if the origin is permitted to install it, and an authorization error
   * otherwise.
   *
   * @param origin - The origin that requested to install the snaps.
   * @param requestedSnaps - The snaps to install.
   * @returns An object of snap ids and snap objects, or errors if a
   * snap couldn't be installed.
   */ async installSnaps(origin, requestedSnaps) {
        const result = {};
        const snapIds = Object.keys(requestedSnaps);
        const pendingUpdates = [];
        const pendingInstalls = [];
        try {
            for (const [snapId, { version: rawVersion }] of Object.entries(requestedSnaps)){
                assertIsValidSnapId(snapId);
                const [error, version] = resolveVersionRange(rawVersion);
                if (error) {
                    throw ethErrors.rpc.invalidParams(`The "version" field must be a valid SemVer version range if specified. Received: "${rawVersion}".`);
                }
                const location = _class_private_field_get(this, _detectSnapLocation).call(this, snapId, {
                    versionRange: version,
                    fetch: _class_private_field_get(this, _fetchFunction),
                    allowLocal: _class_private_field_get(this, _featureFlags).allowLocalSnaps
                });
                // Existing snaps may need to be updated, unless they should be re-installed (e.g. local snaps)
                // Everything else is treated as an install
                const isUpdate = this.has(snapId) && !location.shouldAlwaysReload;
                if (isUpdate && _class_private_method_get(this, _isValidUpdate, isValidUpdate).call(this, snapId, version)) {
                    const existingSnap = this.getExpect(snapId);
                    pendingUpdates.push({
                        snapId,
                        oldVersion: existingSnap.version
                    });
                    let rollbackSnapshot = _class_private_method_get(this, _getRollbackSnapshot, getRollbackSnapshot).call(this, snapId);
                    if (rollbackSnapshot === undefined) {
                        rollbackSnapshot = _class_private_method_get(this, _createRollbackSnapshot, createRollbackSnapshot).call(this, snapId);
                        rollbackSnapshot.newVersion = version;
                    } else {
                        throw new Error('This snap is already being updated.');
                    }
                } else if (!isUpdate) {
                    pendingInstalls.push(snapId);
                }
                result[snapId] = await this.processRequestedSnap(origin, snapId, location, version);
            }
            // Once we finish all installs / updates, emit events.
            pendingInstalls.forEach((snapId)=>this.messagingSystem.publish(`SnapController:snapInstalled`, this.getTruncatedExpect(snapId)));
            pendingUpdates.forEach(({ snapId, oldVersion })=>this.messagingSystem.publish(`SnapController:snapUpdated`, this.getTruncatedExpect(snapId), oldVersion));
            snapIds.forEach((snapId)=>_class_private_field_get(this, _rollbackSnapshots).delete(snapId));
        } catch (error) {
            const installed = pendingInstalls.filter((snapId)=>this.has(snapId));
            await this.removeSnaps(installed);
            const snapshottedSnaps = [
                ..._class_private_field_get(this, _rollbackSnapshots).keys()
            ];
            const snapsToRollback = pendingUpdates.map(({ snapId })=>snapId).filter((snapId)=>snapshottedSnaps.includes(snapId));
            await _class_private_method_get(this, _rollbackSnaps, rollbackSnaps).call(this, snapsToRollback);
            throw error;
        }
        return result;
    }
    /**
   * Adds, authorizes, and runs the given snap with a snap provider.
   * Results from this method should be efficiently serializable.
   *
   * @param origin - The origin requesting the snap.
   * @param snapId - The id of the snap.
   * @param location - The location implementation of the snap.
   * @param versionRange - The semver range of the snap to install.
   * @returns The resulting snap object, or an error if something went wrong.
   */ async processRequestedSnap(origin, snapId, location, versionRange) {
        const existingSnap = this.getTruncated(snapId);
        // For devX we always re-install local snaps.
        if (existingSnap && !location.shouldAlwaysReload) {
            if (satisfiesVersionRange(existingSnap.version, versionRange)) {
                return existingSnap;
            }
            return await this.updateSnap(origin, snapId, location, versionRange, // Since we are requesting an update from within processRequestedSnap,
            // we disable the emitting of the snapUpdated event and rely on the caller
            // to publish this event after the update is complete.
            // This is necesary as installSnaps may be installing multiple snaps
            // and we don't want to emit events prematurely.
            false);
        }
        let pendingApproval = _class_private_method_get(this, _createApproval, createApproval).call(this, {
            origin,
            snapId,
            type: SNAP_APPROVAL_INSTALL
        });
        // Existing snaps must be stopped before overwriting
        if (existingSnap && this.isRunning(snapId)) {
            await this.stopSnap(snapId, SnapStatusEvents.Stop);
        }
        // Existing snaps that should be re-installed should not maintain their existing permissions
        if (existingSnap && location.shouldAlwaysReload) {
            _class_private_method_get(this, _revokeAllSnapPermissions, revokeAllSnapPermissions).call(this, snapId);
        }
        try {
            const { sourceCode } = await _class_private_method_get(this, _add, add).call(this, {
                origin,
                id: snapId,
                location,
                versionRange
            });
            await this.authorize(snapId, pendingApproval);
            pendingApproval = _class_private_method_get(this, _createApproval, createApproval).call(this, {
                origin,
                snapId,
                type: SNAP_APPROVAL_RESULT
            });
            await _class_private_method_get(this, _startSnap, startSnap).call(this, {
                snapId,
                sourceCode
            });
            const truncated = this.getTruncatedExpect(snapId);
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                loading: false,
                type: SNAP_APPROVAL_INSTALL
            });
            return truncated;
        } catch (error) {
            logError(`Error when adding ${snapId}.`, error);
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                loading: false,
                type: SNAP_APPROVAL_INSTALL,
                error: error instanceof Error ? error.message : error.toString()
            });
            throw error;
        }
    }
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
   */ async updateSnap(origin, snapId, location, newVersionRange = DEFAULT_REQUESTED_SNAP_VERSION, emitEvent = true) {
        if (!isValidSemVerRange(newVersionRange)) {
            throw new Error(`Received invalid snap version range: "${newVersionRange}".`);
        }
        let pendingApproval = _class_private_method_get(this, _createApproval, createApproval).call(this, {
            origin,
            snapId,
            type: SNAP_APPROVAL_UPDATE
        });
        try {
            const snap = this.getExpect(snapId);
            const newSnap = await _class_private_method_get(this, _fetchSnap, fetchSnap).call(this, snapId, location);
            const newVersion = newSnap.manifest.result.version;
            if (!gtVersion(newVersion, snap.version)) {
                throw ethErrors.rpc.invalidParams(`Snap "${snapId}@${snap.version}" is already installed. Couldn't update to a version inside requested "${newVersionRange}" range.`);
            }
            if (!satisfiesVersionRange(newVersion, newVersionRange)) {
                throw new Error(`Version mismatch. Manifest for "${snapId}" specifies version "${newVersion}" which doesn't satisfy requested version range "${newVersionRange}".`);
            }
            await _class_private_method_get(this, _assertIsInstallAllowed, assertIsInstallAllowed).call(this, snapId, {
                version: newVersion,
                checksum: newSnap.manifest.result.source.shasum
            });
            const processedPermissions = processSnapPermissions(newSnap.manifest.result.initialPermissions);
            _class_private_method_get(this, _validateSnapPermissions, validateSnapPermissions).call(this, processedPermissions);
            const { newPermissions, unusedPermissions, approvedPermissions } = _class_private_method_get(this, _calculatePermissionsChange, calculatePermissionsChange).call(this, snapId, processedPermissions);
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                permissions: newPermissions,
                newVersion: newSnap.manifest.result.version,
                newPermissions,
                approvedPermissions,
                unusedPermissions,
                loading: false
            });
            const { permissions: approvedNewPermissions, ...requestData } = await pendingApproval.promise;
            pendingApproval = _class_private_method_get(this, _createApproval, createApproval).call(this, {
                origin,
                snapId,
                type: SNAP_APPROVAL_RESULT
            });
            if (this.isRunning(snapId)) {
                await this.stopSnap(snapId, SnapStatusEvents.Stop);
            }
            _class_private_method_get(this, _transition, transition).call(this, snapId, SnapStatusEvents.Update);
            _class_private_method_get(this, _set, set).call(this, {
                origin,
                id: snapId,
                manifest: newSnap.manifest,
                files: newSnap.files,
                isUpdate: true
            });
            const unusedPermissionsKeys = Object.keys(unusedPermissions);
            if (isNonEmptyArray(unusedPermissionsKeys)) {
                this.messagingSystem.call('PermissionController:revokePermissions', {
                    [snapId]: unusedPermissionsKeys
                });
            }
            if (isNonEmptyArray(Object.keys(approvedNewPermissions))) {
                this.messagingSystem.call('PermissionController:grantPermissions', {
                    approvedPermissions: approvedNewPermissions,
                    subject: {
                        origin: snapId
                    },
                    requestData
                });
            }
            const rollbackSnapshot = _class_private_method_get(this, _getRollbackSnapshot, getRollbackSnapshot).call(this, snapId);
            if (rollbackSnapshot !== undefined) {
                rollbackSnapshot.permissions.revoked = unusedPermissions;
                rollbackSnapshot.permissions.granted = Object.keys(approvedNewPermissions);
                rollbackSnapshot.permissions.requestData = requestData;
            }
            const normalizedSourcePath = normalizeRelative(newSnap.manifest.result.source.location.npm.filePath);
            const sourceCode = newSnap.files.find((file)=>file.path === normalizedSourcePath)?.toString();
            assert(typeof sourceCode === 'string' && sourceCode.length > 0, `Invalid source code for snap "${snapId}".`);
            try {
                await _class_private_method_get(this, _startSnap, startSnap).call(this, {
                    snapId,
                    sourceCode
                });
            } catch  {
                throw new Error(`Snap ${snapId} crashed with updated source code.`);
            }
            const truncatedSnap = this.getTruncatedExpect(snapId);
            if (emitEvent) {
                this.messagingSystem.publish('SnapController:snapUpdated', truncatedSnap, snap.version);
            }
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                loading: false,
                type: SNAP_APPROVAL_UPDATE
            });
            return truncatedSnap;
        } catch (error) {
            logError(`Error when updating ${snapId},`, error);
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                loading: false,
                error: error instanceof Error ? error.message : error.toString(),
                type: SNAP_APPROVAL_UPDATE
            });
            throw error;
        }
    }
    /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */ async getRegistryMetadata(snapId) {
        return await this.messagingSystem.call('SnapsRegistry:getMetadata', snapId);
    }
    /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * This function is not hash private yet because of tests.
   *
   * @param snapId - The id of the Snap.
   * @param pendingApproval - Pending approval to update.
   * @returns The snap's approvedPermissions.
   */ async authorize(snapId, pendingApproval) {
        log(`Authorizing snap: ${snapId}`);
        const snapsState = this.state.snaps;
        const snap = snapsState[snapId];
        const { initialPermissions } = snap;
        try {
            const processedPermissions = processSnapPermissions(initialPermissions);
            _class_private_method_get(this, _validateSnapPermissions, validateSnapPermissions).call(this, processedPermissions);
            _class_private_method_get(this, _updateApproval, updateApproval).call(this, pendingApproval.id, {
                loading: false,
                permissions: processedPermissions
            });
            const { permissions: approvedPermissions, ...requestData } = await pendingApproval.promise;
            if (isNonEmptyArray(Object.keys(approvedPermissions))) {
                this.messagingSystem.call('PermissionController:grantPermissions', {
                    approvedPermissions,
                    subject: {
                        origin: snapId
                    },
                    requestData
                });
            }
        } finally{
            const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
            runtime.installPromise = null;
        }
    }
    destroy() {
        super.destroy();
        if (_class_private_field_get(this, _timeoutForLastRequestStatus)) {
            clearTimeout(_class_private_field_get(this, _timeoutForLastRequestStatus));
        }
        /* eslint-disable @typescript-eslint/unbound-method */ this.messagingSystem.unsubscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.unsubscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.unsubscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
    /* eslint-enable @typescript-eslint/unbound-method */ }
    /**
   * Passes a JSON-RPC request object to the RPC handler function of a snap.
   *
   * @param options - A bag of options.
   * @param options.snapId - The ID of the recipient snap.
   * @param options.origin - The origin of the RPC request.
   * @param options.handler - The handler to trigger on the snap for the request.
   * @param options.request - The JSON-RPC request object.
   * @returns The result of the JSON-RPC request.
   */ async handleRequest({ snapId, origin, handler: handlerType, request: rawRequest }) {
        const request = {
            jsonrpc: '2.0',
            id: nanoid(),
            ...rawRequest
        };
        assertIsJsonRpcRequest(request);
        const permissionName = handlerEndowments[handlerType];
        const hasPermission = this.messagingSystem.call('PermissionController:hasPermission', snapId, permissionName);
        if (!hasPermission) {
            throw new Error(`Snap "${snapId}" is not permitted to use "${permissionName}".`);
        }
        if (permissionName === SnapEndowments.Rpc || permissionName === SnapEndowments.Keyring) {
            const subject = this.messagingSystem.call('SubjectMetadataController:getSubjectMetadata', origin);
            const permissions = this.messagingSystem.call('PermissionController:getPermissions', snapId);
            const handlerPermissions = permissions?.[permissionName];
            assert(handlerPermissions);
            const origins = permissionName === SnapEndowments.Rpc ? getRpcCaveatOrigins(handlerPermissions) : getKeyringCaveatOrigins(handlerPermissions);
            assert(origins);
            if (!isOriginAllowed(origins, subject?.subjectType ?? SubjectType.Website, origin)) {
                throw new Error(`Snap "${snapId}" is not permitted to handle requests from "${origin}".`);
            }
        }
        const handler = await _class_private_method_get(this, _getRpcRequestHandler, getRpcRequestHandler).call(this, snapId);
        if (!handler) {
            throw new Error(`Snap RPC message handler not found for snap "${snapId}".`);
        }
        return handler({
            origin,
            handler: handlerType,
            request
        });
    }
    constructor({ closeAllConnections, messenger, state, dynamicPermissions = [
        'eth_accounts'
    ], environmentEndowmentPermissions = [], excludedPermissions = {}, idleTimeCheckInterval = inMilliseconds(5, Duration.Second), maxIdleTime = inMilliseconds(30, Duration.Second), maxRequestTime = inMilliseconds(60, Duration.Second), fetchFunction = globalThis.fetch.bind(globalThis), featureFlags = {}, detectSnapLocation: detectSnapLocationFunction = detectSnapLocation }){
        super({
            messenger,
            metadata: {
                snapErrors: {
                    persist: false,
                    anonymous: false
                },
                snapStates: {
                    persist: true,
                    anonymous: false
                },
                snaps: {
                    persist: (snaps)=>{
                        return Object.values(snaps).map((snap)=>{
                            return {
                                ...snap,
                                // At the time state is rehydrated, no snap will be running.
                                status: SnapStatus.Stopped
                            };
                        }).reduce((memo, snap)=>{
                            memo[snap.id] = snap;
                            return memo;
                        }, {});
                    },
                    anonymous: false
                }
            },
            name,
            state: {
                ...defaultState,
                ...state
            }
        });
        _class_private_method_init(this, _initializeStateMachine);
        _class_private_method_init(this, _registerMessageHandlers);
        _class_private_method_init(this, _pollForLastRequestStatus);
        /**
   * Blocks an installed snap and prevents it from being started again. Emits
   * {@link SnapBlocked}. Does nothing if the snap is not installed.
   *
   * @param snapId - The snap to block.
   * @param blockedSnapInfo - Information detailing why the snap is blocked.
   */ _class_private_method_init(this, _blockSnap);
        _class_private_method_init(this, _unblockSnap);
        _class_private_method_init(this, _assertIsInstallAllowed);
        _class_private_method_init(this, _stopSnapsLastRequestPastMax);
        _class_private_method_init(this, _transition);
        /**
   * Terminates the specified snap and emits the `snapTerminated` event.
   *
   * @param snapId - The snap to terminate.
   */ _class_private_method_init(this, _terminateSnap);
        _class_private_method_init(this, _removeSnapFromSubjects);
        _class_private_method_init(this, _revokeAllSnapPermissions);
        _class_private_method_init(this, _createApproval);
        _class_private_method_init(this, _updateApproval);
        /**
   * Returns a promise representing the complete installation of the requested snap.
   * If the snap is already being installed, the previously pending promise will be returned.
   *
   * @param args - Object containing the snap id and either the URL of the snap's manifest,
   * or the snap's manifest and source code. The object may also optionally contain a target
   * version.
   * @returns The resulting snap object.
   */ _class_private_method_init(this, _add);
        _class_private_method_init(this, _startSnap);
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
   */ _class_private_method_init(this, _getEndowments);
        _class_private_method_init(this, _set);
        /**
   * Fetches the manifest and source code of a snap.
   *
   * This function is not hash private yet because of tests.
   *
   * @param snapId - The id of the Snap.
   * @param location - Source from which snap will be fetched.
   * @returns A tuple of the Snap manifest object and the Snap source code.
   */ _class_private_method_init(this, _fetchSnap);
        _class_private_method_init(this, _validateSnapPermissions);
        _class_private_method_init(this, _getRpcRequestHandler);
        /**
   * Awaits the specified promise and rejects if the promise doesn't resolve
   * before the timeout.
   *
   * @param promise - The promise to await.
   * @param timer - An optional timer object to control the timeout.
   * @returns The result of the promise or rejects if the promise times out.
   * @template PromiseValue - The value of the Promise.
   */ _class_private_method_init(this, _executeWithTimeout);
        _class_private_method_init(this, _recordSnapRpcRequestStart);
        _class_private_method_init(this, _recordSnapRpcRequestFinish);
        _class_private_method_init(this, _getRollbackSnapshot);
        _class_private_method_init(this, _createRollbackSnapshot);
        /**
   * Rolls back a snap to its previous state, permissions
   * and source code based on the `RollbackSnapshot` that
   * is captured during the update process. After rolling back,
   * the function also emits an event indicating that the
   * snap has been rolled back and it clears the snapshot
   * for that snap.
   *
   * @param snapId - The snap id.
   * @throws {@link Error}. If a snapshot does not exist.
   */ _class_private_method_init(this, _rollbackSnap);
        /**
   * Iterates through an array of snap ids
   * and calls `rollbackSnap` on them.
   *
   * @param snapIds - An array of snap ids.
   */ _class_private_method_init(this, _rollbackSnaps);
        _class_private_method_init(this, _getRuntime);
        _class_private_method_init(this, _getRuntimeExpect);
        _class_private_method_init(this, _setupRuntime);
        _class_private_method_init(this, _calculatePermissionsChange);
        _class_private_method_init(this, _isValidUpdate);
        /**
   * Call a lifecycle hook on a snap, if the snap has the
   * `endowment:lifecycle-hooks` permission. If the snap does not have the
   * permission, nothing happens.
   *
   * @param snapId - The snap ID.
   * @param handler - The lifecycle hook to call. This should be one of the
   * supported lifecycle hooks.
   * @private
   */ _class_private_method_init(this, _callLifecycleHook);
        _class_private_field_init(this, _closeAllConnections, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _dynamicPermissions, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _environmentEndowmentPermissions, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _excludedPermissions, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _featureFlags, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _fetchFunction, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _idleTimeCheckInterval, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _maxIdleTime, {
            writable: true,
            value: void 0
        });
        // This property cannot be hash private yet because of tests.
        _define_property(this, "maxRequestTime", void 0);
        _class_private_field_init(this, _detectSnapLocation, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _snapsRuntimeData, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _rollbackSnapshots, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _timeoutForLastRequestStatus, {
            writable: true,
            value: void 0
        });
        _class_private_field_init(this, _statusMachine, {
            writable: true,
            value: void 0
        });
        _class_private_field_set(this, _closeAllConnections, closeAllConnections);
        _class_private_field_set(this, _dynamicPermissions, dynamicPermissions);
        _class_private_field_set(this, _environmentEndowmentPermissions, environmentEndowmentPermissions);
        _class_private_field_set(this, _excludedPermissions, excludedPermissions);
        _class_private_field_set(this, _featureFlags, featureFlags);
        _class_private_field_set(this, _fetchFunction, fetchFunction);
        _class_private_field_set(this, _idleTimeCheckInterval, idleTimeCheckInterval);
        _class_private_field_set(this, _maxIdleTime, maxIdleTime);
        this.maxRequestTime = maxRequestTime;
        _class_private_field_set(this, _detectSnapLocation, detectSnapLocationFunction);
        this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
        this._onOutboundRequest = this._onOutboundRequest.bind(this);
        this._onOutboundResponse = this._onOutboundResponse.bind(this);
        _class_private_field_set(this, _rollbackSnapshots, new Map());
        _class_private_field_set(this, _snapsRuntimeData, new Map());
        _class_private_method_get(this, _pollForLastRequestStatus, pollForLastRequestStatus).call(this);
        /* eslint-disable @typescript-eslint/unbound-method */ this.messagingSystem.subscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.subscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.subscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
        /* eslint-enable @typescript-eslint/unbound-method */ this.messagingSystem.subscribe('SnapController:snapInstalled', ({ id })=>{
            _class_private_method_get(this, _callLifecycleHook, callLifecycleHook).call(this, id, HandlerType.OnInstall).catch((error)=>{
                logError(`Error when calling \`onInstall\` lifecycle hook for snap "${id}": ${getErrorMessage(error)}`);
            });
        });
        this.messagingSystem.subscribe('SnapController:snapUpdated', ({ id })=>{
            _class_private_method_get(this, _callLifecycleHook, callLifecycleHook).call(this, id, HandlerType.OnUpdate).catch((error)=>{
                logError(`Error when calling \`onUpdate\` lifecycle hook for snap "${id}": ${getErrorMessage(error)}`);
            });
        });
        _class_private_method_get(this, _initializeStateMachine, initializeStateMachine).call(this);
        _class_private_method_get(this, _registerMessageHandlers, registerMessageHandlers).call(this);
        Object.values(state?.snaps ?? {}).forEach((snap)=>_class_private_method_get(this, _setupRuntime, setupRuntime).call(this, snap.id, {
                sourceCode: snap.sourceCode,
                state: state?.snapStates?.[snap.id] ?? null
            }));
    }
}
function initializeStateMachine() {
    const disableGuard = ({ snapId })=>{
        return this.getExpect(snapId).enabled;
    };
    const statusConfig = {
        initial: SnapStatus.Installing,
        states: {
            [SnapStatus.Installing]: {
                on: {
                    [SnapStatusEvents.Start]: {
                        target: SnapStatus.Running,
                        cond: disableGuard
                    }
                }
            },
            [SnapStatus.Updating]: {
                on: {
                    [SnapStatusEvents.Start]: {
                        target: SnapStatus.Running,
                        cond: disableGuard
                    },
                    [SnapStatusEvents.Stop]: SnapStatus.Stopped
                }
            },
            [SnapStatus.Running]: {
                on: {
                    [SnapStatusEvents.Stop]: SnapStatus.Stopped,
                    [SnapStatusEvents.Crash]: SnapStatus.Crashed
                }
            },
            [SnapStatus.Stopped]: {
                on: {
                    [SnapStatusEvents.Start]: {
                        target: SnapStatus.Running,
                        cond: disableGuard
                    },
                    [SnapStatusEvents.Update]: SnapStatus.Updating
                }
            },
            [SnapStatus.Crashed]: {
                on: {
                    [SnapStatusEvents.Start]: {
                        target: SnapStatus.Running,
                        cond: disableGuard
                    },
                    [SnapStatusEvents.Update]: SnapStatus.Updating
                }
            }
        }
    };
    _class_private_field_set(this, _statusMachine, createMachine(statusConfig));
    validateMachine(_class_private_field_get(this, _statusMachine));
}
function registerMessageHandlers() {
    this.messagingSystem.registerActionHandler(`${controllerName}:clearSnapState`, (...args)=>this.clearSnapState(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:get`, (...args)=>this.get(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:getSnapState`, async (...args)=>this.getSnapState(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:handleRequest`, async (...args)=>this.handleRequest(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:has`, (...args)=>this.has(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:updateBlockedSnaps`, async ()=>this.updateBlockedSnaps());
    this.messagingSystem.registerActionHandler(`${controllerName}:updateSnapState`, async (...args)=>this.updateSnapState(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:enable`, (...args)=>this.enableSnap(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:disable`, async (...args)=>this.disableSnap(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:remove`, async (...args)=>this.removeSnap(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:getPermitted`, (...args)=>this.getPermittedSnaps(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:install`, async (...args)=>this.installSnaps(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:removeSnapError`, (...args)=>this.removeSnapError(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:getAll`, (...args)=>this.getAllSnaps(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:incrementActiveReferences`, (...args)=>this.incrementActiveReferences(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:decrementActiveReferences`, (...args)=>this.decrementActiveReferences(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:getRegistryMetadata`, async (...args)=>this.getRegistryMetadata(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:disconnectOrigin`, (...args)=>this.removeSnapFromSubject(...args));
    this.messagingSystem.registerActionHandler(`${controllerName}:revokeDynamicPermissions`, (...args)=>this.revokeDynamicSnapPermissions(...args));
}
function pollForLastRequestStatus() {
    _class_private_field_set(this, _timeoutForLastRequestStatus, setTimeout(()=>{
        _class_private_method_get(this, _stopSnapsLastRequestPastMax, stopSnapsLastRequestPastMax).call(this).catch((error)=>{
            // TODO: Decide how to handle errors.
            logError(error);
        });
        _class_private_method_get(this, _pollForLastRequestStatus, pollForLastRequestStatus).call(this);
    }, _class_private_field_get(this, _idleTimeCheckInterval)));
}
async function blockSnap(snapId, blockedSnapInfo) {
    if (!this.has(snapId)) {
        return;
    }
    try {
        this.update((state)=>{
            state.snaps[snapId].blocked = true;
            state.snaps[snapId].blockInformation = blockedSnapInfo;
        });
        await this.disableSnap(snapId);
    } catch (error) {
        logError(`Encountered error when stopping blocked snap "${snapId}".`, error);
    }
    this.messagingSystem.publish(`${controllerName}:snapBlocked`, snapId, blockedSnapInfo);
}
function unblockSnap(snapId) {
    if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
        return;
    }
    this.update((state)=>{
        state.snaps[snapId].blocked = false;
        delete state.snaps[snapId].blockInformation;
    });
    this.messagingSystem.publish(`${controllerName}:snapUnblocked`, snapId);
}
async function assertIsInstallAllowed(snapId, snapInfo) {
    const results = await this.messagingSystem.call('SnapsRegistry:get', {
        [snapId]: snapInfo
    });
    const result = results[snapId];
    if (result.status === SnapsRegistryStatus.Blocked) {
        throw new Error(`Cannot install version "${snapInfo.version}" of snap "${snapId}": The version is blocked. ${result.reason?.explanation ?? ''}`);
    } else if (_class_private_field_get(this, _featureFlags).requireAllowlist && result.status !== SnapsRegistryStatus.Verified) {
        throw new Error(`Cannot install version "${snapInfo.version}" of snap "${snapId}": The snap is not on the allow list.`);
    }
}
async function stopSnapsLastRequestPastMax() {
    const entries = [
        ..._class_private_field_get(this, _snapsRuntimeData).entries()
    ];
    return Promise.all(entries.filter(([_snapId, runtime])=>runtime.activeReferences === 0 && runtime.pendingInboundRequests.length === 0 && // lastRequest should always be set here but TypeScript wants this check
        runtime.lastRequest && _class_private_field_get(this, _maxIdleTime) && timeSince(runtime.lastRequest) > _class_private_field_get(this, _maxIdleTime)).map(async ([snapId])=>this.stopSnap(snapId, SnapStatusEvents.Stop)));
}
function transition(snapId, event) {
    const { interpreter } = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
    interpreter.send(event);
    this.update((state)=>{
        state.snaps[snapId].status = interpreter.state.value;
    });
}
async function terminateSnap(snapId) {
    await this.messagingSystem.call('ExecutionService:terminateSnap', snapId);
    this.messagingSystem.publish('SnapController:snapTerminated', this.getTruncatedExpect(snapId));
}
function removeSnapFromSubjects(snapId) {
    const subjects = this.messagingSystem.call('PermissionController:getSubjectNames');
    for (const subject of subjects){
        this.removeSnapFromSubject(subject, snapId);
    }
}
function revokeAllSnapPermissions(snapId) {
    if (this.messagingSystem.call('PermissionController:hasPermissions', snapId)) {
        this.messagingSystem.call('PermissionController:revokeAllPermissions', snapId);
    }
}
function createApproval({ origin, snapId, type }) {
    const id = nanoid();
    const promise = this.messagingSystem.call('ApprovalController:addRequest', {
        origin,
        id,
        type,
        requestData: {
            // Mirror previous installation metadata
            metadata: {
                id,
                origin: snapId,
                dappOrigin: origin
            },
            snapId
        },
        requestState: {
            loading: true
        }
    }, true);
    return {
        id,
        promise
    };
}
function updateApproval(id, requestState) {
    try {
        this.messagingSystem.call('ApprovalController:updateRequestState', {
            id,
            requestState
        });
    } catch  {
    // Do nothing
    }
}
async function add(args) {
    const { id: snapId, location, versionRange } = args;
    _class_private_method_get(this, _setupRuntime, setupRuntime).call(this, snapId, {
        sourceCode: null,
        state: null
    });
    const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
    if (!runtime.installPromise) {
        log(`Adding snap: ${snapId}`);
        // If fetching and setting the snap succeeds, this property will be set
        // to null in the authorize() method.
        runtime.installPromise = (async ()=>{
            const fetchedSnap = await _class_private_method_get(this, _fetchSnap, fetchSnap).call(this, snapId, location);
            const manifest = fetchedSnap.manifest.result;
            if (!satisfiesVersionRange(manifest.version, versionRange)) {
                throw new Error(`Version mismatch. Manifest for "${snapId}" specifies version "${manifest.version}" which doesn't satisfy requested version range "${versionRange}".`);
            }
            await _class_private_method_get(this, _assertIsInstallAllowed, assertIsInstallAllowed).call(this, snapId, {
                version: manifest.version,
                checksum: manifest.source.shasum
            });
            return _class_private_method_get(this, _set, set).call(this, {
                ...args,
                ...fetchedSnap,
                id: snapId
            });
        })();
    }
    try {
        return await runtime.installPromise;
    } catch (error) {
        // Reset promise so users can retry installation in case the problem is
        // temporary.
        runtime.installPromise = null;
        throw error;
    }
}
async function startSnap(snapData) {
    const { snapId } = snapData;
    if (this.isRunning(snapId)) {
        throw new Error(`Snap "${snapId}" is already started.`);
    }
    try {
        const result = await _class_private_method_get(this, _executeWithTimeout, executeWithTimeout).call(this, this.messagingSystem.call('ExecutionService:executeSnap', {
            ...snapData,
            endowments: await _class_private_method_get(this, _getEndowments, getEndowments).call(this, snapId)
        }));
        _class_private_method_get(this, _transition, transition).call(this, snapId, SnapStatusEvents.Start);
        return result;
    } catch (error) {
        await _class_private_method_get(this, _terminateSnap, terminateSnap).call(this, snapId);
        throw error;
    }
}
async function getEndowments(snapId) {
    let allEndowments = [];
    for (const permissionName of _class_private_field_get(this, _environmentEndowmentPermissions)){
        if (this.messagingSystem.call('PermissionController:hasPermission', snapId, permissionName)) {
            const endowments = await this.messagingSystem.call('PermissionController:getEndowments', snapId, permissionName);
            if (endowments) {
                // We don't have any guarantees about the type of the endowments
                // value, so we have to guard at runtime.
                if (!Array.isArray(endowments) || endowments.some((value)=>typeof value !== 'string')) {
                    throw new Error('Expected an array of string endowment names.');
                }
                allEndowments = allEndowments.concat(endowments);
            }
        }
    }
    const dedupedEndowments = [
        ...new Set([
            ...DEFAULT_ENDOWMENTS,
            ...allEndowments
        ])
    ];
    if (dedupedEndowments.length < // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    DEFAULT_ENDOWMENTS.length + allEndowments.length) {
        logError(`Duplicate endowments found for ${snapId}. Default endowments should not be requested.`, allEndowments);
    }
    return dedupedEndowments;
}
function set(args) {
    const { id: snapId, origin, manifest, files, isUpdate = false } = args;
    assertIsSnapManifest(manifest.result);
    const { version } = manifest.result;
    const normalizedSourcePath = normalizeRelative(manifest.result.source.location.npm.filePath);
    const { iconPath } = manifest.result.source.location.npm;
    const normalizedIconPath = iconPath && normalizeRelative(iconPath);
    const sourceCode = files.find((file)=>file.path === normalizedSourcePath)?.toString();
    const svgIcon = normalizedIconPath ? files.find((file)=>file.path === normalizedIconPath) : undefined;
    assert(typeof sourceCode === 'string' && sourceCode.length > 0, `Invalid source code for snap "${snapId}".`);
    const snapsState = this.state.snaps;
    const existingSnap = snapsState[snapId];
    const previousVersionHistory = existingSnap?.versionHistory ?? [];
    const versionHistory = [
        ...previousVersionHistory,
        {
            version,
            date: Date.now(),
            origin
        }
    ];
    const snap = {
        // Restore relevant snap state if it exists
        ...existingSnap,
        // Note that the snap will be unblocked and enabled, regardless of its
        // previous state.
        blocked: false,
        enabled: true,
        id: snapId,
        initialPermissions: manifest.result.initialPermissions,
        manifest: manifest.result,
        status: _class_private_field_get(this, _statusMachine).config.initial,
        sourceCode,
        version,
        versionHistory
    };
    // If the snap was blocked, it isn't any longer
    delete snap.blockInformation;
    // store the snap back in state
    const { inversePatches } = this.update((state)=>{
        state.snaps[snapId] = snap;
    });
    // checking for isUpdate here as this function is also used in
    // the install flow, we do not care to create snapshots for installs
    if (isUpdate) {
        const rollbackSnapshot = _class_private_method_get(this, _getRollbackSnapshot, getRollbackSnapshot).call(this, snapId);
        if (rollbackSnapshot !== undefined) {
            rollbackSnapshot.statePatches = inversePatches;
        }
    }
    this.messagingSystem.publish(`SnapController:snapAdded`, snap, svgIcon?.toString());
    return {
        ...snap,
        sourceCode
    };
}
async function fetchSnap(snapId, location) {
    try {
        const manifest = await location.manifest();
        const sourceCode = await location.fetch(manifest.result.source.location.npm.filePath);
        const { iconPath } = manifest.result.source.location.npm;
        const svgIcon = iconPath ? await location.fetch(iconPath) : undefined;
        const files = [
            sourceCode
        ];
        if (svgIcon) {
            files.push(svgIcon);
        }
        validateFetchedSnap({
            manifest,
            sourceCode,
            svgIcon
        });
        return {
            manifest,
            files,
            location
        };
    } catch (error) {
        throw new Error(`Failed to fetch snap "${snapId}": ${getErrorMessage(error)}.`);
    }
}
function validateSnapPermissions(processedPermissions) {
    const permissionKeys = Object.keys(processedPermissions);
    const handlerPermissions = Array.from(new Set(Object.values(handlerEndowments)));
    assert(permissionKeys.some((key)=>handlerPermissions.includes(key)), `A snap must request at least one of the following permissions: ${handlerPermissions.join(', ')}.`);
    const excludedPermissionErrors = permissionKeys.reduce((errors, permission)=>{
        if (hasProperty(_class_private_field_get(this, _excludedPermissions), permission)) {
            errors.push(_class_private_field_get(this, _excludedPermissions)[permission]);
        }
        return errors;
    }, []);
    assert(excludedPermissionErrors.length === 0, `One or more permissions are not allowed:\n${excludedPermissionErrors.join('\n')}`);
}
function getRpcRequestHandler(snapId) {
    const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
    const existingHandler = runtime.rpcHandler;
    if (existingHandler) {
        return existingHandler;
    }
    const requestQueue = new RequestQueue(5);
    // We need to set up this promise map to map snapIds to their respective startPromises,
    // because otherwise we would lose context on the correct startPromise.
    const startPromises = new Map();
    const rpcHandler = async ({ origin, handler: handlerType, request })=>{
        if (this.state.snaps[snapId].enabled === false) {
            throw new Error(`Snap "${snapId}" is disabled.`);
        }
        if (this.state.snaps[snapId].status === SnapStatus.Installing) {
            throw new Error(`Snap "${snapId}" is currently being installed. Please try again later.`);
        }
        if (!this.isRunning(snapId)) {
            let localStartPromise = startPromises.get(snapId);
            if (!localStartPromise) {
                localStartPromise = this.startSnap(snapId);
                startPromises.set(snapId, localStartPromise);
            } else if (requestQueue.get(origin) >= requestQueue.maxQueueSize) {
                throw new Error('Exceeds maximum number of requests waiting to be resolved, please try again.');
            }
            requestQueue.increment(origin);
            try {
                await localStartPromise;
            } finally{
                requestQueue.decrement(origin);
                // Only delete startPromise for a snap if its value hasn't changed
                if (startPromises.get(snapId) === localStartPromise) {
                    startPromises.delete(snapId);
                }
            }
        }
        const timer = new Timer(this.maxRequestTime);
        _class_private_method_get(this, _recordSnapRpcRequestStart, recordSnapRpcRequestStart).call(this, snapId, request.id, timer);
        const handleRpcRequestPromise = this.messagingSystem.call('ExecutionService:handleRpcRequest', snapId, {
            origin,
            handler: handlerType,
            request
        });
        // This will either get the result or reject due to the timeout.
        try {
            const result = await _class_private_method_get(this, _executeWithTimeout, executeWithTimeout).call(this, handleRpcRequestPromise, timer);
            _class_private_method_get(this, _recordSnapRpcRequestFinish, recordSnapRpcRequestFinish).call(this, snapId, request.id);
            return result;
        } catch (error) {
            await this.stopSnap(snapId, SnapStatusEvents.Crash);
            throw error;
        }
    };
    runtime.rpcHandler = rpcHandler;
    return rpcHandler;
}
async function executeWithTimeout(promise, timer) {
    const result = await withTimeout(promise, timer ?? this.maxRequestTime);
    if (result === hasTimedOut) {
        throw new Error('The request timed out.');
    }
    return result;
}
function recordSnapRpcRequestStart(snapId, requestId, timer) {
    const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
    runtime.pendingInboundRequests.push({
        requestId,
        timer
    });
    runtime.lastRequest = null;
}
function recordSnapRpcRequestFinish(snapId, requestId) {
    const runtime = _class_private_method_get(this, _getRuntimeExpect, getRuntimeExpect).call(this, snapId);
    runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter((request)=>request.requestId !== requestId);
    if (runtime.pendingInboundRequests.length === 0) {
        runtime.lastRequest = Date.now();
    }
}
function getRollbackSnapshot(snapId) {
    return _class_private_field_get(this, _rollbackSnapshots).get(snapId);
}
function createRollbackSnapshot(snapId) {
    assert(_class_private_field_get(this, _rollbackSnapshots).get(snapId) === undefined, new Error(`Snap "${snapId}" rollback snapshot already exists.`));
    _class_private_field_get(this, _rollbackSnapshots).set(snapId, {
        statePatches: [],
        permissions: {
            revoked: null,
            granted: [],
            requestData: null
        },
        newVersion: ''
    });
    const newRollbackSnapshot = _class_private_field_get(this, _rollbackSnapshots).get(snapId);
    assert(newRollbackSnapshot !== undefined, new Error(`Snapshot creation failed for ${snapId}.`));
    return newRollbackSnapshot;
}
async function rollbackSnap(snapId) {
    const rollbackSnapshot = _class_private_method_get(this, _getRollbackSnapshot, getRollbackSnapshot).call(this, snapId);
    if (!rollbackSnapshot) {
        throw new Error('A snapshot does not exist for this snap.');
    }
    await this.stopSnap(snapId, SnapStatusEvents.Stop);
    // Always set to stopped even if it wasn't running initially
    if (this.get(snapId)?.status !== SnapStatus.Stopped) {
        _class_private_method_get(this, _transition, transition).call(this, snapId, SnapStatusEvents.Stop);
    }
    const { statePatches, permissions } = rollbackSnapshot;
    if (statePatches?.length) {
        this.applyPatches(statePatches);
    }
    // Reset snap status, as we may have been in another state when we stored state patches
    // But now we are 100% in a stopped state
    if (this.get(snapId)?.status !== SnapStatus.Stopped) {
        this.update((state)=>{
            state.snaps[snapId].status = SnapStatus.Stopped;
        });
    }
    if (permissions.revoked && Object.keys(permissions.revoked).length) {
        this.messagingSystem.call('PermissionController:grantPermissions', {
            approvedPermissions: permissions.revoked,
            subject: {
                origin: snapId
            },
            requestData: permissions.requestData
        });
    }
    if (permissions.granted?.length) {
        this.messagingSystem.call('PermissionController:revokePermissions', {
            [snapId]: permissions.granted
        });
    }
    const truncatedSnap = this.getTruncatedExpect(snapId);
    this.messagingSystem.publish('SnapController:snapRolledback', truncatedSnap, rollbackSnapshot.newVersion);
    _class_private_field_get(this, _rollbackSnapshots).delete(snapId);
}
async function rollbackSnaps(snapIds) {
    for (const snapId of snapIds){
        await _class_private_method_get(this, _rollbackSnap, rollbackSnap).call(this, snapId);
    }
}
function getRuntime(snapId) {
    return _class_private_field_get(this, _snapsRuntimeData).get(snapId);
}
function getRuntimeExpect(snapId) {
    const runtime = _class_private_method_get(this, _getRuntime, getRuntime).call(this, snapId);
    assert(runtime !== undefined, new Error(`Snap "${snapId}" runtime data not found`));
    return runtime;
}
function setupRuntime(snapId, data) {
    if (_class_private_field_get(this, _snapsRuntimeData).has(snapId)) {
        return;
    }
    const snap = this.get(snapId);
    const interpreter = interpret(_class_private_field_get(this, _statusMachine));
    interpreter.start({
        context: {
            snapId
        },
        value: snap?.status ?? _class_private_field_get(this, _statusMachine).config.initial
    });
    forceStrict(interpreter);
    _class_private_field_get(this, _snapsRuntimeData).set(snapId, {
        lastRequest: null,
        rpcHandler: null,
        installPromise: null,
        activeReferences: 0,
        pendingInboundRequests: [],
        pendingOutboundRequests: 0,
        interpreter,
        ...data
    });
}
function calculatePermissionsChange(snapId, desiredPermissionsSet) {
    const oldPermissions = this.messagingSystem.call('PermissionController:getPermissions', snapId) ?? {};
    const newPermissions = setDiff(desiredPermissionsSet, oldPermissions);
    // TODO(ritave): The assumption that these are unused only holds so long as we do not
    //               permit dynamic permission requests.
    const unusedPermissions = setDiff(oldPermissions, desiredPermissionsSet);
    // It's a Set Intersection of oldPermissions and desiredPermissionsSet
    // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
    const approvedPermissions = setDiff(oldPermissions, unusedPermissions);
    return {
        newPermissions,
        unusedPermissions,
        approvedPermissions
    };
}
function isValidUpdate(snapId, newVersionRange) {
    const existingSnap = this.getExpect(snapId);
    if (satisfiesVersionRange(existingSnap.version, newVersionRange)) {
        return false;
    }
    if (gtRange(existingSnap.version, newVersionRange)) {
        return false;
    }
    return true;
}
async function callLifecycleHook(snapId, handler) {
    const permissionName = handlerEndowments[handler];
    const hasPermission = this.messagingSystem.call('PermissionController:hasPermission', snapId, permissionName);
    if (!hasPermission) {
        return;
    }
    await this.handleRequest({
        snapId,
        handler,
        origin: '',
        request: {
            jsonrpc: '2.0',
            method: handler
        }
    });
}

//# sourceMappingURL=SnapController.js.map