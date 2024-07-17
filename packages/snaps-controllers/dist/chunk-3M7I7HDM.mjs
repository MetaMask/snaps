import {
  detectSnapLocation
} from "./chunk-2AEM5R2M.mjs";
import {
  ALLOWED_PERMISSIONS,
  LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS
} from "./chunk-4M2FX2AT.mjs";
import {
  RequestQueue
} from "./chunk-NC5PBDKD.mjs";
import {
  forceStrict,
  validateMachine
} from "./chunk-6EZSNS4O.mjs";
import {
  log
} from "./chunk-4HVWEABQ.mjs";
import {
  fetchSnap,
  hasTimedOut,
  permissionsDiff,
  setDiff,
  withTimeout
} from "./chunk-KRI4OKC3.mjs";
import {
  Timer
} from "./chunk-XO7KDFBY.mjs";
import {
  __privateAdd,
  __privateGet,
  __privateMethod,
  __privateSet
} from "./chunk-YRZVIDCF.mjs";

// src/snaps/SnapController.ts
import { BaseController } from "@metamask/base-controller";
import { SubjectType } from "@metamask/permission-controller";
import { rpcErrors } from "@metamask/rpc-errors";
import {
  WALLET_SNAP_PERMISSION_KEY,
  getMaxRequestTimeCaveat,
  handlerEndowments,
  SnapEndowments,
  getKeyringCaveatOrigins,
  getRpcCaveatOrigins,
  processSnapPermissions,
  getEncryptionEntropy
} from "@metamask/snaps-rpc-methods";
import { AuxiliaryFileEncoding, getErrorMessage } from "@metamask/snaps-sdk";
import {
  assertIsSnapManifest,
  assertIsValidSnapId,
  DEFAULT_ENDOWMENTS,
  DEFAULT_REQUESTED_SNAP_VERSION,
  encodeAuxiliaryFile,
  HandlerType,
  isOriginAllowed,
  logError,
  normalizeRelative,
  OnTransactionResponseStruct,
  OnSignatureResponseStruct,
  resolveVersionRange,
  SnapCaveatType,
  SnapStatus,
  SnapStatusEvents,
  unwrapError,
  OnHomePageResponseStruct,
  getValidatedLocalizationFiles,
  VirtualFile,
  NpmSnapFileNames,
  OnNameLookupResponseStruct,
  getLocalizedSnapManifest,
  parseJson,
  MAX_FILE_SIZE
} from "@metamask/snaps-utils";
import {
  assert,
  assertIsJsonRpcRequest,
  assertStruct,
  Duration,
  gtRange,
  gtVersion,
  hasProperty,
  inMilliseconds,
  isNonEmptyArray,
  isValidJson,
  isValidSemVerRange,
  satisfiesVersionRange,
  timeSince
} from "@metamask/utils";
import { createMachine, interpret } from "@xstate/fsm";
import { nanoid } from "nanoid";
var controllerName = "SnapController";
var SNAP_APPROVAL_INSTALL = "wallet_installSnap";
var SNAP_APPROVAL_UPDATE = "wallet_updateSnap";
var SNAP_APPROVAL_RESULT = "wallet_installSnapResult";
var TRUNCATED_SNAP_PROPERTIES = /* @__PURE__ */ new Set([
  "initialPermissions",
  "id",
  "version",
  "enabled",
  "blocked"
]);
var defaultState = {
  snaps: {},
  snapStates: {},
  unencryptedSnapStates: {}
};
function truncateSnap(snap) {
  const truncatedSnap = Object.keys(snap).reduce(
    (serialized, key) => {
      if (TRUNCATED_SNAP_PROPERTIES.has(key)) {
        serialized[key] = snap[key];
      }
      return serialized;
    },
    {}
  );
  return truncatedSnap;
}
var name = "SnapController";
var _closeAllConnections, _dynamicPermissions, _environmentEndowmentPermissions, _excludedPermissions, _featureFlags, _fetchFunction, _idleTimeCheckInterval, _maxIdleTime, _encryptor, _getMnemonic, _getFeatureFlags, _detectSnapLocation, _snapsRuntimeData, _rollbackSnapshots, _timeoutForLastRequestStatus, _statusMachine, _preinstalledSnaps, _initializeStateMachine, initializeStateMachine_fn, _registerMessageHandlers, registerMessageHandlers_fn, _handlePreinstalledSnaps, handlePreinstalledSnaps_fn, _pollForLastRequestStatus, pollForLastRequestStatus_fn, _blockSnap, blockSnap_fn, _unblockSnap, unblockSnap_fn, _assertIsInstallAllowed, assertIsInstallAllowed_fn, _assertCanInstallSnaps, assertCanInstallSnaps_fn, _assertCanUsePlatform, assertCanUsePlatform_fn, _stopSnapsLastRequestPastMax, stopSnapsLastRequestPastMax_fn, _transition, transition_fn, _terminateSnap, terminateSnap_fn, _getSnapEncryptionKey, getSnapEncryptionKey_fn, _decryptSnapState, decryptSnapState_fn, _encryptSnapState, encryptSnapState_fn, _handleInitialConnections, handleInitialConnections_fn, _addSnapToSubject, addSnapToSubject_fn, _removeSnapFromSubjects, removeSnapFromSubjects_fn, _revokeAllSnapPermissions, revokeAllSnapPermissions_fn, _createApproval, createApproval_fn, _updateApproval, updateApproval_fn, _resolveAllowlistVersion, resolveAllowlistVersion_fn, _add, add_fn, _startSnap, startSnap_fn, _getEndowments, getEndowments_fn, _set, set_fn, _validateSnapPermissions, validateSnapPermissions_fn, _getExecutionTimeout, getExecutionTimeout_fn, _getRpcRequestHandler, getRpcRequestHandler_fn, _createInterface, createInterface_fn, _assertInterfaceExists, assertInterfaceExists_fn, _transformSnapRpcRequestResult, transformSnapRpcRequestResult_fn, _assertSnapRpcRequestResult, assertSnapRpcRequestResult_fn, _recordSnapRpcRequestStart, recordSnapRpcRequestStart_fn, _recordSnapRpcRequestFinish, recordSnapRpcRequestFinish_fn, _getRollbackSnapshot, getRollbackSnapshot_fn, _createRollbackSnapshot, createRollbackSnapshot_fn, _rollbackSnap, rollbackSnap_fn, _rollbackSnaps, rollbackSnaps_fn, _getRuntime, getRuntime_fn, _getRuntimeExpect, getRuntimeExpect_fn, _setupRuntime, setupRuntime_fn, _calculatePermissionsChange, calculatePermissionsChange_fn, _isSubjectConnectedToSnap, isSubjectConnectedToSnap_fn, _calculateConnectionsChange, calculateConnectionsChange_fn, _updatePermissions, updatePermissions_fn, _isValidUpdate, isValidUpdate_fn, _callLifecycleHook, callLifecycleHook_fn;
var SnapController = class extends BaseController {
  constructor({
    closeAllConnections,
    messenger,
    state,
    dynamicPermissions = ["eth_accounts"],
    environmentEndowmentPermissions = [],
    excludedPermissions = {},
    idleTimeCheckInterval = inMilliseconds(5, Duration.Second),
    maxIdleTime = inMilliseconds(30, Duration.Second),
    maxRequestTime = inMilliseconds(60, Duration.Second),
    fetchFunction = globalThis.fetch.bind(globalThis),
    featureFlags = {},
    detectSnapLocation: detectSnapLocationFunction = detectSnapLocation,
    preinstalledSnaps = null,
    encryptor,
    getMnemonic,
    getFeatureFlags = () => ({})
  }) {
    super({
      messenger,
      metadata: {
        snapStates: {
          persist: true,
          anonymous: false
        },
        unencryptedSnapStates: {
          persist: true,
          anonymous: false
        },
        snaps: {
          persist: (snaps) => {
            return Object.values(snaps).filter((snap) => snap.status !== SnapStatus.Installing).map((snap) => {
              return {
                ...snap,
                // At the time state is rehydrated, no snap will be running.
                status: SnapStatus.Stopped
              };
            }).reduce((memo, snap) => {
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
    /**
     * We track status of a Snap using a finite-state-machine.
     * It keeps track of whether the snap is started / stopped / etc.
     *
     * @see {@link SnapController.transition} for interacting with the machine.
     */
    // We initialize the machine in the instance because the status is currently tightly coupled
    // with the SnapController - the guard checks for enabled status inside the SnapController state.
    // In the future, side-effects could be added to the machine during transitions.
    __privateAdd(this, _initializeStateMachine);
    /**
     * Constructor helper for registering the controller's messaging system
     * actions.
     */
    __privateAdd(this, _registerMessageHandlers);
    __privateAdd(this, _handlePreinstalledSnaps);
    __privateAdd(this, _pollForLastRequestStatus);
    /**
     * Blocks an installed snap and prevents it from being started again. Emits
     * {@link SnapBlocked}. Does nothing if the snap is not installed.
     *
     * @param snapId - The snap to block.
     * @param blockedSnapInfo - Information detailing why the snap is blocked.
     */
    __privateAdd(this, _blockSnap);
    /**
     * Unblocks a snap so that it can be enabled and started again. Emits
     * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
     * unblocked.
     *
     * @param snapId - The id of the snap to unblock.
     */
    __privateAdd(this, _unblockSnap);
    __privateAdd(this, _assertIsInstallAllowed);
    /**
     * Asserts whether new Snaps are allowed to be installed.
     */
    __privateAdd(this, _assertCanInstallSnaps);
    /**
     * Asserts whether the Snaps platform is allowed to run.
     */
    __privateAdd(this, _assertCanUsePlatform);
    __privateAdd(this, _stopSnapsLastRequestPastMax);
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
    __privateAdd(this, _transition);
    /**
     * Terminates the specified snap and emits the `snapTerminated` event.
     *
     * @param snapId - The snap to terminate.
     */
    __privateAdd(this, _terminateSnap);
    /**
     * Generate an encryption key to be used for state encryption for a given Snap.
     *
     * @param options - An options bag.
     * @param options.snapId - The Snap ID.
     * @param options.salt - A salt to be used for the encryption key.
     * @param options.useCache - Whether to use caching or not.
     * @param options.keyMetadata - Optional metadata about how to derive the encryption key.
     * @returns An encryption key.
     */
    __privateAdd(this, _getSnapEncryptionKey);
    /**
     * Decrypt the encrypted state for a given Snap.
     *
     * @param snapId - The Snap ID.
     * @param state - The encrypted state as a string.
     * @returns A valid JSON object derived from the encrypted state.
     * @throws If the decryption fails or the decrypted state is not valid JSON.
     */
    __privateAdd(this, _decryptSnapState);
    /**
     * Encrypt a JSON state object for a given Snap.
     *
     * Note: This function does not assert the validity of the object,
     * please ensure only valid JSON is passed to it.
     *
     * @param snapId - The Snap ID.
     * @param state - The state object.
     * @returns A string containing the encrypted JSON object.
     */
    __privateAdd(this, _encryptSnapState);
    __privateAdd(this, _handleInitialConnections);
    __privateAdd(this, _addSnapToSubject);
    /**
     * Removes a snap's permission (caveat) from all subjects.
     *
     * @param snapId - The id of the Snap.
     */
    __privateAdd(this, _removeSnapFromSubjects);
    /**
     * Safely revokes all permissions granted to a Snap.
     *
     * @param snapId - The snap ID.
     */
    __privateAdd(this, _revokeAllSnapPermissions);
    __privateAdd(this, _createApproval);
    __privateAdd(this, _updateApproval);
    __privateAdd(this, _resolveAllowlistVersion);
    /**
     * Returns a promise representing the complete installation of the requested snap.
     * If the snap is already being installed, the previously pending promise will be returned.
     *
     * @param args - Object containing the snap id and either the URL of the snap's manifest,
     * or the snap's manifest and source code. The object may also optionally contain a target
     * version.
     * @returns The resulting snap object.
     */
    __privateAdd(this, _add);
    __privateAdd(this, _startSnap);
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
    __privateAdd(this, _getEndowments);
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
    __privateAdd(this, _set);
    __privateAdd(this, _validateSnapPermissions);
    /**
     * Determine the execution timeout for a given handler permission.
     *
     * If no permission is specified or the permission itself has no execution timeout defined
     * the constructor argument `maxRequestTime` will be used.
     *
     * @param permission - An optional permission constraint for the handler being called.
     * @returns The execution timeout for the given handler.
     */
    __privateAdd(this, _getExecutionTimeout);
    /**
     * Gets the RPC message handler for the given snap.
     *
     * @param snapId - The id of the Snap whose message handler to get.
     * @returns The RPC handler for the given snap.
     */
    __privateAdd(this, _getRpcRequestHandler);
    /**
     * Create a dynamic interface in the SnapInterfaceController.
     *
     * @param snapId - The snap ID.
     * @param content - The initial interface content.
     * @returns An identifier that can be used to identify the interface.
     */
    __privateAdd(this, _createInterface);
    __privateAdd(this, _assertInterfaceExists);
    /**
     * Transform a RPC request result if necessary.
     *
     * @param snapId - The snap ID of the snap that produced the result.
     * @param handlerType - The handler type that produced the result.
     * @param result - The result.
     * @returns The transformed result if applicable, otherwise the original result.
     */
    __privateAdd(this, _transformSnapRpcRequestResult);
    /**
     * Assert that the returned result of a Snap RPC call is the expected shape.
     *
     * @param snapId - The snap ID.
     * @param handlerType - The handler type of the RPC Request.
     * @param result - The result of the RPC request.
     */
    __privateAdd(this, _assertSnapRpcRequestResult);
    __privateAdd(this, _recordSnapRpcRequestStart);
    __privateAdd(this, _recordSnapRpcRequestFinish);
    /**
     * Retrieves the rollback snapshot of a snap.
     *
     * @param snapId - The snap id.
     * @returns A `RollbackSnapshot` or `undefined` if one doesn't exist.
     */
    __privateAdd(this, _getRollbackSnapshot);
    /**
     * Creates a `RollbackSnapshot` that is used to help ensure
     * atomicity in multiple snap updates.
     *
     * @param snapId - The snap id.
     * @throws {@link Error}. If the snap exists before creation or if creation fails.
     * @returns A `RollbackSnapshot`.
     */
    __privateAdd(this, _createRollbackSnapshot);
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
     */
    __privateAdd(this, _rollbackSnap);
    /**
     * Iterates through an array of snap ids
     * and calls `rollbackSnap` on them.
     *
     * @param snapIds - An array of snap ids.
     */
    __privateAdd(this, _rollbackSnaps);
    __privateAdd(this, _getRuntime);
    __privateAdd(this, _getRuntimeExpect);
    __privateAdd(this, _setupRuntime);
    __privateAdd(this, _calculatePermissionsChange);
    __privateAdd(this, _isSubjectConnectedToSnap);
    __privateAdd(this, _calculateConnectionsChange);
    /**
     * Updates the permissions for a snap following an install, update or rollback.
     *
     * Grants newly requested permissions and revokes unused/revoked permissions.
     *
     * @param args - An options bag.
     * @param args.snapId - The snap ID.
     * @param args.newPermissions - New permissions to be granted.
     * @param args.unusedPermissions - Unused permissions to be revoked.
     * @param args.requestData - Optional request data from an approval.
     */
    __privateAdd(this, _updatePermissions);
    /**
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
     * @param newVersionRange - The new version range being requested.
     * @returns `true` if validation checks pass and `false` if they do not.
     */
    __privateAdd(this, _isValidUpdate);
    /**
     * Call a lifecycle hook on a snap, if the snap has the
     * `endowment:lifecycle-hooks` permission. If the snap does not have the
     * permission, nothing happens.
     *
     * @param origin - The origin.
     * @param snapId - The snap ID.
     * @param handler - The lifecycle hook to call. This should be one of the
     * supported lifecycle hooks.
     * @private
     */
    __privateAdd(this, _callLifecycleHook);
    __privateAdd(this, _closeAllConnections, void 0);
    __privateAdd(this, _dynamicPermissions, void 0);
    __privateAdd(this, _environmentEndowmentPermissions, void 0);
    __privateAdd(this, _excludedPermissions, void 0);
    __privateAdd(this, _featureFlags, void 0);
    __privateAdd(this, _fetchFunction, void 0);
    __privateAdd(this, _idleTimeCheckInterval, void 0);
    __privateAdd(this, _maxIdleTime, void 0);
    __privateAdd(this, _encryptor, void 0);
    __privateAdd(this, _getMnemonic, void 0);
    __privateAdd(this, _getFeatureFlags, void 0);
    __privateAdd(this, _detectSnapLocation, void 0);
    __privateAdd(this, _snapsRuntimeData, void 0);
    __privateAdd(this, _rollbackSnapshots, void 0);
    __privateAdd(this, _timeoutForLastRequestStatus, void 0);
    __privateAdd(this, _statusMachine, void 0);
    __privateAdd(this, _preinstalledSnaps, void 0);
    __privateSet(this, _closeAllConnections, closeAllConnections);
    __privateSet(this, _dynamicPermissions, dynamicPermissions);
    __privateSet(this, _environmentEndowmentPermissions, environmentEndowmentPermissions);
    __privateSet(this, _excludedPermissions, excludedPermissions);
    __privateSet(this, _featureFlags, featureFlags);
    __privateSet(this, _fetchFunction, fetchFunction);
    __privateSet(this, _idleTimeCheckInterval, idleTimeCheckInterval);
    __privateSet(this, _maxIdleTime, maxIdleTime);
    this.maxRequestTime = maxRequestTime;
    __privateSet(this, _detectSnapLocation, detectSnapLocationFunction);
    __privateSet(this, _encryptor, encryptor);
    __privateSet(this, _getMnemonic, getMnemonic);
    __privateSet(this, _getFeatureFlags, getFeatureFlags);
    __privateSet(this, _preinstalledSnaps, preinstalledSnaps);
    this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
    this._onOutboundRequest = this._onOutboundRequest.bind(this);
    this._onOutboundResponse = this._onOutboundResponse.bind(this);
    __privateSet(this, _rollbackSnapshots, /* @__PURE__ */ new Map());
    __privateSet(this, _snapsRuntimeData, /* @__PURE__ */ new Map());
    __privateMethod(this, _pollForLastRequestStatus, pollForLastRequestStatus_fn).call(this);
    this.messagingSystem.subscribe(
      "ExecutionService:unhandledError",
      this._onUnhandledSnapError
    );
    this.messagingSystem.subscribe(
      "ExecutionService:outboundRequest",
      this._onOutboundRequest
    );
    this.messagingSystem.subscribe(
      "ExecutionService:outboundResponse",
      this._onOutboundResponse
    );
    this.messagingSystem.subscribe(
      "SnapController:snapInstalled",
      ({ id }, origin) => {
        __privateMethod(this, _callLifecycleHook, callLifecycleHook_fn).call(this, origin, id, HandlerType.OnInstall).catch(
          (error) => {
            logError(
              `Error when calling \`onInstall\` lifecycle hook for snap "${id}": ${getErrorMessage(
                error
              )}`
            );
          }
        );
      }
    );
    this.messagingSystem.subscribe(
      "SnapController:snapUpdated",
      ({ id }, _oldVersion, origin) => {
        __privateMethod(this, _callLifecycleHook, callLifecycleHook_fn).call(this, origin, id, HandlerType.OnUpdate).catch(
          (error) => {
            logError(
              `Error when calling \`onUpdate\` lifecycle hook for snap "${id}": ${getErrorMessage(
                error
              )}`
            );
          }
        );
      }
    );
    __privateMethod(this, _initializeStateMachine, initializeStateMachine_fn).call(this);
    __privateMethod(this, _registerMessageHandlers, registerMessageHandlers_fn).call(this);
    if (__privateGet(this, _preinstalledSnaps)) {
      __privateMethod(this, _handlePreinstalledSnaps, handlePreinstalledSnaps_fn).call(this, __privateGet(this, _preinstalledSnaps));
    }
    Object.values(this.state?.snaps ?? {}).forEach(
      (snap) => __privateMethod(this, _setupRuntime, setupRuntime_fn).call(this, snap.id)
    );
  }
  /**
   * Checks all installed snaps against the block list and
   * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
   * for more information.
   */
  async updateBlockedSnaps() {
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    await this.messagingSystem.call("SnapsRegistry:update");
    const blockedSnaps = await this.messagingSystem.call(
      "SnapsRegistry:get",
      Object.values(this.state.snaps).reduce(
        (blockListArg, snap) => {
          blockListArg[snap.id] = {
            version: snap.version,
            checksum: snap.manifest.source.shasum
          };
          return blockListArg;
        },
        {}
      )
    );
    await Promise.all(
      Object.entries(blockedSnaps).map(async ([snapId, { status, reason }]) => {
        if (status === 1 /* Blocked */) {
          return __privateMethod(this, _blockSnap, blockSnap_fn).call(this, snapId, reason);
        }
        return __privateMethod(this, _unblockSnap, unblockSnap_fn).call(this, snapId);
      })
    );
  }
  _onUnhandledSnapError(snapId, _error) {
    this.stopSnap(snapId, SnapStatusEvents.Crash).catch(
      (stopSnapError) => {
        logError(stopSnapError);
      }
    );
  }
  _onOutboundRequest(snapId) {
    const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
    runtime.pendingInboundRequests.filter((pendingRequest) => pendingRequest.timer.status === "running").forEach((pendingRequest) => pendingRequest.timer.pause());
    runtime.pendingOutboundRequests += 1;
  }
  _onOutboundResponse(snapId) {
    const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
    runtime.pendingOutboundRequests -= 1;
    if (runtime.pendingOutboundRequests === 0) {
      runtime.pendingInboundRequests.filter((pendingRequest) => pendingRequest.timer.status === "paused").forEach((pendingRequest) => pendingRequest.timer.resume());
    }
  }
  /**
   * Starts the given snap. Throws an error if no such snap exists
   * or if it is already running.
   *
   * @param snapId - The id of the Snap to start.
   */
  async startSnap(snapId) {
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    const snap = this.state.snaps[snapId];
    if (snap.enabled === false) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }
    await __privateMethod(this, _startSnap, startSnap_fn).call(this, {
      snapId,
      sourceCode: snap.sourceCode
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
    this.messagingSystem.publish(
      "SnapController:snapEnabled",
      this.getTruncatedExpect(snapId)
    );
  }
  /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to disable.
   * @returns A promise that resolves once the snap has been disabled.
   */
  async disableSnap(snapId) {
    if (!this.has(snapId)) {
      throw new Error(`Snap "${snapId}" not found.`);
    }
    this.update((state) => {
      state.snaps[snapId].enabled = false;
    });
    if (this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }
    this.messagingSystem.publish(
      "SnapController:snapDisabled",
      this.getTruncatedExpect(snapId)
    );
  }
  /**
   * Stops the given snap, removes all hooks, closes all connections, and
   * terminates its worker.
   *
   * @param snapId - The id of the Snap to stop.
   * @param statusEvent - The Snap status event that caused the snap to be
   * stopped.
   */
  async stopSnap(snapId, statusEvent = SnapStatusEvents.Stop) {
    var _a;
    const runtime = __privateMethod(this, _getRuntime, getRuntime_fn).call(this, snapId);
    if (!runtime) {
      throw new Error(`The snap "${snapId}" is not running.`);
    }
    if (runtime.stopping) {
      return;
    }
    runtime.stopping = true;
    try {
      if (this.isRunning(snapId)) {
        (_a = __privateGet(this, _closeAllConnections)) == null ? void 0 : _a.call(this, snapId);
        await __privateMethod(this, _terminateSnap, terminateSnap_fn).call(this, snapId);
      }
    } finally {
      runtime.lastRequest = null;
      runtime.pendingInboundRequests = [];
      runtime.pendingOutboundRequests = 0;
      runtime.stopping = false;
      if (this.isRunning(snapId)) {
        __privateMethod(this, _transition, transition_fn).call(this, snapId, statusEvent);
      }
    }
  }
  /**
   * Returns whether the given snap is running.
   * Throws an error if the snap doesn't exist.
   *
   * @param snapId - The id of the Snap to check.
   * @returns `true` if the snap is running, otherwise `false`.
   */
  isRunning(snapId) {
    return this.getExpect(snapId).status === "running";
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
    assert(snap !== void 0, new Error(`Snap "${snapId}" not found.`));
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
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   */
  async updateSnapState(snapId, newSnapState, encrypted) {
    if (encrypted) {
      const encryptedState = await __privateMethod(this, _encryptSnapState, encryptSnapState_fn).call(this, snapId, newSnapState);
      this.update((state) => {
        state.snapStates[snapId] = encryptedState;
      });
    } else {
      this.update((state) => {
        state.unencryptedSnapStates[snapId] = JSON.stringify(newSnapState);
      });
    }
  }
  /**
   * Clears the state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be cleared.
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   */
  clearSnapState(snapId, encrypted) {
    this.update((state) => {
      if (encrypted) {
        state.snapStates[snapId] = null;
      } else {
        state.unencryptedSnapStates[snapId] = null;
      }
    });
  }
  /**
   * Gets the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state to get.
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   * @returns The requested snap state or null if no state exists.
   */
  async getSnapState(snapId, encrypted) {
    const state = encrypted ? this.state.snapStates[snapId] : this.state.unencryptedSnapStates[snapId];
    if (state === null || state === void 0) {
      return null;
    }
    if (!encrypted) {
      return parseJson(state);
    }
    const decrypted = await __privateMethod(this, _decryptSnapState, decryptSnapState_fn).call(this, snapId, state);
    return decrypted;
  }
  /**
   * Gets a static auxiliary snap file in a chosen file encoding.
   *
   * @param snapId - The id of the Snap whose state to get.
   * @param path - The path to the requested file.
   * @param encoding - An optional requested file encoding.
   * @returns The file requested in the chosen file encoding or null if the file is not found.
   */
  async getSnapFile(snapId, path, encoding = AuxiliaryFileEncoding.Base64) {
    const snap = this.getExpect(snapId);
    const normalizedPath = normalizeRelative(path);
    const value = snap.auxiliaryFiles?.find(
      (file) => file.path === normalizedPath
    )?.value;
    if (!value) {
      return null;
    }
    const encoded = await encodeAuxiliaryFile(value, encoding);
    assert(
      encoded.length < MAX_FILE_SIZE,
      `Failed to encode static file to "${encoding}": Static files must be less than 64 MB when encoded.`
    );
    return encoded;
  }
  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all snap providers.
   */
  async clearState() {
    const snapIds = Object.keys(this.state.snaps);
    if (__privateGet(this, _closeAllConnections)) {
      snapIds.forEach((snapId) => {
        var _a;
        (_a = __privateGet(this, _closeAllConnections)) == null ? void 0 : _a.call(this, snapId);
      });
    }
    await this.messagingSystem.call("ExecutionService:terminateAllSnaps");
    snapIds.forEach((snapId) => __privateMethod(this, _revokeAllSnapPermissions, revokeAllSnapPermissions_fn).call(this, snapId));
    this.update((state) => {
      state.snaps = {};
      state.snapStates = {};
    });
    __privateGet(this, _snapsRuntimeData).clear();
    if (__privateGet(this, _preinstalledSnaps)) {
      __privateMethod(this, _handlePreinstalledSnaps, handlePreinstalledSnaps_fn).call(this, __privateGet(this, _preinstalledSnaps));
      Object.values(this.state?.snaps).forEach(
        (snap) => __privateMethod(this, _setupRuntime, setupRuntime_fn).call(this, snap.id)
      );
    }
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
      throw new Error("Expected array of snap ids.");
    }
    snapIds.forEach((snapId) => {
      const snap = this.getExpect(snapId);
      assert(snap.removable !== false, `${snapId} is not removable.`);
    });
    await Promise.all(
      snapIds.map(async (snapId) => {
        const snap = this.getExpect(snapId);
        const truncated = this.getTruncatedExpect(snapId);
        await this.disableSnap(snapId);
        __privateMethod(this, _revokeAllSnapPermissions, revokeAllSnapPermissions_fn).call(this, snapId);
        __privateMethod(this, _removeSnapFromSubjects, removeSnapFromSubjects_fn).call(this, snapId);
        __privateGet(this, _snapsRuntimeData).delete(snapId);
        this.update((state) => {
          delete state.snaps[snapId];
          delete state.snapStates[snapId];
          delete state.unencryptedSnapStates[snapId];
        });
        if (snap.status !== SnapStatus.Installing) {
          this.messagingSystem.publish(
            `SnapController:snapUninstalled`,
            truncated
          );
        }
      })
    );
  }
  /**
   * Removes a snap's permission (caveat) from the specified subject.
   *
   * @param origin - The origin from which to remove the snap.
   * @param snapId - The id of the snap to remove.
   */
  removeSnapFromSubject(origin, snapId) {
    const subjectPermissions = this.messagingSystem.call(
      "PermissionController:getPermissions",
      origin
    );
    const snapIdsCaveat = subjectPermissions?.[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds);
    if (!snapIdsCaveat) {
      return;
    }
    const caveatHasSnap = Boolean(
      snapIdsCaveat.value?.[snapId]
    );
    if (caveatHasSnap) {
      const newCaveatValue = {
        ...snapIdsCaveat.value
      };
      delete newCaveatValue[snapId];
      if (Object.keys(newCaveatValue).length > 0) {
        this.messagingSystem.call(
          "PermissionController:updateCaveat",
          origin,
          WALLET_SNAP_PERMISSION_KEY,
          SnapCaveatType.SnapIds,
          newCaveatValue
        );
      } else {
        this.messagingSystem.call("PermissionController:revokePermissions", {
          [origin]: [WALLET_SNAP_PERMISSION_KEY]
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
   */
  revokeDynamicSnapPermissions(snapId, permissionNames) {
    assert(
      permissionNames.every(
        (permissionName) => __privateGet(this, _dynamicPermissions).includes(permissionName)
      ),
      "Non-dynamic permissions cannot be revoked"
    );
    this.messagingSystem.call("PermissionController:revokePermissions", {
      [snapId]: permissionNames
    });
  }
  /**
   * Handles incrementing the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced.
   */
  incrementActiveReferences(snapId) {
    const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
    runtime.activeReferences += 1;
  }
  /**
   * Handles decrement the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced..
   */
  decrementActiveReferences(snapId) {
    const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
    assert(
      runtime.activeReferences > 0,
      "SnapController reference management is in an invalid state."
    );
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
  getPermittedSnaps(origin) {
    const permissions = this.messagingSystem.call(
      "PermissionController:getPermissions",
      origin
    ) ?? {};
    const snaps = permissions[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find(
      (caveat) => caveat.type === SnapCaveatType.SnapIds
    )?.value ?? {};
    return Object.keys(snaps).reduce(
      (permittedSnaps, snapId) => {
        const snap = this.get(snapId);
        const truncatedSnap = this.getTruncated(snapId);
        if (truncatedSnap && snap?.status !== SnapStatus.Installing) {
          permittedSnaps[snapId] = truncatedSnap;
        }
        return permittedSnaps;
      },
      {}
    );
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
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    const result = {};
    const snapIds = Object.keys(requestedSnaps);
    const pendingUpdates = [];
    const pendingInstalls = [];
    try {
      for (const [snapId, { version: rawVersion }] of Object.entries(
        requestedSnaps
      )) {
        assertIsValidSnapId(snapId);
        const [error, version] = resolveVersionRange(rawVersion);
        if (error) {
          throw rpcErrors.invalidParams(
            `The "version" field must be a valid SemVer version range if specified. Received: "${rawVersion}".`
          );
        }
        const location = __privateGet(this, _detectSnapLocation).call(this, snapId, {
          versionRange: version,
          fetch: __privateGet(this, _fetchFunction),
          allowLocal: __privateGet(this, _featureFlags).allowLocalSnaps,
          resolveVersion: async (range) => __privateGet(this, _featureFlags).requireAllowlist ? await __privateMethod(this, _resolveAllowlistVersion, resolveAllowlistVersion_fn).call(this, snapId, range) : range
        });
        const isUpdate = this.has(snapId) && !location.shouldAlwaysReload;
        if (isUpdate && __privateMethod(this, _isValidUpdate, isValidUpdate_fn).call(this, snapId, version)) {
          const existingSnap = this.getExpect(snapId);
          pendingUpdates.push({ snapId, oldVersion: existingSnap.version });
          let rollbackSnapshot = __privateMethod(this, _getRollbackSnapshot, getRollbackSnapshot_fn).call(this, snapId);
          if (rollbackSnapshot === void 0) {
            rollbackSnapshot = __privateMethod(this, _createRollbackSnapshot, createRollbackSnapshot_fn).call(this, snapId);
            rollbackSnapshot.newVersion = version;
          } else {
            throw new Error("This snap is already being updated.");
          }
        } else if (!isUpdate) {
          pendingInstalls.push(snapId);
        }
        result[snapId] = await this.processRequestedSnap(
          origin,
          snapId,
          location,
          version
        );
      }
      pendingInstalls.forEach(
        (snapId) => this.messagingSystem.publish(
          `SnapController:snapInstalled`,
          this.getTruncatedExpect(snapId),
          origin
        )
      );
      pendingUpdates.forEach(
        ({ snapId, oldVersion }) => this.messagingSystem.publish(
          `SnapController:snapUpdated`,
          this.getTruncatedExpect(snapId),
          oldVersion,
          origin
        )
      );
      snapIds.forEach((snapId) => __privateGet(this, _rollbackSnapshots).delete(snapId));
    } catch (error) {
      const installed = pendingInstalls.filter((snapId) => this.has(snapId));
      await this.removeSnaps(installed);
      const snapshottedSnaps = [...__privateGet(this, _rollbackSnapshots).keys()];
      const snapsToRollback = pendingUpdates.map(({ snapId }) => snapId).filter((snapId) => snapshottedSnaps.includes(snapId));
      await __privateMethod(this, _rollbackSnaps, rollbackSnaps_fn).call(this, snapsToRollback);
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
   */
  async processRequestedSnap(origin, snapId, location, versionRange) {
    const existingSnap = this.getTruncated(snapId);
    if (existingSnap && !location.shouldAlwaysReload) {
      if (satisfiesVersionRange(existingSnap.version, versionRange)) {
        return existingSnap;
      }
      return await this.updateSnap(
        origin,
        snapId,
        location,
        versionRange,
        // Since we are requesting an update from within processRequestedSnap,
        // we disable the emitting of the snapUpdated event and rely on the caller
        // to publish this event after the update is complete.
        // This is necessary as installSnaps may be installing multiple snaps
        // and we don't want to emit events prematurely.
        false
      );
    }
    __privateMethod(this, _assertCanInstallSnaps, assertCanInstallSnaps_fn).call(this);
    let pendingApproval = __privateMethod(this, _createApproval, createApproval_fn).call(this, {
      origin,
      snapId,
      type: SNAP_APPROVAL_INSTALL
    });
    this.messagingSystem.publish(
      "SnapController:snapInstallStarted",
      snapId,
      origin,
      false
    );
    if (existingSnap && this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }
    if (existingSnap && location.shouldAlwaysReload) {
      __privateMethod(this, _revokeAllSnapPermissions, revokeAllSnapPermissions_fn).call(this, snapId);
    }
    try {
      const { sourceCode } = await __privateMethod(this, _add, add_fn).call(this, {
        origin,
        id: snapId,
        location,
        versionRange
      });
      await this.authorize(snapId, pendingApproval);
      pendingApproval = __privateMethod(this, _createApproval, createApproval_fn).call(this, {
        origin,
        snapId,
        type: SNAP_APPROVAL_RESULT
      });
      await __privateMethod(this, _startSnap, startSnap_fn).call(this, {
        snapId,
        sourceCode
      });
      const truncated = this.getTruncatedExpect(snapId);
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_INSTALL
      });
      return truncated;
    } catch (error) {
      logError(`Error when adding ${snapId}.`, error);
      const errorString = error instanceof Error ? error.message : error.toString();
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_INSTALL,
        error: errorString
      });
      this.messagingSystem.publish(
        "SnapController:snapInstallFailed",
        snapId,
        origin,
        false,
        errorString
      );
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
   */
  async updateSnap(origin, snapId, location, newVersionRange = DEFAULT_REQUESTED_SNAP_VERSION, emitEvent = true) {
    __privateMethod(this, _assertCanInstallSnaps, assertCanInstallSnaps_fn).call(this);
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    if (!isValidSemVerRange(newVersionRange)) {
      throw new Error(
        `Received invalid snap version range: "${newVersionRange}".`
      );
    }
    let pendingApproval = __privateMethod(this, _createApproval, createApproval_fn).call(this, {
      origin,
      snapId,
      type: SNAP_APPROVAL_UPDATE
    });
    try {
      this.messagingSystem.publish(
        "SnapController:snapInstallStarted",
        snapId,
        origin,
        true
      );
      const snap = this.getExpect(snapId);
      const oldManifest = snap.manifest;
      const newSnap = await fetchSnap(snapId, location);
      const { sourceCode: sourceCodeFile, manifest: manifestFile } = newSnap;
      const manifest = manifestFile.result;
      const newVersion = manifest.version;
      if (!gtVersion(newVersion, snap.version)) {
        throw rpcErrors.invalidParams(
          `Snap "${snapId}@${snap.version}" is already installed. Couldn't update to a version inside requested "${newVersionRange}" range.`
        );
      }
      if (!satisfiesVersionRange(newVersion, newVersionRange)) {
        throw new Error(
          `Version mismatch. Manifest for "${snapId}" specifies version "${newVersion}" which doesn't satisfy requested version range "${newVersionRange}".`
        );
      }
      await __privateMethod(this, _assertIsInstallAllowed, assertIsInstallAllowed_fn).call(this, snapId, {
        version: newVersion,
        checksum: manifest.source.shasum,
        permissions: manifest.initialPermissions
      });
      const processedPermissions = processSnapPermissions(
        manifest.initialPermissions
      );
      __privateMethod(this, _validateSnapPermissions, validateSnapPermissions_fn).call(this, processedPermissions);
      const { newPermissions, unusedPermissions, approvedPermissions } = __privateMethod(this, _calculatePermissionsChange, calculatePermissionsChange_fn).call(this, snapId, processedPermissions);
      const { newConnections, unusedConnections, approvedConnections } = __privateMethod(this, _calculateConnectionsChange, calculateConnectionsChange_fn).call(this, snapId, oldManifest.initialConnections ?? {}, manifest.initialConnections ?? {});
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        permissions: newPermissions,
        newVersion: manifest.version,
        newPermissions,
        approvedPermissions,
        unusedPermissions,
        newConnections,
        unusedConnections,
        approvedConnections,
        loading: false
      });
      const { permissions: approvedNewPermissions, ...requestData } = await pendingApproval.promise;
      pendingApproval = __privateMethod(this, _createApproval, createApproval_fn).call(this, {
        origin,
        snapId,
        type: SNAP_APPROVAL_RESULT
      });
      if (this.isRunning(snapId)) {
        await this.stopSnap(snapId, SnapStatusEvents.Stop);
      }
      __privateMethod(this, _transition, transition_fn).call(this, snapId, SnapStatusEvents.Update);
      __privateMethod(this, _set, set_fn).call(this, {
        origin,
        id: snapId,
        files: newSnap,
        isUpdate: true
      });
      __privateMethod(this, _updatePermissions, updatePermissions_fn).call(this, {
        snapId,
        unusedPermissions,
        newPermissions: approvedNewPermissions,
        requestData
      });
      if (manifest.initialConnections) {
        __privateMethod(this, _handleInitialConnections, handleInitialConnections_fn).call(this, snapId, oldManifest.initialConnections ?? null, manifest.initialConnections);
      }
      const rollbackSnapshot = __privateMethod(this, _getRollbackSnapshot, getRollbackSnapshot_fn).call(this, snapId);
      if (rollbackSnapshot !== void 0) {
        rollbackSnapshot.permissions.revoked = unusedPermissions;
        rollbackSnapshot.permissions.granted = approvedNewPermissions;
        rollbackSnapshot.permissions.requestData = requestData;
      }
      const sourceCode = sourceCodeFile.toString();
      assert(
        typeof sourceCode === "string" && sourceCode.length > 0,
        `Invalid source code for snap "${snapId}".`
      );
      try {
        await __privateMethod(this, _startSnap, startSnap_fn).call(this, { snapId, sourceCode });
      } catch {
        throw new Error(`Snap ${snapId} crashed with updated source code.`);
      }
      const truncatedSnap = this.getTruncatedExpect(snapId);
      if (emitEvent) {
        this.messagingSystem.publish(
          "SnapController:snapUpdated",
          truncatedSnap,
          snap.version,
          origin
        );
      }
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_UPDATE
      });
      return truncatedSnap;
    } catch (error) {
      logError(`Error when updating ${snapId},`, error);
      const errorString = error instanceof Error ? error.message : error.toString();
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        loading: false,
        error: errorString,
        type: SNAP_APPROVAL_UPDATE
      });
      this.messagingSystem.publish(
        "SnapController:snapInstallFailed",
        snapId,
        origin,
        true,
        errorString
      );
      throw error;
    }
  }
  /**
   * Get metadata for the given snap ID.
   *
   * @param snapId - The ID of the snap to get metadata for.
   * @returns The metadata for the given snap ID, or `null` if the snap is not
   * verified.
   */
  async getRegistryMetadata(snapId) {
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    return await this.messagingSystem.call("SnapsRegistry:getMetadata", snapId);
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
   */
  async authorize(snapId, pendingApproval) {
    log(`Authorizing snap: ${snapId}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapId];
    const { initialPermissions, initialConnections } = snap;
    try {
      const processedPermissions = processSnapPermissions(initialPermissions);
      __privateMethod(this, _validateSnapPermissions, validateSnapPermissions_fn).call(this, processedPermissions);
      __privateMethod(this, _updateApproval, updateApproval_fn).call(this, pendingApproval.id, {
        loading: false,
        connections: initialConnections ?? {},
        permissions: processedPermissions
      });
      const { permissions: approvedPermissions, ...requestData } = await pendingApproval.promise;
      __privateMethod(this, _updatePermissions, updatePermissions_fn).call(this, {
        snapId,
        newPermissions: approvedPermissions,
        requestData
      });
      if (snap.manifest.initialConnections) {
        __privateMethod(this, _handleInitialConnections, handleInitialConnections_fn).call(this, snapId, null, snap.manifest.initialConnections);
      }
    } finally {
      const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
      runtime.installPromise = null;
    }
  }
  destroy() {
    super.destroy();
    if (__privateGet(this, _timeoutForLastRequestStatus)) {
      clearTimeout(__privateGet(this, _timeoutForLastRequestStatus));
    }
    this.messagingSystem.unsubscribe(
      "ExecutionService:unhandledError",
      this._onUnhandledSnapError
    );
    this.messagingSystem.unsubscribe(
      "ExecutionService:outboundRequest",
      this._onOutboundRequest
    );
    this.messagingSystem.unsubscribe(
      "ExecutionService:outboundResponse",
      this._onOutboundResponse
    );
    this.messagingSystem.clearEventSubscriptions(
      "SnapController:snapInstalled"
    );
    this.messagingSystem.clearEventSubscriptions("SnapController:snapUpdated");
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
  async handleRequest({
    snapId,
    origin,
    handler: handlerType,
    request: rawRequest
  }) {
    __privateMethod(this, _assertCanUsePlatform, assertCanUsePlatform_fn).call(this);
    const request = {
      jsonrpc: "2.0",
      id: nanoid(),
      ...rawRequest
    };
    assertIsJsonRpcRequest(request);
    const permissionName = handlerEndowments[handlerType];
    assert(
      typeof permissionName === "string" || permissionName === null,
      "'permissionName' must be either a string or null."
    );
    const permissions = this.messagingSystem.call(
      "PermissionController:getPermissions",
      snapId
    );
    if (permissionName !== null && (!permissions || !hasProperty(permissions, permissionName))) {
      throw new Error(
        `Snap "${snapId}" is not permitted to use "${permissionName}".`
      );
    }
    const handlerPermissions = permissionName ? permissions[permissionName] : void 0;
    if (permissionName === SnapEndowments.Rpc || permissionName === SnapEndowments.Keyring) {
      assert(handlerPermissions);
      const subject = this.messagingSystem.call(
        "SubjectMetadataController:getSubjectMetadata",
        origin
      );
      const origins = permissionName === SnapEndowments.Rpc ? getRpcCaveatOrigins(handlerPermissions) : getKeyringCaveatOrigins(handlerPermissions);
      assert(origins);
      if (!isOriginAllowed(
        origins,
        subject?.subjectType ?? SubjectType.Website,
        origin
      )) {
        throw new Error(
          `Snap "${snapId}" is not permitted to handle requests from "${origin}".`
        );
      }
    }
    const handler = __privateMethod(this, _getRpcRequestHandler, getRpcRequestHandler_fn).call(this, snapId);
    if (!handler) {
      throw new Error(
        `Snap RPC message handler not found for snap "${snapId}".`
      );
    }
    const timeout = __privateMethod(this, _getExecutionTimeout, getExecutionTimeout_fn).call(this, handlerPermissions);
    return handler({ origin, handler: handlerType, request, timeout });
  }
};
_closeAllConnections = new WeakMap();
_dynamicPermissions = new WeakMap();
_environmentEndowmentPermissions = new WeakMap();
_excludedPermissions = new WeakMap();
_featureFlags = new WeakMap();
_fetchFunction = new WeakMap();
_idleTimeCheckInterval = new WeakMap();
_maxIdleTime = new WeakMap();
_encryptor = new WeakMap();
_getMnemonic = new WeakMap();
_getFeatureFlags = new WeakMap();
_detectSnapLocation = new WeakMap();
_snapsRuntimeData = new WeakMap();
_rollbackSnapshots = new WeakMap();
_timeoutForLastRequestStatus = new WeakMap();
_statusMachine = new WeakMap();
_preinstalledSnaps = new WeakMap();
_initializeStateMachine = new WeakSet();
initializeStateMachine_fn = function() {
  const disableGuard = ({ snapId }) => {
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
  __privateSet(this, _statusMachine, createMachine(statusConfig));
  validateMachine(__privateGet(this, _statusMachine));
};
_registerMessageHandlers = new WeakSet();
registerMessageHandlers_fn = function() {
  this.messagingSystem.registerActionHandler(
    `${controllerName}:clearSnapState`,
    (...args) => this.clearSnapState(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:get`,
    (...args) => this.get(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getSnapState`,
    async (...args) => this.getSnapState(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:handleRequest`,
    async (...args) => this.handleRequest(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:has`,
    (...args) => this.has(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:updateBlockedSnaps`,
    async () => this.updateBlockedSnaps()
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:updateSnapState`,
    async (...args) => this.updateSnapState(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:enable`,
    (...args) => this.enableSnap(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:disable`,
    async (...args) => this.disableSnap(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:remove`,
    async (...args) => this.removeSnap(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getPermitted`,
    (...args) => this.getPermittedSnaps(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:install`,
    async (...args) => this.installSnaps(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getAll`,
    (...args) => this.getAllSnaps(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:incrementActiveReferences`,
    (...args) => this.incrementActiveReferences(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:decrementActiveReferences`,
    (...args) => this.decrementActiveReferences(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getRegistryMetadata`,
    async (...args) => this.getRegistryMetadata(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:disconnectOrigin`,
    (...args) => this.removeSnapFromSubject(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:revokeDynamicPermissions`,
    (...args) => this.revokeDynamicSnapPermissions(...args)
  );
  this.messagingSystem.registerActionHandler(
    `${controllerName}:getFile`,
    async (...args) => this.getSnapFile(...args)
  );
};
_handlePreinstalledSnaps = new WeakSet();
handlePreinstalledSnaps_fn = function(preinstalledSnaps) {
  for (const {
    snapId,
    manifest,
    files,
    removable,
    hidden
  } of preinstalledSnaps) {
    const existingSnap = this.get(snapId);
    const isAlreadyInstalled = existingSnap !== void 0;
    const isUpdate = isAlreadyInstalled && gtVersion(manifest.version, existingSnap.version);
    if (isAlreadyInstalled && (!isUpdate || existingSnap.preinstalled !== true)) {
      continue;
    }
    const manifestFile = new VirtualFile({
      path: NpmSnapFileNames.Manifest,
      value: JSON.stringify(manifest),
      result: manifest
    });
    const virtualFiles = files.map(
      ({ path, value }) => new VirtualFile({ value, path })
    );
    const { filePath, iconPath } = manifest.source.location.npm;
    const sourceCode = virtualFiles.find((file) => file.path === filePath);
    const svgIcon = iconPath ? virtualFiles.find((file) => file.path === iconPath) : void 0;
    assert(sourceCode, "Source code not provided for preinstalled snap.");
    assert(
      !iconPath || iconPath && svgIcon,
      "Icon not provided for preinstalled snap."
    );
    assert(
      manifest.source.files === void 0,
      "Auxiliary files are not currently supported for preinstalled snaps."
    );
    const localizationFiles = manifest.source.locales?.map(
      (path) => virtualFiles.find((file) => file.path === path)
    ) ?? [];
    const validatedLocalizationFiles = getValidatedLocalizationFiles(
      localizationFiles.filter(Boolean)
    );
    assert(
      localizationFiles.length === validatedLocalizationFiles.length,
      "Missing localization files for preinstalled snap."
    );
    const filesObject = {
      manifest: manifestFile,
      sourceCode,
      svgIcon,
      auxiliaryFiles: [],
      localizationFiles: validatedLocalizationFiles
    };
    __privateMethod(this, _set, set_fn).call(this, {
      id: snapId,
      origin: "metamask",
      files: filesObject,
      removable,
      hidden,
      preinstalled: true
    });
    const processedPermissions = processSnapPermissions(
      manifest.initialPermissions
    );
    __privateMethod(this, _validateSnapPermissions, validateSnapPermissions_fn).call(this, processedPermissions);
    const { newPermissions, unusedPermissions } = __privateMethod(this, _calculatePermissionsChange, calculatePermissionsChange_fn).call(this, snapId, processedPermissions);
    __privateMethod(this, _updatePermissions, updatePermissions_fn).call(this, { snapId, newPermissions, unusedPermissions });
    this.update((state) => {
      state.snaps[snapId].status = SnapStatus.Stopped;
    });
  }
};
_pollForLastRequestStatus = new WeakSet();
pollForLastRequestStatus_fn = function() {
  __privateSet(this, _timeoutForLastRequestStatus, setTimeout(() => {
    __privateMethod(this, _stopSnapsLastRequestPastMax, stopSnapsLastRequestPastMax_fn).call(this).catch((error) => {
      logError(error);
    });
    __privateMethod(this, _pollForLastRequestStatus, pollForLastRequestStatus_fn).call(this);
  }, __privateGet(this, _idleTimeCheckInterval)));
};
_blockSnap = new WeakSet();
blockSnap_fn = async function(snapId, blockedSnapInfo) {
  if (!this.has(snapId)) {
    return;
  }
  try {
    this.update((state) => {
      state.snaps[snapId].blocked = true;
      state.snaps[snapId].blockInformation = blockedSnapInfo;
    });
    await this.disableSnap(snapId);
  } catch (error) {
    logError(
      `Encountered error when stopping blocked snap "${snapId}".`,
      error
    );
  }
  this.messagingSystem.publish(
    `${controllerName}:snapBlocked`,
    snapId,
    blockedSnapInfo
  );
};
_unblockSnap = new WeakSet();
unblockSnap_fn = function(snapId) {
  if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
    return;
  }
  this.update((state) => {
    state.snaps[snapId].blocked = false;
    delete state.snaps[snapId].blockInformation;
  });
  this.messagingSystem.publish(`${controllerName}:snapUnblocked`, snapId);
};
_assertIsInstallAllowed = new WeakSet();
assertIsInstallAllowed_fn = async function(snapId, snapInfo) {
  const results = await this.messagingSystem.call("SnapsRegistry:get", {
    [snapId]: snapInfo
  });
  const result = results[snapId];
  if (result.status === 1 /* Blocked */) {
    throw new Error(
      `Cannot install version "${snapInfo.version}" of snap "${snapId}": The version is blocked. ${result.reason?.explanation ?? ""}`
    );
  }
  const isAllowlistingRequired = Object.keys(snapInfo.permissions).some(
    (permission) => !ALLOWED_PERMISSIONS.includes(permission)
  );
  if (__privateGet(this, _featureFlags).requireAllowlist && isAllowlistingRequired && result.status !== 2 /* Verified */) {
    throw new Error(
      `Cannot install version "${snapInfo.version}" of snap "${snapId}": ${result.status === 3 /* Unavailable */ ? "The registry is temporarily unavailable." : "The snap is not on the allowlist."}`
    );
  }
};
_assertCanInstallSnaps = new WeakSet();
assertCanInstallSnaps_fn = function() {
  assert(
    __privateGet(this, _featureFlags).disableSnapInstallation !== true,
    "Installing Snaps is currently disabled in this version of MetaMask."
  );
};
_assertCanUsePlatform = new WeakSet();
assertCanUsePlatform_fn = function() {
  const flags = __privateGet(this, _getFeatureFlags).call(this);
  assert(
    flags.disableSnaps !== true,
    "The Snaps platform requires basic functionality to be used. Enable basic functionality in the settings to use the Snaps platform."
  );
};
_stopSnapsLastRequestPastMax = new WeakSet();
stopSnapsLastRequestPastMax_fn = async function() {
  const entries = [...__privateGet(this, _snapsRuntimeData).entries()];
  return Promise.all(
    entries.filter(
      ([_snapId, runtime]) => runtime.activeReferences === 0 && runtime.pendingInboundRequests.length === 0 && runtime.lastRequest && __privateGet(this, _maxIdleTime) && timeSince(runtime.lastRequest) > __privateGet(this, _maxIdleTime)
    ).map(async ([snapId]) => this.stopSnap(snapId, SnapStatusEvents.Stop))
  );
};
_transition = new WeakSet();
transition_fn = function(snapId, event) {
  const { interpreter } = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  interpreter.send(event);
  this.update((state) => {
    state.snaps[snapId].status = interpreter.state.value;
  });
};
_terminateSnap = new WeakSet();
terminateSnap_fn = async function(snapId) {
  await this.messagingSystem.call("ExecutionService:terminateSnap", snapId);
  await new Promise((resolve) => setTimeout(resolve, 1));
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  runtime.pendingInboundRequests.filter((pendingRequest) => pendingRequest.timer.status !== "finished").forEach((pendingRequest) => pendingRequest.timer.finish());
  await new Promise((resolve) => setTimeout(resolve, 1));
  this.messagingSystem.publish(
    "SnapController:snapTerminated",
    this.getTruncatedExpect(snapId)
  );
};
_getSnapEncryptionKey = new WeakSet();
getSnapEncryptionKey_fn = async function({
  snapId,
  salt: passedSalt,
  useCache,
  keyMetadata
}) {
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  if (runtime.encryptionKey && runtime.encryptionSalt && useCache) {
    return {
      key: await __privateGet(this, _encryptor).importKey(runtime.encryptionKey),
      salt: runtime.encryptionSalt
    };
  }
  const salt = passedSalt ?? __privateGet(this, _encryptor).generateSalt();
  const mnemonicPhrase = await __privateGet(this, _getMnemonic).call(this);
  const entropy = await getEncryptionEntropy({ snapId, mnemonicPhrase });
  const encryptionKey = await __privateGet(this, _encryptor).keyFromPassword(
    entropy,
    salt,
    true,
    keyMetadata
  );
  const exportedKey = await __privateGet(this, _encryptor).exportKey(encryptionKey);
  if (useCache) {
    runtime.encryptionKey = exportedKey;
    runtime.encryptionSalt = salt;
  }
  return { key: encryptionKey, salt };
};
_decryptSnapState = new WeakSet();
decryptSnapState_fn = async function(snapId, state) {
  try {
    const parsed = parseJson(state);
    const { salt, keyMetadata } = parsed;
    const useCache = __privateGet(this, _encryptor).isVaultUpdated(state);
    const { key } = await __privateMethod(this, _getSnapEncryptionKey, getSnapEncryptionKey_fn).call(this, {
      snapId,
      salt,
      useCache,
      // When decrypting state we expect key metadata to be present.
      // If it isn't present, we assume that the Snap state we are decrypting is old enough to use the legacy encryption params.
      keyMetadata: keyMetadata ?? LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS
    });
    const decryptedState = await __privateGet(this, _encryptor).decryptWithKey(key, parsed);
    assert(isValidJson(decryptedState));
    return decryptedState;
  } catch {
    throw rpcErrors.internal({
      message: "Failed to decrypt snap state, the state must be corrupted."
    });
  }
};
_encryptSnapState = new WeakSet();
encryptSnapState_fn = async function(snapId, state) {
  const { key, salt } = await __privateMethod(this, _getSnapEncryptionKey, getSnapEncryptionKey_fn).call(this, {
    snapId,
    useCache: true
  });
  const encryptedState = await __privateGet(this, _encryptor).encryptWithKey(key, state);
  encryptedState.salt = salt;
  return JSON.stringify(encryptedState);
};
_handleInitialConnections = new WeakSet();
handleInitialConnections_fn = function(snapId, previousInitialConnections, initialConnections) {
  if (previousInitialConnections) {
    const revokedInitialConnections = setDiff(
      previousInitialConnections,
      initialConnections
    );
    for (const origin of Object.keys(revokedInitialConnections)) {
      this.removeSnapFromSubject(origin, snapId);
    }
  }
  for (const origin of Object.keys(initialConnections)) {
    __privateMethod(this, _addSnapToSubject, addSnapToSubject_fn).call(this, origin, snapId);
  }
};
_addSnapToSubject = new WeakSet();
addSnapToSubject_fn = function(origin, snapId) {
  const subjectPermissions = this.messagingSystem.call(
    "PermissionController:getPermissions",
    origin
  );
  const existingCaveat = subjectPermissions?.[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds);
  const subjectHasSnap = Boolean(
    existingCaveat?.value?.[snapId]
  );
  if (subjectHasSnap) {
    return;
  }
  if (existingCaveat) {
    this.messagingSystem.call(
      "PermissionController:updateCaveat",
      origin,
      WALLET_SNAP_PERMISSION_KEY,
      SnapCaveatType.SnapIds,
      { ...existingCaveat.value, [snapId]: {} }
    );
    return;
  }
  const approvedPermissions = {
    [WALLET_SNAP_PERMISSION_KEY]: {
      caveats: [
        {
          type: SnapCaveatType.SnapIds,
          value: {
            [snapId]: {}
          }
        }
      ]
    }
  };
  this.messagingSystem.call("PermissionController:grantPermissions", {
    approvedPermissions,
    subject: { origin }
  });
};
_removeSnapFromSubjects = new WeakSet();
removeSnapFromSubjects_fn = function(snapId) {
  const subjects = this.messagingSystem.call(
    "PermissionController:getSubjectNames"
  );
  for (const subject of subjects) {
    this.removeSnapFromSubject(subject, snapId);
  }
};
_revokeAllSnapPermissions = new WeakSet();
revokeAllSnapPermissions_fn = function(snapId) {
  if (this.messagingSystem.call("PermissionController:hasPermissions", snapId)) {
    this.messagingSystem.call(
      "PermissionController:revokeAllPermissions",
      snapId
    );
  }
};
_createApproval = new WeakSet();
createApproval_fn = function({
  origin,
  snapId,
  type
}) {
  const id = nanoid();
  const promise = this.messagingSystem.call(
    "ApprovalController:addRequest",
    {
      origin,
      id,
      type,
      requestData: {
        // Mirror previous installation metadata
        metadata: { id, origin: snapId, dappOrigin: origin },
        snapId
      },
      requestState: {
        loading: true
      }
    },
    true
  );
  return { id, promise };
};
_updateApproval = new WeakSet();
updateApproval_fn = function(id, requestState) {
  try {
    this.messagingSystem.call("ApprovalController:updateRequestState", {
      id,
      requestState
    });
  } catch {
  }
};
_resolveAllowlistVersion = new WeakSet();
resolveAllowlistVersion_fn = async function(snapId, versionRange) {
  return await this.messagingSystem.call(
    "SnapsRegistry:resolveVersion",
    snapId,
    versionRange
  );
};
_add = new WeakSet();
add_fn = async function(args) {
  const { id: snapId, location, versionRange } = args;
  __privateMethod(this, _setupRuntime, setupRuntime_fn).call(this, snapId);
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  if (!runtime.installPromise) {
    log(`Adding snap: ${snapId}`);
    runtime.installPromise = (async () => {
      const fetchedSnap = await fetchSnap(snapId, location);
      const manifest = fetchedSnap.manifest.result;
      if (!satisfiesVersionRange(manifest.version, versionRange)) {
        throw new Error(
          `Version mismatch. Manifest for "${snapId}" specifies version "${manifest.version}" which doesn't satisfy requested version range "${versionRange}".`
        );
      }
      await __privateMethod(this, _assertIsInstallAllowed, assertIsInstallAllowed_fn).call(this, snapId, {
        version: manifest.version,
        checksum: manifest.source.shasum,
        permissions: manifest.initialPermissions
      });
      return __privateMethod(this, _set, set_fn).call(this, {
        ...args,
        files: fetchedSnap,
        id: snapId
      });
    })();
  }
  try {
    return await runtime.installPromise;
  } catch (error) {
    runtime.installPromise = null;
    throw error;
  }
};
_startSnap = new WeakSet();
startSnap_fn = async function(snapData) {
  const { snapId } = snapData;
  if (this.isRunning(snapId)) {
    throw new Error(`Snap "${snapId}" is already started.`);
  }
  try {
    const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
    const result = await this.messagingSystem.call(
      "ExecutionService:executeSnap",
      {
        ...snapData,
        endowments: await __privateMethod(this, _getEndowments, getEndowments_fn).call(this, snapId)
      }
    );
    __privateMethod(this, _transition, transition_fn).call(this, snapId, SnapStatusEvents.Start);
    runtime.lastRequest = Date.now();
    return result;
  } catch (error) {
    await __privateMethod(this, _terminateSnap, terminateSnap_fn).call(this, snapId);
    throw error;
  }
};
_getEndowments = new WeakSet();
getEndowments_fn = async function(snapId) {
  let allEndowments = [];
  for (const permissionName of __privateGet(this, _environmentEndowmentPermissions)) {
    if (this.messagingSystem.call(
      "PermissionController:hasPermission",
      snapId,
      permissionName
    )) {
      const endowments = await this.messagingSystem.call(
        "PermissionController:getEndowments",
        snapId,
        permissionName
      );
      if (endowments) {
        if (!Array.isArray(endowments) || endowments.some((value) => typeof value !== "string")) {
          throw new Error("Expected an array of string endowment names.");
        }
        allEndowments = allEndowments.concat(endowments);
      }
    }
  }
  const dedupedEndowments = [
    .../* @__PURE__ */ new Set([...DEFAULT_ENDOWMENTS, ...allEndowments])
  ];
  if (dedupedEndowments.length < // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  DEFAULT_ENDOWMENTS.length + allEndowments.length) {
    logError(
      `Duplicate endowments found for ${snapId}. Default endowments should not be requested.`,
      allEndowments
    );
  }
  return dedupedEndowments;
};
_set = new WeakSet();
set_fn = function(args) {
  const {
    id: snapId,
    origin,
    files,
    isUpdate = false,
    removable,
    preinstalled,
    hidden
  } = args;
  const {
    manifest,
    sourceCode: sourceCodeFile,
    svgIcon,
    auxiliaryFiles: rawAuxiliaryFiles,
    localizationFiles
  } = files;
  assertIsSnapManifest(manifest.result);
  const { version } = manifest.result;
  const sourceCode = sourceCodeFile.toString();
  assert(
    typeof sourceCode === "string" && sourceCode.length > 0,
    `Invalid source code for snap "${snapId}".`
  );
  const auxiliaryFiles = rawAuxiliaryFiles.map((file) => {
    assert(typeof file.data.base64 === "string");
    return {
      path: file.path,
      value: file.data.base64
    };
  });
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
  const localizedFiles = localizationFiles.map((file) => file.result);
  const snap = {
    // Restore relevant snap state if it exists
    ...existingSnap,
    // Note that the snap will be unblocked and enabled, regardless of its
    // previous state.
    blocked: false,
    enabled: true,
    removable,
    preinstalled,
    hidden,
    id: snapId,
    initialConnections: manifest.result.initialConnections,
    initialPermissions: manifest.result.initialPermissions,
    manifest: manifest.result,
    status: __privateGet(this, _statusMachine).config.initial,
    sourceCode,
    version,
    versionHistory,
    auxiliaryFiles,
    localizationFiles: localizedFiles
  };
  delete snap.blockInformation;
  const { inversePatches } = this.update((state) => {
    state.snaps[snapId] = snap;
  });
  if (isUpdate) {
    const rollbackSnapshot = __privateMethod(this, _getRollbackSnapshot, getRollbackSnapshot_fn).call(this, snapId);
    if (rollbackSnapshot !== void 0) {
      rollbackSnapshot.statePatches = inversePatches;
    }
  }
  const { proposedName } = getLocalizedSnapManifest(
    manifest.result,
    "en",
    localizedFiles
  );
  this.messagingSystem.call("SubjectMetadataController:addSubjectMetadata", {
    subjectType: SubjectType.Snap,
    name: proposedName,
    origin: snap.id,
    version,
    svgIcon: svgIcon?.toString() ?? null
  });
  return { ...snap, sourceCode };
};
_validateSnapPermissions = new WeakSet();
validateSnapPermissions_fn = function(processedPermissions) {
  const permissionKeys = Object.keys(processedPermissions);
  const handlerPermissions = Array.from(
    new Set(Object.values(handlerEndowments))
  );
  assert(
    permissionKeys.some((key) => handlerPermissions.includes(key)),
    `A snap must request at least one of the following permissions: ${handlerPermissions.filter((handler) => handler !== null).join(", ")}.`
  );
  const excludedPermissionErrors = permissionKeys.reduce(
    (errors, permission) => {
      if (hasProperty(__privateGet(this, _excludedPermissions), permission)) {
        errors.push(__privateGet(this, _excludedPermissions)[permission]);
      }
      return errors;
    },
    []
  );
  assert(
    excludedPermissionErrors.length === 0,
    `One or more permissions are not allowed:
${excludedPermissionErrors.join(
      "\n"
    )}`
  );
};
_getExecutionTimeout = new WeakSet();
getExecutionTimeout_fn = function(permission) {
  return getMaxRequestTimeCaveat(permission) ?? this.maxRequestTime;
};
_getRpcRequestHandler = new WeakSet();
getRpcRequestHandler_fn = function(snapId) {
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  const existingHandler = runtime.rpcHandler;
  if (existingHandler) {
    return existingHandler;
  }
  const requestQueue = new RequestQueue(5);
  const startPromises = /* @__PURE__ */ new Map();
  const rpcHandler = async ({
    origin,
    handler: handlerType,
    request,
    timeout
  }) => {
    if (this.state.snaps[snapId].enabled === false) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }
    if (this.state.snaps[snapId].status === SnapStatus.Installing) {
      throw new Error(
        `Snap "${snapId}" is currently being installed. Please try again later.`
      );
    }
    if (!this.isRunning(snapId)) {
      let localStartPromise = startPromises.get(snapId);
      if (!localStartPromise) {
        localStartPromise = this.startSnap(snapId);
        startPromises.set(snapId, localStartPromise);
      } else if (requestQueue.get(origin) >= requestQueue.maxQueueSize) {
        throw new Error(
          "Exceeds maximum number of requests waiting to be resolved, please try again."
        );
      }
      requestQueue.increment(origin);
      try {
        await localStartPromise;
      } finally {
        requestQueue.decrement(origin);
        if (startPromises.get(snapId) === localStartPromise) {
          startPromises.delete(snapId);
        }
      }
    }
    const timer = new Timer(timeout);
    __privateMethod(this, _recordSnapRpcRequestStart, recordSnapRpcRequestStart_fn).call(this, snapId, request.id, timer);
    const handleRpcRequestPromise = this.messagingSystem.call(
      "ExecutionService:handleRpcRequest",
      snapId,
      { origin, handler: handlerType, request }
    );
    try {
      const result = await withTimeout(handleRpcRequestPromise, timer);
      if (result === hasTimedOut) {
        throw new Error(
          `${snapId} failed to respond to the request in time.`
        );
      }
      await __privateMethod(this, _assertSnapRpcRequestResult, assertSnapRpcRequestResult_fn).call(this, snapId, handlerType, result);
      const transformedResult = await __privateMethod(this, _transformSnapRpcRequestResult, transformSnapRpcRequestResult_fn).call(this, snapId, handlerType, result);
      __privateMethod(this, _recordSnapRpcRequestFinish, recordSnapRpcRequestFinish_fn).call(this, snapId, request.id);
      return transformedResult;
    } catch (error) {
      __privateMethod(this, _recordSnapRpcRequestFinish, recordSnapRpcRequestFinish_fn).call(this, snapId, request.id);
      const [jsonRpcError, handled] = unwrapError(error);
      if (!handled) {
        await this.stopSnap(snapId, SnapStatusEvents.Crash);
      }
      throw jsonRpcError;
    }
  };
  runtime.rpcHandler = rpcHandler;
  return rpcHandler;
};
_createInterface = new WeakSet();
createInterface_fn = async function(snapId, content) {
  return this.messagingSystem.call(
    "SnapInterfaceController:createInterface",
    snapId,
    content
  );
};
_assertInterfaceExists = new WeakSet();
assertInterfaceExists_fn = function(snapId, id) {
  assert(
    this.messagingSystem.call(
      "SnapInterfaceController:getInterface",
      snapId,
      id
    )
  );
};
_transformSnapRpcRequestResult = new WeakSet();
transformSnapRpcRequestResult_fn = async function(snapId, handlerType, result) {
  switch (handlerType) {
    case HandlerType.OnTransaction:
    case HandlerType.OnSignature:
    case HandlerType.OnHomePage: {
      const castResult = result;
      if (castResult && hasProperty(castResult, "content")) {
        const { content, ...rest } = castResult;
        const id = await __privateMethod(this, _createInterface, createInterface_fn).call(this, snapId, content);
        return { ...rest, id };
      }
      return result;
    }
    default:
      return result;
  }
};
_assertSnapRpcRequestResult = new WeakSet();
assertSnapRpcRequestResult_fn = async function(snapId, handlerType, result) {
  switch (handlerType) {
    case HandlerType.OnTransaction: {
      assertStruct(result, OnTransactionResponseStruct);
      if (result && hasProperty(result, "id")) {
        __privateMethod(this, _assertInterfaceExists, assertInterfaceExists_fn).call(this, snapId, result.id);
      }
      break;
    }
    case HandlerType.OnSignature: {
      assertStruct(result, OnSignatureResponseStruct);
      if (result && hasProperty(result, "id")) {
        __privateMethod(this, _assertInterfaceExists, assertInterfaceExists_fn).call(this, snapId, result.id);
      }
      break;
    }
    case HandlerType.OnHomePage: {
      assertStruct(result, OnHomePageResponseStruct);
      if (result && hasProperty(result, "id")) {
        __privateMethod(this, _assertInterfaceExists, assertInterfaceExists_fn).call(this, snapId, result.id);
      }
      break;
    }
    case HandlerType.OnNameLookup:
      assertStruct(result, OnNameLookupResponseStruct);
      break;
    default:
      break;
  }
};
_recordSnapRpcRequestStart = new WeakSet();
recordSnapRpcRequestStart_fn = function(snapId, requestId, timer) {
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  runtime.pendingInboundRequests.push({ requestId, timer });
  runtime.lastRequest = null;
};
_recordSnapRpcRequestFinish = new WeakSet();
recordSnapRpcRequestFinish_fn = function(snapId, requestId) {
  const runtime = __privateMethod(this, _getRuntimeExpect, getRuntimeExpect_fn).call(this, snapId);
  runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter(
    (request) => request.requestId !== requestId
  );
  if (runtime.pendingInboundRequests.length === 0) {
    runtime.lastRequest = Date.now();
  }
};
_getRollbackSnapshot = new WeakSet();
getRollbackSnapshot_fn = function(snapId) {
  return __privateGet(this, _rollbackSnapshots).get(snapId);
};
_createRollbackSnapshot = new WeakSet();
createRollbackSnapshot_fn = function(snapId) {
  assert(
    __privateGet(this, _rollbackSnapshots).get(snapId) === void 0,
    new Error(`Snap "${snapId}" rollback snapshot already exists.`)
  );
  __privateGet(this, _rollbackSnapshots).set(snapId, {
    statePatches: [],
    permissions: {},
    newVersion: ""
  });
  const newRollbackSnapshot = __privateGet(this, _rollbackSnapshots).get(snapId);
  assert(
    newRollbackSnapshot !== void 0,
    new Error(`Snapshot creation failed for ${snapId}.`)
  );
  return newRollbackSnapshot;
};
_rollbackSnap = new WeakSet();
rollbackSnap_fn = async function(snapId) {
  const rollbackSnapshot = __privateMethod(this, _getRollbackSnapshot, getRollbackSnapshot_fn).call(this, snapId);
  if (!rollbackSnapshot) {
    throw new Error("A snapshot does not exist for this snap.");
  }
  await this.stopSnap(snapId, SnapStatusEvents.Stop);
  if (this.get(snapId)?.status !== SnapStatus.Stopped) {
    __privateMethod(this, _transition, transition_fn).call(this, snapId, SnapStatusEvents.Stop);
  }
  const { statePatches, permissions } = rollbackSnapshot;
  if (statePatches?.length) {
    this.applyPatches(statePatches);
  }
  if (this.get(snapId)?.status !== SnapStatus.Stopped) {
    this.update((state) => {
      state.snaps[snapId].status = SnapStatus.Stopped;
    });
  }
  __privateMethod(this, _updatePermissions, updatePermissions_fn).call(this, {
    snapId,
    unusedPermissions: permissions.granted,
    newPermissions: permissions.revoked,
    requestData: permissions.requestData
  });
  const truncatedSnap = this.getTruncatedExpect(snapId);
  this.messagingSystem.publish(
    "SnapController:snapRolledback",
    truncatedSnap,
    rollbackSnapshot.newVersion
  );
  __privateGet(this, _rollbackSnapshots).delete(snapId);
};
_rollbackSnaps = new WeakSet();
rollbackSnaps_fn = async function(snapIds) {
  for (const snapId of snapIds) {
    await __privateMethod(this, _rollbackSnap, rollbackSnap_fn).call(this, snapId);
  }
};
_getRuntime = new WeakSet();
getRuntime_fn = function(snapId) {
  return __privateGet(this, _snapsRuntimeData).get(snapId);
};
_getRuntimeExpect = new WeakSet();
getRuntimeExpect_fn = function(snapId) {
  const runtime = __privateMethod(this, _getRuntime, getRuntime_fn).call(this, snapId);
  assert(
    runtime !== void 0,
    new Error(`Snap "${snapId}" runtime data not found`)
  );
  return runtime;
};
_setupRuntime = new WeakSet();
setupRuntime_fn = function(snapId) {
  if (__privateGet(this, _snapsRuntimeData).has(snapId)) {
    return;
  }
  const snap = this.get(snapId);
  const interpreter = interpret(__privateGet(this, _statusMachine));
  interpreter.start({
    context: { snapId },
    value: snap?.status ?? __privateGet(this, _statusMachine).config.initial
  });
  forceStrict(interpreter);
  __privateGet(this, _snapsRuntimeData).set(snapId, {
    lastRequest: null,
    rpcHandler: null,
    installPromise: null,
    encryptionKey: null,
    encryptionSalt: null,
    activeReferences: 0,
    pendingInboundRequests: [],
    pendingOutboundRequests: 0,
    interpreter,
    stopping: false
  });
};
_calculatePermissionsChange = new WeakSet();
calculatePermissionsChange_fn = function(snapId, desiredPermissionsSet) {
  const oldPermissions = this.messagingSystem.call(
    "PermissionController:getPermissions",
    snapId
  ) ?? {};
  const newPermissions = permissionsDiff(
    desiredPermissionsSet,
    oldPermissions
  );
  const unusedPermissions = permissionsDiff(
    oldPermissions,
    desiredPermissionsSet
  );
  const approvedPermissions = permissionsDiff(
    oldPermissions,
    unusedPermissions
  );
  return { newPermissions, unusedPermissions, approvedPermissions };
};
_isSubjectConnectedToSnap = new WeakSet();
isSubjectConnectedToSnap_fn = function(snapId, origin) {
  const subjectPermissions = this.messagingSystem.call(
    "PermissionController:getPermissions",
    origin
  );
  const existingCaveat = subjectPermissions?.[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds);
  return Boolean(existingCaveat?.value?.[snapId]);
};
_calculateConnectionsChange = new WeakSet();
calculateConnectionsChange_fn = function(snapId, oldConnectionsSet, desiredConnectionsSet) {
  const filteredOldConnections = Object.keys(oldConnectionsSet).filter((origin) => __privateMethod(this, _isSubjectConnectedToSnap, isSubjectConnectedToSnap_fn).call(this, snapId, origin)).reduce((accumulator, origin) => {
    accumulator[origin] = oldConnectionsSet[origin];
    return accumulator;
  }, {});
  const newConnections = setDiff(
    desiredConnectionsSet,
    filteredOldConnections
  );
  const unusedConnections = setDiff(
    filteredOldConnections,
    desiredConnectionsSet
  );
  const approvedConnections = setDiff(
    filteredOldConnections,
    unusedConnections
  );
  return { newConnections, unusedConnections, approvedConnections };
};
_updatePermissions = new WeakSet();
updatePermissions_fn = function({
  snapId,
  unusedPermissions = {},
  newPermissions = {},
  requestData
}) {
  const unusedPermissionsKeys = Object.keys(unusedPermissions);
  if (isNonEmptyArray(unusedPermissionsKeys)) {
    this.messagingSystem.call("PermissionController:revokePermissions", {
      [snapId]: unusedPermissionsKeys
    });
  }
  if (isNonEmptyArray(Object.keys(newPermissions))) {
    this.messagingSystem.call("PermissionController:grantPermissions", {
      approvedPermissions: newPermissions,
      subject: { origin: snapId },
      requestData
    });
  }
};
_isValidUpdate = new WeakSet();
isValidUpdate_fn = function(snapId, newVersionRange) {
  const existingSnap = this.getExpect(snapId);
  if (satisfiesVersionRange(existingSnap.version, newVersionRange)) {
    return false;
  }
  if (gtRange(existingSnap.version, newVersionRange)) {
    return false;
  }
  return true;
};
_callLifecycleHook = new WeakSet();
callLifecycleHook_fn = async function(origin, snapId, handler) {
  const permissionName = handlerEndowments[handler];
  assert(permissionName, "Lifecycle hook must have an endowment.");
  const hasPermission = this.messagingSystem.call(
    "PermissionController:hasPermission",
    snapId,
    permissionName
  );
  if (!hasPermission) {
    return;
  }
  await this.handleRequest({
    snapId,
    handler,
    origin,
    request: {
      jsonrpc: "2.0",
      method: handler
    }
  });
};

export {
  controllerName,
  SNAP_APPROVAL_INSTALL,
  SNAP_APPROVAL_UPDATE,
  SNAP_APPROVAL_RESULT,
  SnapController
};
//# sourceMappingURL=chunk-3M7I7HDM.mjs.map