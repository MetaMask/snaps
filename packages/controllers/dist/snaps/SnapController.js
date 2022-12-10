"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapController = exports.AppKeyType = exports.SNAP_APPROVAL_UPDATE = exports.SNAP_APPROVAL_INSTALL = exports.controllerName = void 0;
const browser_passworder_1 = __importDefault(require("@metamask/browser-passworder"));
const controllers_1 = require("@metamask/controllers");
const snap_utils_1 = require("@metamask/snap-utils");
const utils_1 = require("@metamask/utils");
const fsm_1 = require("@xstate/fsm");
const eth_rpc_errors_1 = require("eth-rpc-errors");
const nanoid_1 = require("nanoid");
const rpc_methods_1 = require("@metamask/rpc-methods");
const fsm_2 = require("../fsm");
const utils_2 = require("../utils");
const endowments_1 = require("./endowments");
const RequestQueue_1 = require("./RequestQueue");
const utils_3 = require("./utils");
const Timer_1 = require("./Timer");
exports.controllerName = 'SnapController';
// TODO: Figure out how to name these
exports.SNAP_APPROVAL_INSTALL = 'wallet_installSnap';
exports.SNAP_APPROVAL_UPDATE = 'wallet_updateSnap';
const TRUNCATED_SNAP_PROPERTIES = new Set([
    'initialPermissions',
    'id',
    'permissionName',
    'version',
    'enabled',
    'blocked',
]);
var AppKeyType;
(function (AppKeyType) {
    AppKeyType["stateEncryption"] = "stateEncryption";
})(AppKeyType = exports.AppKeyType || (exports.AppKeyType = {}));
const defaultState = {
    snapErrors: {},
    snaps: {},
    snapStates: {},
};
/**
 * Truncates the properties of a snap to only ones that are easily serializable.
 *
 * @param snap - The snap to truncate.
 * @returns Object with serializable snap properties.
 */
function truncateSnap(snap) {
    return Object.keys(snap).reduce((serialized, key) => {
        if (TRUNCATED_SNAP_PROPERTIES.has(key)) {
            serialized[key] = snap[key];
        }
        return serialized;
    }, {});
}
const name = 'SnapController';
/*
 * A snap is initialized in three phases:
 * - Add: Loads the snap from a remote source and parses it.
 * - Authorize: Requests the snap's required permissions from the user.
 * - Start: Initializes the snap in its SES realm with the authorized permissions.
 */
class SnapController extends controllers_1.BaseControllerV2 {
    constructor({ closeAllConnections, messenger, state, getAppKey, environmentEndowmentPermissions = [], npmRegistryUrl, idleTimeCheckInterval = (0, utils_1.inMilliseconds)(5, utils_1.Duration.Second), checkBlockList, maxIdleTime = (0, utils_1.inMilliseconds)(30, utils_1.Duration.Second), maxRequestTime = (0, utils_1.inMilliseconds)(60, utils_1.Duration.Second), fetchFunction = globalThis.fetch.bind(globalThis), featureFlags = {}, }) {
        var _a;
        const loadedSourceCode = {};
        const filteredState = Object.assign(Object.assign({}, state), { snaps: Object.values((_a = state === null || state === void 0 ? void 0 : state.snaps) !== null && _a !== void 0 ? _a : {}).reduce((memo, snap) => {
                const { sourceCode } = snap, rest = __rest(snap, ["sourceCode"]);
                loadedSourceCode[snap.id] = sourceCode;
                memo[snap.id] = rest;
                return memo;
            }, {}), snapStates: {} });
        super({
            messenger,
            metadata: {
                snapErrors: {
                    persist: false,
                    anonymous: false,
                },
                snapStates: {
                    persist: () => {
                        return Object.keys(this.state.snaps).reduce((acc, cur) => {
                            acc[cur] = this.getRuntimeExpect(cur).state;
                            return acc;
                        }, {});
                    },
                    anonymous: false,
                },
                snaps: {
                    persist: (snaps) => {
                        return Object.values(snaps)
                            .map((snap) => {
                            return Object.assign(Object.assign({}, snap), { sourceCode: this.getRuntimeExpect(snap.id).sourceCode, 
                                // At the time state is rehydrated, no snap will be running.
                                status: snap_utils_1.SnapStatus.Stopped });
                        })
                            .reduce((memo, snap) => {
                            memo[snap.id] = snap;
                            return memo;
                        }, {});
                    },
                    anonymous: false,
                },
            },
            name,
            state: Object.assign(Object.assign({}, defaultState), filteredState),
        });
        this._closeAllConnections = closeAllConnections;
        this._environmentEndowmentPermissions = environmentEndowmentPermissions;
        this._featureFlags = featureFlags;
        this._fetchFunction = fetchFunction;
        this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
        this._getAppKey = getAppKey;
        this._idleTimeCheckInterval = idleTimeCheckInterval;
        this._checkSnapBlockList = checkBlockList;
        this._maxIdleTime = maxIdleTime;
        this._maxRequestTime = maxRequestTime;
        this._npmRegistryUrl = npmRegistryUrl;
        this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
        this._onOutboundRequest = this._onOutboundRequest.bind(this);
        this._onOutboundResponse = this._onOutboundResponse.bind(this);
        this._snapsRuntimeData = new Map();
        this._pollForLastRequestStatus();
        this.messagingSystem.subscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.subscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.subscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
        this.initializeStateMachine();
        this.registerMessageHandlers();
        Object.keys(filteredState.snaps).forEach((id) => {
            var _a, _b;
            return this.setupRuntime(id, {
                sourceCode: loadedSourceCode[id],
                state: (_b = (_a = state === null || state === void 0 ? void 0 : state.snapStates) === null || _a === void 0 ? void 0 : _a[id]) !== null && _b !== void 0 ? _b : null,
            });
        });
    }
    /**
     * We track status of a Snap using a finite-state-machine.
     * It keeps track of whether the snap is started / stopped / etc.
     *
     * @see {@link SnapController.transition} for interacting with the machine.
     */
    // We initialize the machine in the instance because the status is currently tightly coupled
    // with the SnapController - the guard checks for enabled status inside the SnapController state.
    // In the future, side-effects could be added to the machine during transitions.
    initializeStateMachine() {
        const disableGuard = ({ snapId }) => {
            return this.getExpect(snapId).enabled;
        };
        const statusConfig = {
            initial: snap_utils_1.SnapStatus.Installing,
            states: {
                [snap_utils_1.SnapStatus.Installing]: {
                    on: {
                        [snap_utils_1.SnapStatusEvents.Start]: {
                            target: snap_utils_1.SnapStatus.Running,
                            cond: disableGuard,
                        },
                    },
                },
                [snap_utils_1.SnapStatus.Updating]: {
                    on: {
                        [snap_utils_1.SnapStatusEvents.Start]: {
                            target: snap_utils_1.SnapStatus.Running,
                            cond: disableGuard,
                        },
                    },
                },
                [snap_utils_1.SnapStatus.Running]: {
                    on: {
                        [snap_utils_1.SnapStatusEvents.Stop]: snap_utils_1.SnapStatus.Stopped,
                        [snap_utils_1.SnapStatusEvents.Crash]: snap_utils_1.SnapStatus.Crashed,
                    },
                },
                [snap_utils_1.SnapStatus.Stopped]: {
                    on: {
                        [snap_utils_1.SnapStatusEvents.Start]: {
                            target: snap_utils_1.SnapStatus.Running,
                            cond: disableGuard,
                        },
                        [snap_utils_1.SnapStatusEvents.Update]: snap_utils_1.SnapStatus.Updating,
                    },
                },
                [snap_utils_1.SnapStatus.Crashed]: {
                    on: {
                        [snap_utils_1.SnapStatusEvents.Start]: {
                            target: snap_utils_1.SnapStatus.Running,
                            cond: disableGuard,
                        },
                    },
                },
            },
        };
        this._statusMachine = (0, fsm_1.createMachine)(statusConfig);
        (0, fsm_2.validateMachine)(this._statusMachine);
    }
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    registerMessageHandlers() {
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:clearSnapState`, (...args) => this.clearSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:get`, (...args) => this.get(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:getSnapState`, (...args) => this.getSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:handleRequest`, (...args) => this.handleRequest(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:has`, (...args) => this.has(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:updateBlockedSnaps`, () => this.updateBlockedSnaps());
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:updateSnapState`, (...args) => this.updateSnapState(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:enable`, (...args) => this.enableSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:disable`, (...args) => this.disableSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:remove`, (...args) => this.removeSnap(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:getPermitted`, (...args) => this.getPermittedSnaps(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:install`, (...args) => this.installSnaps(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:removeSnapError`, (...args) => this.removeSnapError(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:getAll`, (...args) => this.getAllSnaps(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:incrementActiveReferences`, (...args) => this.incrementActiveReferences(...args));
        this.messagingSystem.registerActionHandler(`${exports.controllerName}:decrementActiveReferences`, (...args) => this.decrementActiveReferences(...args));
    }
    _pollForLastRequestStatus() {
        this._timeoutForLastRequestStatus = setTimeout(async () => {
            await this._stopSnapsLastRequestPastMax();
            this._pollForLastRequestStatus();
        }, this._idleTimeCheckInterval);
    }
    /**
     * Checks all installed snaps against the block list and
     * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
     * for more information.
     */
    async updateBlockedSnaps() {
        const blockedSnaps = await this._checkSnapBlockList(Object.values(this.state.snaps).reduce((blockListArg, snap) => {
            blockListArg[snap.id] = {
                version: snap.version,
                shasum: snap.manifest.source.shasum,
            };
            return blockListArg;
        }, {}));
        await Promise.all(Object.entries(blockedSnaps).map((_a) => {
            var [snapId, _b] = _a, { blocked } = _b, blockData = __rest(_b, ["blocked"]);
            if (blocked) {
                return this._blockSnap(snapId, blockData);
            }
            return this._unblockSnap(snapId);
        }));
    }
    /**
     * Blocks an installed snap and prevents it from being started again. Emits
     * {@link SnapBlocked}. Does nothing if the snap is not installed.
     *
     * @param snapId - The snap to block.
     * @param blockedSnapInfo - Information detailing why the snap is blocked.
     */
    async _blockSnap(snapId, blockedSnapInfo) {
        if (!this.has(snapId)) {
            return;
        }
        try {
            this.update((state) => {
                state.snaps[snapId].blocked = true;
                state.snaps[snapId].blockInformation = blockedSnapInfo;
            });
            await this.disableSnap(snapId);
        }
        catch (error) {
            console.error(`Encountered error when stopping blocked snap "${snapId}".`, error);
        }
        this.messagingSystem.publish(`${exports.controllerName}:snapBlocked`, snapId, blockedSnapInfo);
    }
    /**
     * Unblocks a snap so that it can be enabled and started again. Emits
     * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
     * unblocked.
     *
     * @param snapId - The id of the snap to unblock.
     */
    async _unblockSnap(snapId) {
        if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
            return;
        }
        this.update((state) => {
            state.snaps[snapId].blocked = false;
            delete state.snaps[snapId].blockInformation;
        });
        this.messagingSystem.publish(`${exports.controllerName}:snapUnblocked`, snapId);
    }
    /**
     * Checks the block list to determine whether a version of a snap is blocked.
     *
     * @param snapId - The snap id to check.
     * @param snapInfo - Snap information containing version and shasum.
     * @returns Whether the version of the snap is blocked or not.
     */
    async isBlocked(snapId, snapInfo) {
        const result = await this._checkSnapBlockList({
            [snapId]: snapInfo,
        });
        return result[snapId].blocked;
    }
    /**
     * Asserts that a version of a snap is not blocked. Succeeds automatically
     * if {@link SnapController._checkSnapBlockList} is undefined.
     *
     * @param snapId - The id of the snap to check.
     * @param snapInfo - Snap information containing version and shasum.
     */
    async _assertIsUnblocked(snapId, snapInfo) {
        if (await this.isBlocked(snapId, snapInfo)) {
            throw new Error(`Cannot install version "${snapInfo.version}" of snap "${snapId}": the version is blocked.`);
        }
    }
    async _stopSnapsLastRequestPastMax() {
        const entries = [...this._snapsRuntimeData.entries()];
        return Promise.all(entries
            .filter(([_snapId, runtime]) => runtime.activeReferences === 0 &&
            runtime.pendingInboundRequests.length === 0 &&
            // lastRequest should always be set here but TypeScript wants this check
            runtime.lastRequest &&
            this._maxIdleTime &&
            (0, utils_1.timeSince)(runtime.lastRequest) > this._maxIdleTime)
            .map(([snapId]) => this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Stop)));
    }
    async _onUnhandledSnapError(snapId, error) {
        await this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Crash);
        this.addSnapError(error);
    }
    async _onOutboundRequest(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        // Ideally we would only pause the pending request that is making the outbound request
        // but right now we don't have a way to know which request initiated the outbound request
        runtime.pendingInboundRequests
            .filter((pendingRequest) => pendingRequest.timer.status === 'running')
            .forEach((pendingRequest) => pendingRequest.timer.pause());
        runtime.pendingOutboundRequests += 1;
    }
    async _onOutboundResponse(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        runtime.pendingOutboundRequests -= 1;
        if (runtime.pendingOutboundRequests === 0) {
            runtime.pendingInboundRequests
                .filter((pendingRequest) => pendingRequest.timer.status === 'paused')
                .forEach((pendingRequest) => pendingRequest.timer.resume());
        }
    }
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
    transition(snapId, event) {
        const { interpreter } = this.getRuntimeExpect(snapId);
        interpreter.send(event);
        this.update((state) => {
            state.snaps[snapId].status = interpreter.state.value;
        });
    }
    /**
     * Starts the given snap. Throws an error if no such snap exists
     * or if it is already running.
     *
     * @param snapId - The id of the Snap to start.
     */
    async startSnap(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        if (this.state.snaps[snapId].enabled === false) {
            throw new Error(`Snap "${snapId}" is disabled.`);
        }
        (0, utils_1.assert)(runtime.sourceCode);
        await this._startSnap({
            snapId,
            sourceCode: runtime.sourceCode,
        });
    }
    /**
     * Enables the given snap. A snap can only be started if it is enabled. A snap
     * can only be enabled if it isn't blocked.
     *
     * @param snapId - The id of the Snap to enable.
     */
    enableSnap(snapId) {
        this.getExpect(snapId);
        if (this.state.snaps[snapId].blocked) {
            throw new Error(`Snap "${snapId}" is blocked and cannot be enabled.`);
        }
        this.update((state) => {
            state.snaps[snapId].enabled = true;
        });
    }
    /**
     * Disables the given snap. A snap can only be started if it is enabled.
     *
     * @param snapId - The id of the Snap to disable.
     * @returns A promise that resolves once the snap has been disabled.
     */
    disableSnap(snapId) {
        if (!this.has(snapId)) {
            throw new Error(`Snap "${snapId}" not found.`);
        }
        this.update((state) => {
            state.snaps[snapId].enabled = false;
        });
        if (this.isRunning(snapId)) {
            return this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Stop);
        }
        return Promise.resolve();
    }
    /**
     * Stops the given snap, removes all hooks, closes all connections, and
     * terminates its worker.
     *
     * @param snapId - The id of the Snap to stop.
     * @param statusEvent - The Snap status event that caused the snap to be
     * stopped.
     */
    async stopSnap(snapId, statusEvent = snap_utils_1.SnapStatusEvents.Stop) {
        const runtime = this.getRuntime(snapId);
        if (!runtime) {
            throw new Error(`The snap "${snapId}" is not running.`);
        }
        // Reset request tracking
        runtime.lastRequest = null;
        runtime.pendingInboundRequests = [];
        runtime.pendingOutboundRequests = 0;
        try {
            if (this.isRunning(snapId)) {
                this._closeAllConnections(snapId);
                await this.terminateSnap(snapId);
            }
        }
        finally {
            if (this.isRunning(snapId)) {
                this.transition(snapId, statusEvent);
            }
        }
    }
    /**
     * Terminates the specified snap and emits the `snapTerminated` event.
     *
     * @param snapId - The snap to terminate.
     */
    async terminateSnap(snapId) {
        await this.messagingSystem.call('ExecutionService:terminateSnap', snapId);
        this.messagingSystem.publish('SnapController:snapTerminated', this.getTruncatedExpect(snapId));
    }
    /**
     * Returns whether the given snap is running.
     * Throws an error if the snap doesn't exist.
     *
     * @param snapId - The id of the Snap to check.
     * @returns `true` if the snap is running, otherwise `false`.
     */
    isRunning(snapId) {
        return this.getExpect(snapId).status === 'running';
    }
    /**
     * Returns whether the given snap has been added to state.
     *
     * @param snapId - The id of the Snap to check for.
     * @returns `true` if the snap exists in the controller state, otherwise `false`.
     */
    has(snapId) {
        return Boolean(this.get(snapId));
    }
    /**
     * Gets the snap with the given id if it exists, including all data.
     * This should not be used if the snap is to be serializable, as e.g.
     * the snap sourceCode may be quite large.
     *
     * @param snapId - The id of the Snap to get.
     * @returns The entire snap object from the controller state.
     */
    get(snapId) {
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
     */
    getExpect(snapId) {
        const snap = this.get(snapId);
        (0, utils_1.assert)(snap !== undefined, new Error(`Snap "${snapId}" not found.`));
        return snap;
    }
    /**
     * Gets the snap with the given id if it exists, excluding any
     * non-serializable or expensive-to-serialize data.
     *
     * @param snapId - The id of the Snap to get.
     * @returns A truncated version of the snap state, that is less expensive to serialize.
     */
    // TODO(ritave): this.get returns undefined, this.getTruncated returns null
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
     */
    getTruncatedExpect(snapId) {
        return truncateSnap(this.getExpect(snapId));
    }
    /**
     * Updates the own state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be updated.
     * @param newSnapState - The new state of the snap.
     */
    async updateSnapState(snapId, newSnapState) {
        const encrypted = await this.encryptSnapState(snapId, newSnapState);
        const runtime = this.getRuntimeExpect(snapId);
        runtime.state = encrypted;
    }
    /**
     * Clears the state of the snap with the given id.
     * This is distinct from the state MetaMask uses to manage snaps.
     *
     * @param snapId - The id of the Snap whose state should be cleared.
     */
    async clearSnapState(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        runtime.state = null;
    }
    /**
     * Adds error from a snap to the SnapController state.
     *
     * @param snapError - The error to store on the SnapController.
     */
    addSnapError(snapError) {
        this.update((state) => {
            const id = (0, nanoid_1.nanoid)();
            state.snapErrors[id] = Object.assign(Object.assign({}, snapError), { internalID: id });
        });
    }
    /**
     * Removes an error by internalID from a the SnapControllers state.
     *
     * @param internalID - The internal error ID to remove on the SnapController.
     */
    async removeSnapError(internalID) {
        this.update((state) => {
            delete state.snapErrors[internalID];
        });
    }
    /**
     * Clears all errors from the SnapControllers state.
     *
     */
    async clearSnapErrors() {
        this.update((state) => {
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
     */
    async getSnapState(snapId) {
        const { state } = this.getRuntimeExpect(snapId);
        return state ? this.decryptSnapState(snapId, state) : null;
    }
    async getEncryptionKey(snapId) {
        return this._getAppKey(snapId, AppKeyType.stateEncryption);
    }
    async encryptSnapState(snapId, state) {
        const appKey = await this.getEncryptionKey(snapId);
        return browser_passworder_1.default.encrypt(appKey, state);
    }
    async decryptSnapState(snapId, encrypted) {
        const appKey = await this.getEncryptionKey(snapId);
        try {
            return await browser_passworder_1.default.decrypt(appKey, encrypted);
        }
        catch (err) {
            throw new Error('Failed to decrypt snap state, the state must be corrupted.');
        }
    }
    /**
     * Completely clear the controller's state: delete all associated data,
     * handlers, event listeners, and permissions; tear down all snap providers.
     */
    clearState() {
        const snapIds = Object.keys(this.state.snaps);
        snapIds.forEach((snapId) => {
            this._closeAllConnections(snapId);
        });
        this.messagingSystem.call('ExecutionService:terminateAllSnaps');
        snapIds.forEach(this.revokeAllSnapPermissions);
        this.update((state) => {
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
     */
    async removeSnap(snapId) {
        return this.removeSnaps([snapId]);
    }
    /**
     * Stops the given snaps, removes them from state, and clears all associated
     * permissions, handlers, and listeners.
     *
     * @param snapIds - The ids of the Snaps.
     */
    async removeSnaps(snapIds) {
        if (!Array.isArray(snapIds)) {
            throw new Error('Expected array of snap ids.');
        }
        await Promise.all(snapIds.map(async (snapId) => {
            const truncated = this.getTruncatedExpect(snapId);
            // Disable the snap and revoke all of its permissions before deleting
            // it. This ensures that the snap will not be restarted or otherwise
            // affect the host environment while we are deleting it.
            await this.disableSnap(snapId);
            this.revokeAllSnapPermissions(snapId);
            const permissionName = (0, snap_utils_1.getSnapPermissionName)(snapId);
            // Revoke all subjects access to the snap
            this.messagingSystem.call('PermissionController:revokePermissionForAllSubjects', permissionName);
            this._snapsRuntimeData.delete(snapId);
            this.update((state) => {
                delete state.snaps[snapId];
                delete state.snapStates[snapId];
            });
            this.messagingSystem.publish(`SnapController:snapRemoved`, truncated);
        }));
    }
    /**
     * Safely revokes all permissions granted to a Snap.
     *
     * @param snapId - The snap ID.
     */
    async revokeAllSnapPermissions(snapId) {
        if (await this.messagingSystem.call('PermissionController:hasPermissions', snapId)) {
            this.messagingSystem.call('PermissionController:revokeAllPermissions', snapId);
        }
    }
    /**
     * Handles incrementing the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced.
     */
    incrementActiveReferences(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        runtime.activeReferences += 1;
    }
    /**
     * Handles decrement the activeReferences counter.
     *
     * @param snapId - The snap id of the snap that was referenced..
     */
    decrementActiveReferences(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        (0, utils_1.assert)(runtime.activeReferences > 0, 'SnapController reference management is in an invalid state.');
        runtime.activeReferences -= 1;
    }
    /**
     * Gets all snaps in their truncated format.
     *
     * @returns All installed snaps in their truncated format.
     */
    getAllSnaps() {
        return Object.values(this.state.snaps).map(truncateSnap);
    }
    /**
     * Gets the serialized permitted snaps of the given origin, if any.
     *
     * @param origin - The origin whose permitted snaps to retrieve.
     * @returns The serialized permitted snaps for the origin.
     */
    async getPermittedSnaps(origin) {
        var _a;
        return Object.values((_a = (await this.messagingSystem.call('PermissionController:getPermissions', origin))) !== null && _a !== void 0 ? _a : {}).reduce((permittedSnaps, perm) => {
            if (perm.parentCapability.startsWith(snap_utils_1.SNAP_PREFIX)) {
                const snapId = perm.parentCapability.replace(snap_utils_1.SNAP_PREFIX_REGEX, '');
                const snap = this.get(snapId);
                const truncatedSnap = this.getTruncated(snapId);
                if (truncatedSnap && (snap === null || snap === void 0 ? void 0 : snap.status) !== snap_utils_1.SnapStatus.Installing) {
                    permittedSnaps[snapId] = truncatedSnap;
                }
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
     */
    async installSnaps(origin, requestedSnaps) {
        const result = {};
        await Promise.all(Object.entries(requestedSnaps).map(async ([snapId, { version: rawVersion }]) => {
            const version = (0, snap_utils_1.resolveVersion)(rawVersion);
            const permissionName = (0, snap_utils_1.getSnapPermissionName)(snapId);
            if (!(0, snap_utils_1.isValidSnapVersionRange)(version)) {
                result[snapId] = {
                    error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`The "version" field must be a valid SemVer version range if specified. Received: "${version}".`),
                };
                return;
            }
            if (true) {
                // Attempt to install and run the snap, storing any errors that
                // occur during the process.
                result[snapId] = Object.assign({}, (await this.processRequestedSnap(origin, snapId, version)));
            }
            else {
                // only allow the installation of permitted snaps
                result[snapId] = {
                    error: eth_rpc_errors_1.ethErrors.provider.unauthorized(`Not authorized to install snap "${snapId}". Request the permission for the snap before attempting to install it.`),
                };
            }
        }));
        return result;
    }
    /**
     * Adds, authorizes, and runs the given snap with a snap provider.
     * Results from this method should be efficiently serializable.
     *
     * @param origin - The origin requesting the snap.
     * @param snapId - The id of the snap.
     * @param versionRange - The semver range of the snap to install.
     * @returns The resulting snap object, or an error if something went wrong.
     */
    async processRequestedSnap(origin, snapId, versionRange) {
        try {
            (0, snap_utils_1.validateSnapId)(snapId);
        }
        catch (err) {
            return {
                error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`"${snapId}" is not a valid snap id.`),
            };
        }
        const existingSnap = this.getTruncated(snapId);
        // For devX we always re-install local snaps.
        if (existingSnap && (0, snap_utils_1.getSnapPrefix)(snapId) !== snap_utils_1.SnapIdPrefixes.local) {
            if ((0, snap_utils_1.satisfiesVersionRange)(existingSnap.version, versionRange)) {
                return existingSnap;
            }
            if (this._featureFlags.dappsCanUpdateSnaps === true) {
                try {
                    const updateResult = await this.updateSnap(origin, snapId, versionRange);
                    if (updateResult === null) {
                        return {
                            error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`Snap "${snapId}@${existingSnap.version}" is already installed, couldn't update to a version inside requested "${versionRange}" range.`),
                        };
                    }
                    return updateResult;
                }
                catch (err) {
                    return { error: (0, eth_rpc_errors_1.serializeError)(err) };
                }
            }
            else {
                return {
                    error: eth_rpc_errors_1.ethErrors.rpc.invalidParams(`Version mismatch with already installed snap. ${snapId}@${existingSnap.version} doesn't satisfy requested version ${versionRange}`),
                };
            }
        }
        // Existing snaps must be stopped before overwriting
        if (existingSnap && this.isRunning(snapId)) {
            await this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Stop);
        }
        try {
            const { sourceCode } = await this._add({
                origin,
                id: snapId,
                versionRange,
            });
            await this.authorize(origin, snapId);
            await this._startSnap({
                snapId,
                sourceCode,
            });
            const truncated = this.getTruncatedExpect(snapId);
            this.messagingSystem.publish(`SnapController:snapInstalled`, truncated);
            return truncated;
        }
        catch (err) {
            console.error(`Error when adding snap.`, err);
            if (this.has(snapId)) {
                this.removeSnap(snapId);
            }
            return { error: (0, eth_rpc_errors_1.serializeError)(err) };
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
     * @param newVersionRange - A semver version range in which the maximum version will be chosen.
     * @returns The snap metadata if updated, `null` otherwise.
     */
    async updateSnap(origin, snapId, newVersionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION) {
        const snap = this.getExpect(snapId);
        if (!(0, snap_utils_1.isValidSnapVersionRange)(newVersionRange)) {
            throw new Error(`Received invalid snap version range: "${newVersionRange}".`);
        }
        const newSnap = await this._fetchSnap(snapId, newVersionRange);
        const newVersion = newSnap.manifest.version;
        if (!(0, snap_utils_1.gtVersion)(newVersion, snap.version)) {
            console.warn(`Tried updating snap "${snapId}" within "${newVersionRange}" version range, but newer version "${snap.version}" is already installed`);
            return null;
        }
        await this._assertIsUnblocked(snapId, {
            version: newVersion,
            shasum: newSnap.manifest.source.shasum,
        });
        const processedPermissions = this.processSnapPermissions(newSnap.manifest.initialPermissions);
        const { newPermissions, unusedPermissions, approvedPermissions } = await this.calculatePermissionsChange(snapId, processedPermissions);
        const id = (0, nanoid_1.nanoid)();
        const _a = (await this.messagingSystem.call('ApprovalController:addRequest', {
            origin,
            id,
            type: exports.SNAP_APPROVAL_UPDATE,
            requestData: {
                // First two keys mirror installation params
                metadata: { id, origin: snapId, dappOrigin: origin },
                permissions: newPermissions,
                snapId,
                newVersion: newSnap.manifest.version,
                newPermissions,
                approvedPermissions,
                unusedPermissions,
            },
        }, true)), { permissions: approvedNewPermissions } = _a, requestData = __rest(_a, ["permissions"]);
        if (this.isRunning(snapId)) {
            await this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Stop);
        }
        this.transition(snapId, snap_utils_1.SnapStatusEvents.Update);
        this._set({
            origin,
            id: snapId,
            manifest: newSnap.manifest,
            sourceCode: newSnap.sourceCode,
            versionRange: newVersionRange,
        });
        const unusedPermissionsKeys = Object.keys(unusedPermissions);
        if ((0, utils_1.isNonEmptyArray)(unusedPermissionsKeys)) {
            await this.messagingSystem.call('PermissionController:revokePermissions', {
                [snapId]: unusedPermissionsKeys,
            });
        }
        if ((0, utils_1.isNonEmptyArray)(Object.keys(approvedNewPermissions))) {
            await this.messagingSystem.call('PermissionController:grantPermissions', {
                approvedPermissions: approvedNewPermissions,
                subject: { origin: snapId },
                requestData,
            });
        }
        await this._startSnap({ snapId, sourceCode: newSnap.sourceCode });
        const truncatedSnap = this.getTruncatedExpect(snapId);
        this.messagingSystem.publish('SnapController:snapUpdated', truncatedSnap, snap.version);
        return truncatedSnap;
    }
    /**
     * Returns a promise representing the complete installation of the requested snap.
     * If the snap is already being installed, the previously pending promise will be returned.
     *
     * @param args - Object containing the snap id and either the URL of the snap's manifest,
     * or the snap's manifest and source code. The object may also optionally contain a target
     * version.
     * @returns The resulting snap object.
     */
    async _add(args) {
        const { id: snapId } = args;
        (0, snap_utils_1.validateSnapId)(snapId);
        if (!args ||
            !('origin' in args) ||
            !('id' in args) ||
            (!('manifest' in args) && 'sourceCode' in args) ||
            ('manifest' in args && !('sourceCode' in args))) {
            throw new Error(`Invalid add snap args for snap "${snapId}".`);
        }
        this.setupRuntime(snapId, { sourceCode: null, state: null });
        const runtime = this.getRuntimeExpect(snapId);
        if (!runtime.installPromise) {
            console.info(`Adding snap: ${snapId}`);
            // If fetching and setting the snap succeeds, this property will be set
            // to null in the authorize() method.
            runtime.installPromise = (async () => {
                if ('manifest' in args && 'sourceCode' in args) {
                    return this._set(Object.assign(Object.assign({}, args), { id: snapId }));
                }
                const fetchedSnap = await this._fetchSnap(snapId, args.versionRange);
                await this._assertIsUnblocked(snapId, {
                    version: fetchedSnap.manifest.version,
                    shasum: fetchedSnap.manifest.source.shasum,
                });
                return this._set(Object.assign(Object.assign(Object.assign({}, args), fetchedSnap), { id: snapId }));
            })();
        }
        try {
            return await runtime.installPromise;
        }
        catch (error) {
            // Reset promise so users can retry installation in case the problem is
            // temporary.
            runtime.installPromise = null;
            throw error;
        }
    }
    async _startSnap(snapData) {
        const { snapId } = snapData;
        if (this.isRunning(snapId)) {
            throw new Error(`Snap "${snapId}" is already started.`);
        }
        try {
            const result = await this._executeWithTimeout(snapId, this.messagingSystem.call('ExecutionService:executeSnap', Object.assign(Object.assign({}, snapData), { endowments: await this._getEndowments(snapId) })));
            this.transition(snapId, snap_utils_1.SnapStatusEvents.Start);
            return result;
        }
        catch (err) {
            await this.terminateSnap(snapId);
            throw err;
        }
    }
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
    async _getEndowments(snapId) {
        let allEndowments = [];
        for (const permissionName of this._environmentEndowmentPermissions) {
            if (await this.messagingSystem.call('PermissionController:hasPermission', snapId, permissionName)) {
                const endowments = await this.messagingSystem.call('PermissionController:getEndowments', snapId, permissionName);
                if (endowments) {
                    // We don't have any guarantees about the type of the endowments
                    // value, so we have to guard at runtime.
                    if (!Array.isArray(endowments) ||
                        endowments.some((value) => typeof value !== 'string')) {
                        throw new Error('Expected an array of string endowment names.');
                    }
                    allEndowments = allEndowments.concat(endowments);
                }
            }
        }
        const dedupedEndowments = [
            ...new Set([...snap_utils_1.DEFAULT_ENDOWMENTS, ...allEndowments]),
        ];
        if (dedupedEndowments.length <
            snap_utils_1.DEFAULT_ENDOWMENTS.length + allEndowments.length) {
            console.error('Duplicate endowments found. Default endowments should not be requested.', allEndowments);
        }
        return dedupedEndowments;
    }
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
    _set(args) {
        var _a;
        const { id: snapId, origin, manifest, sourceCode, svgIcon, versionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION, } = args;
        (0, snap_utils_1.assertIsSnapManifest)(manifest);
        const { version } = manifest;
        if (!(0, snap_utils_1.satisfiesVersionRange)(version, versionRange)) {
            throw new Error(`Version mismatch. Manifest for "${snapId}" specifies version "${version}" which doesn't satisfy requested version range "${versionRange}"`);
        }
        if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
            throw new Error(`Invalid source code for snap "${snapId}".`);
        }
        const initialPermissions = manifest === null || manifest === void 0 ? void 0 : manifest.initialPermissions;
        if (!initialPermissions ||
            typeof initialPermissions !== 'object' ||
            Array.isArray(initialPermissions)) {
            throw new Error(`Invalid initial permissions for snap "${snapId}".`);
        }
        const snapsState = this.state.snaps;
        const existingSnap = snapsState[snapId];
        const previousVersionHistory = (_a = existingSnap === null || existingSnap === void 0 ? void 0 : existingSnap.versionHistory) !== null && _a !== void 0 ? _a : [];
        const versionHistory = [
            ...previousVersionHistory,
            {
                version,
                date: Date.now(),
                origin,
            },
        ];
        const snap = Object.assign(Object.assign({}, existingSnap), { 
            // Note that the snap will be unblocked and enabled, regardless of its
            // previous state.
            blocked: false, enabled: true, 
            // So we can easily correlate the snap with its permission
            permissionName: (0, snap_utils_1.getSnapPermissionName)(snapId), id: snapId, initialPermissions,
            manifest, status: this._statusMachine.config.initial, version,
            versionHistory });
        // If the snap was blocked, it isn't any longer
        delete snap.blockInformation;
        // store the snap back in state
        this.update((state) => {
            state.snaps[snapId] = snap;
        });
        const runtime = this.getRuntimeExpect(snapId);
        runtime.sourceCode = sourceCode;
        this.messagingSystem.publish(`SnapController:snapAdded`, snap, svgIcon);
        return Object.assign(Object.assign({}, snap), { sourceCode });
    }
    /**
     * Fetches the manifest and source code of a snap.
     *
     * @param snapId - The id of the Snap.
     * @param versionRange - The SemVer version of the Snap to fetch.
     * @returns A tuple of the Snap manifest object and the Snap source code.
     */
    async _fetchSnap(snapId, versionRange = snap_utils_1.DEFAULT_REQUESTED_SNAP_VERSION) {
        try {
            const snapPrefix = (0, snap_utils_1.getSnapPrefix)(snapId);
            switch (snapPrefix) {
                case snap_utils_1.SnapIdPrefixes.local:
                    return this._fetchLocalSnap(snapId.replace(snap_utils_1.SnapIdPrefixes.local, ''));
                case snap_utils_1.SnapIdPrefixes.npm:
                    return this._fetchNpmSnap(snapId.replace(snap_utils_1.SnapIdPrefixes.npm, ''), versionRange);
                /* istanbul ignore next */
                default:
                    // This whill fail to compile if the above switch is not fully exhaustive
                    return (0, utils_1.assertExhaustive)(snapPrefix);
            }
        }
        catch (error) {
            throw new Error(`Failed to fetch Snap "${snapId}": ${error.message}`);
        }
    }
    async _fetchNpmSnap(packageName, versionRange) {
        if (!(0, snap_utils_1.isValidSnapVersionRange)(versionRange)) {
            throw new Error(`Received invalid Snap version range: "${versionRange}".`);
        }
        const { manifest, sourceCode, svgIcon } = await (0, utils_3.fetchNpmSnap)(packageName, versionRange, this._npmRegistryUrl, this._fetchFunction);
        return { manifest, sourceCode, svgIcon };
    }
    /**
     * Fetches the manifest and source code of a local snap.
     *
     * @param localhostUrl - The localhost URL to download from.
     * @returns The validated manifest and the source code.
     */
    async _fetchLocalSnap(localhostUrl) {
        // Local snaps are mostly used for development purposes. Fetches were cached in the browser and were not requested
        // afterwards which lead to confusing development where old versions of snaps were installed.
        // Thus we disable caching
        const fetchOptions = { cache: 'no-cache' };
        const manifestUrl = new URL(snap_utils_1.NpmSnapFileNames.Manifest, localhostUrl);
        if (!snap_utils_1.LOCALHOST_HOSTNAMES.has(manifestUrl.hostname)) {
            throw new Error(`Invalid URL: Locally hosted Snaps must be hosted on localhost. Received URL: "${manifestUrl.toString()}"`);
        }
        const manifest = await (await this._fetchFunction(manifestUrl.toString(), fetchOptions)).json();
        (0, snap_utils_1.assertIsSnapManifest)(manifest);
        const { source: { location: { npm: { filePath, iconPath }, }, }, } = manifest;
        const [sourceCode, svgIcon] = await Promise.all([
            (await this._fetchFunction(new URL(filePath, localhostUrl).toString(), fetchOptions)).text(),
            iconPath
                ? (await this._fetchFunction(new URL(iconPath, localhostUrl).toString(), fetchOptions)).text()
                : undefined,
        ]);
        (0, snap_utils_1.validateSnapShasum)(manifest, sourceCode);
        return { manifest, sourceCode, svgIcon };
    }
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
    processSnapPermissions(initialPermissions) {
        return (0, snap_utils_1.fromEntries)(Object.entries(initialPermissions).map(([initialPermission, value]) => {
            if ((0, utils_1.hasProperty)(rpc_methods_1.caveatMappers, initialPermission)) {
                return [initialPermission, rpc_methods_1.caveatMappers[initialPermission](value)];
            }
            else if ((0, utils_1.hasProperty)(endowments_1.endowmentCaveatMappers, initialPermission)) {
                return [
                    initialPermission,
                    endowments_1.endowmentCaveatMappers[initialPermission](value),
                ];
            }
            return [initialPermission, value];
        }));
    }
    /**
     * Initiates a request for the given snap's initial permissions.
     * Must be called in order. See processRequestedSnap.
     *
     * @param origin - The origin of the install request.
     * @param snapId - The id of the Snap.
     * @returns The snap's approvedPermissions.
     */
    async authorize(origin, snapId) {
        console.info(`Authorizing snap: ${snapId}`);
        const snapsState = this.state.snaps;
        const snap = snapsState[snapId];
        const { initialPermissions } = snap;
        try {
            const processedPermissions = this.processSnapPermissions(initialPermissions);
            const id = (0, nanoid_1.nanoid)();
            const _a = (await this.messagingSystem.call('ApprovalController:addRequest', {
                origin,
                id,
                type: exports.SNAP_APPROVAL_INSTALL,
                requestData: {
                    // Mirror previous installation metadata
                    metadata: { id, origin: snapId, dappOrigin: origin },
                    permissions: processedPermissions,
                    snapId,
                },
            }, true)), { permissions: approvedPermissions } = _a, requestData = __rest(_a, ["permissions"]);
            if ((0, utils_1.isNonEmptyArray)(Object.keys(approvedPermissions))) {
                await this.messagingSystem.call('PermissionController:grantPermissions', {
                    approvedPermissions,
                    subject: { origin: snapId },
                    requestData,
                });
            }
        }
        finally {
            const runtime = this.getRuntimeExpect(snapId);
            runtime.installPromise = null;
        }
    }
    destroy() {
        super.destroy();
        if (this._timeoutForLastRequestStatus) {
            clearTimeout(this._timeoutForLastRequestStatus);
        }
        this.messagingSystem.unsubscribe('ExecutionService:unhandledError', this._onUnhandledSnapError);
        this.messagingSystem.unsubscribe('ExecutionService:outboundRequest', this._onOutboundRequest);
        this.messagingSystem.unsubscribe('ExecutionService:outboundResponse', this._onOutboundResponse);
    }
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
    async handleRequest({ snapId, origin, handler: handlerType, request, }) {
        const handler = await this.getRpcRequestHandler(snapId);
        if (!handler) {
            throw new Error(`Snap RPC message handler not found for snap "${snapId}".`);
        }
        return handler({ origin, handler: handlerType, request });
    }
    /**
     * Gets the RPC message handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC handler for the given snap.
     */
    async getRpcRequestHandler(snapId) {
        const runtime = this.getRuntimeExpect(snapId);
        const existingHandler = runtime.rpcHandler;
        if (existingHandler) {
            return existingHandler;
        }
        const requestQueue = new RequestQueue_1.RequestQueue(5);
        // We need to set up this promise map to map snapIds to their respective startPromises,
        // because otherwise we would lose context on the correct startPromise.
        const startPromises = new Map();
        const rpcHandler = async ({ origin, handler: handlerType, request, }) => {
            if (this.state.snaps[snapId].enabled === false) {
                throw new Error(`Snap "${snapId}" is disabled.`);
            }
            if (this.state.snaps[snapId].status === snap_utils_1.SnapStatus.Installing) {
                throw new Error(`Snap "${snapId}" is currently being installed. Please try again later.`);
            }
            if (this.isRunning(snapId) === false) {
                let localStartPromise = startPromises.get(snapId);
                if (!localStartPromise) {
                    localStartPromise = this.startSnap(snapId);
                    startPromises.set(snapId, localStartPromise);
                }
                else if (requestQueue.get(origin) >= requestQueue.maxQueueSize) {
                    throw new Error('Exceeds maximum number of requests waiting to be resolved, please try again.');
                }
                requestQueue.increment(origin);
                try {
                    await localStartPromise;
                }
                finally {
                    requestQueue.decrement(origin);
                    // Only delete startPromise for a snap if its value hasn't changed
                    if (startPromises.get(snapId) === localStartPromise) {
                        startPromises.delete(snapId);
                    }
                }
            }
            let _request = request;
            if (!(0, utils_1.hasProperty)(request, 'jsonrpc')) {
                _request = Object.assign(Object.assign({}, request), { jsonrpc: '2.0' });
            }
            else if (request.jsonrpc !== '2.0') {
                throw eth_rpc_errors_1.ethErrors.rpc.invalidRequest({
                    message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
                    data: request.jsonrpc,
                });
            }
            const timer = new Timer_1.Timer(this._maxRequestTime);
            this._recordSnapRpcRequestStart(snapId, request.id, timer);
            const handleRpcRequestPromise = this.messagingSystem.call('ExecutionService:handleRpcRequest', snapId, { origin, handler: handlerType, request: _request });
            // This will either get the result or reject due to the timeout.
            try {
                const result = await this._executeWithTimeout(snapId, handleRpcRequestPromise, timer);
                this._recordSnapRpcRequestFinish(snapId, request.id);
                return result;
            }
            catch (err) {
                await this.stopSnap(snapId, snap_utils_1.SnapStatusEvents.Crash);
                throw err;
            }
        };
        runtime.rpcHandler = rpcHandler;
        return rpcHandler;
    }
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
    async _executeWithTimeout(snapId, promise, timer) {
        const isLongRunning = await this.messagingSystem.call('PermissionController:hasPermission', snapId, endowments_1.SnapEndowments.LongRunning);
        // Long running snaps have timeouts disabled
        if (isLongRunning) {
            return promise;
        }
        const result = await (0, utils_2.withTimeout)(promise, timer !== null && timer !== void 0 ? timer : this._maxRequestTime);
        if (result === utils_2.hasTimedOut) {
            throw new Error('The request timed out.');
        }
        return result;
    }
    _recordSnapRpcRequestStart(snapId, requestId, timer) {
        const runtime = this.getRuntimeExpect(snapId);
        runtime.pendingInboundRequests.push({ requestId, timer });
        runtime.lastRequest = null;
    }
    _recordSnapRpcRequestFinish(snapId, requestId) {
        const runtime = this.getRuntimeExpect(snapId);
        runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter((r) => r.requestId !== requestId);
        if (runtime.pendingInboundRequests.length === 0) {
            runtime.lastRequest = Date.now();
        }
    }
    getRuntime(snapId) {
        return this._snapsRuntimeData.get(snapId);
    }
    getRuntimeExpect(snapId) {
        const runtime = this.getRuntime(snapId);
        (0, utils_1.assert)(runtime !== undefined, new Error(`Snap "${snapId}" runtime data not found`));
        return runtime;
    }
    setupRuntime(snapId, data) {
        var _a;
        if (this._snapsRuntimeData.has(snapId)) {
            return;
        }
        const snap = this.get(snapId);
        const interpreter = (0, fsm_1.interpret)(this._statusMachine);
        interpreter.start({
            context: { snapId },
            value: (_a = snap === null || snap === void 0 ? void 0 : snap.status) !== null && _a !== void 0 ? _a : this._statusMachine.config.initial,
        });
        (0, fsm_2.forceStrict)(interpreter);
        this._snapsRuntimeData.set(snapId, Object.assign({ lastRequest: null, rpcHandler: null, installPromise: null, activeReferences: 0, pendingInboundRequests: [], pendingOutboundRequests: 0, interpreter }, data));
    }
    async calculatePermissionsChange(snapId, desiredPermissionsSet) {
        var _a;
        const oldPermissions = (_a = (await this.messagingSystem.call('PermissionController:getPermissions', snapId))) !== null && _a !== void 0 ? _a : {};
        const newPermissions = (0, utils_2.setDiff)(desiredPermissionsSet, oldPermissions);
        // TODO(ritave): The assumption that these are unused only holds so long as we do not
        //               permit dynamic permission requests.
        const unusedPermissions = (0, utils_2.setDiff)(oldPermissions, desiredPermissionsSet);
        // It's a Set Intersection of oldPermissions and desiredPermissionsSet
        // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
        const approvedPermissions = (0, utils_2.setDiff)(oldPermissions, unusedPermissions);
        return { newPermissions, unusedPermissions, approvedPermissions };
    }
}
exports.SnapController = SnapController;
//# sourceMappingURL=SnapController.js.map