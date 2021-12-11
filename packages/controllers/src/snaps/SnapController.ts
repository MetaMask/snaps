import { ethErrors, serializeError } from 'eth-rpc-errors';
import type { Patch } from 'immer';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { Json } from 'json-rpc-engine';
import {
  ErrorJSON,
  ErrorMessageEvent,
  SnapData,
  SnapId,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { nanoid } from 'nanoid';
import isValidSemver from 'semver/functions/valid';
import { PermissionConstraint } from '../permissions';
import {
  GetRpcMessageHandler,
  ExecuteSnap,
  TerminateAll,
  TerminateSnap,
} from '../services/ExecutionEnvironmentService';
import { timeSince } from '../utils';
import {
  LOCALHOST_HOSTNAMES,
  SnapIdPrefixes,
  NpmSnapFileNames,
  validateSnapShasum,
  ValidatedSnapId,
  fetchContent,
  fetchNpmSnap,
} from './utils';
import { SnapManifest, validateSnapJsonFile } from './json-schemas';

export const controllerName = 'SnapController';

export const SNAP_PREFIX = 'wallet_snap_';
export const SNAP_PREFIX_REGEX = new RegExp(`^${SNAP_PREFIX}`, 'u');
const SERIALIZABLE_SNAP_PROPERTIES = new Set([
  'initialPermissions',
  'id',
  'permissionName',
]);

type RequestedSnapPermissions = {
  [permission: string]: Record<string, Json>;
};

export type SerializableSnap = {
  initialPermissions: RequestedSnapPermissions;
  id: SnapId;
  permissionName: string;
  version: string;
  manifest: SnapManifest;
  status: SnapStatus;
  enabled: boolean;
};

export type Snap = SerializableSnap & {
  sourceCode: string;
};

export type SnapError = {
  message: string;
  code: number;
  data?: Json;
};

export type ProcessSnapReturnType =
  | SerializableSnap
  | { error: ReturnType<typeof serializeError> };
export type InstallSnapsResult = Record<SnapId, ProcessSnapReturnType>;

// Types that probably should be defined elsewhere in prod
type RemoveAllPermissionsFunction = (snapIds: string[]) => void;
type CloseAllConnectionsFunction = (origin: string) => void;
type RequestPermissionsFunction = (
  origin: string,
  requestedPermissions: RequestedSnapPermissions,
) => Promise<PermissionConstraint[]>;
type HasPermissionFunction = (
  origin: string,
  permissionName: string,
) => boolean;
type GetPermissionsFunction = (origin: string) => PermissionConstraint[];
type StoredSnaps = Record<SnapId, Snap>;

export type SnapControllerState = {
  snaps: StoredSnaps;
  snapStates: Record<SnapId, Json>;
  snapErrors: {
    [internalID: string]: SnapError & { internalID: string };
  };
};

export type SnapStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [SnapControllerState, Patch[]];
};

// TODO: Create actions
export type SnapControllerActions = never;

export type AllowedActions = never;

export type SnapControllerEvents = SnapStateChange;

export type AllowedEvents = ErrorMessageEvent | UnresponsiveMessageEvent;

// TODO: Use ControllerMessenger events
type SnapControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapControllerActions,
  SnapControllerEvents | AllowedEvents,
  AllowedActions,
  AllowedEvents['type']
>;

type SnapControllerArgs = {
  messenger: SnapControllerMessenger;
  state?: SnapControllerState;
  removeAllPermissionsFor: RemoveAllPermissionsFunction;
  closeAllConnections: CloseAllConnectionsFunction;
  requestPermissions: RequestPermissionsFunction;
  getPermissions: GetPermissionsFunction;
  hasPermission: HasPermissionFunction;
  terminateSnap: TerminateSnap;
  terminateAllSnaps: TerminateAll;
  executeSnap: ExecuteSnap;
  getRpcMessageHandler: GetRpcMessageHandler;
  maxIdleTime?: number;
  maxRequestTime?: number;
  idleTimeCheckInterval?: number;
};

type AddSnapBase = {
  id: SnapId;
  version?: string;
};

type AddSnapDirectlyArgs = AddSnapBase & {
  manifest: SnapManifest;
  sourceCode: string;
};

type AddSnapArgs = AddSnapBase | AddSnapDirectlyArgs;

type ValidatedAddSnapArgs = Omit<AddSnapDirectlyArgs, 'id'> & {
  id: ValidatedSnapId;
};

const defaultState: SnapControllerState = {
  snapErrors: {},
  snaps: {},
  snapStates: {},
};

export enum SnapStatus {
  installing = 'installing',
  running = 'running',
  stopped = 'stopped',
  crashed = 'crashed',
}

export enum SnapStatusEvent {
  start = 'start',
  stop = 'stop',
  crash = 'crash',
}

/**
 * Guard transitioning when the snap is disabled.
 */
const disabledGuard = (serializedSnap: SerializableSnap) => {
  return serializedSnap.enabled;
};

/**
 * The state machine configuration for a snaps `status` state.
 * Using a state machine for a snaps `status` ensures that the snap transitions to a valid next lifecycle state.
 * Supports a very minimal subset of XState conventions outlined in `_transitionSnapState`.
 */
const snapStatusStateMachineConfig = {
  initial: SnapStatus.installing,
  states: {
    [SnapStatus.installing]: {
      on: {
        [SnapStatusEvent.start]: {
          target: SnapStatus.running,
          cond: disabledGuard,
        },
      },
    },
    [SnapStatus.running]: {
      on: {
        [SnapStatusEvent.stop]: SnapStatus.stopped,
        [SnapStatusEvent.crash]: SnapStatus.crashed,
      },
    },
    [SnapStatus.stopped]: {
      on: {
        [SnapStatusEvent.start]: {
          target: SnapStatus.running,
          cond: disabledGuard,
        },
      },
    },
    [SnapStatus.crashed]: {
      on: {
        [SnapStatusEvent.start]: {
          target: SnapStatus.running,
          cond: disabledGuard,
        },
      },
    },
  },
} as const;

const name = 'SnapController';

/*
 * A snap is initialized in three phases:
 * - Add: Loads the snap from a remote source and parses it.
 * - Authorize: Requests the snap's required permissions from the user.
 * - Start: Initializes the snap in its SES realm with the authorized permissions.
 */

export class SnapController extends BaseController<
  string,
  SnapControllerState,
  SnapControllerMessenger
> {
  private _removeAllPermissionsFor: RemoveAllPermissionsFunction;

  private _closeAllConnections: CloseAllConnectionsFunction;

  private _requestPermissions: RequestPermissionsFunction;

  private _getPermissions: GetPermissionsFunction;

  private _hasPermission: HasPermissionFunction;

  private _terminateSnap: TerminateSnap;

  private _terminateAllSnaps: TerminateAll;

  private _executeSnap: ExecuteSnap;

  private _getRpcMessageHandler: GetRpcMessageHandler;

  private _snapsBeingAdded: Map<string, Promise<Snap>>;

  private _maxIdleTime: number;

  private _maxRequestTime: number;

  private _idleTimeCheckInterval: number;

  private _timeoutForLastRequestStatus?: number;

  private _lastRequestMap: Map<SnapId, number>;

  private _rpcHandlerMap: Map<
    SnapId,
    (origin: string, request: Record<string, unknown>) => Promise<unknown>
  >;

  constructor({
    removeAllPermissionsFor,
    closeAllConnections,
    requestPermissions,
    getPermissions,
    terminateSnap,
    terminateAllSnaps,
    hasPermission,
    executeSnap,
    getRpcMessageHandler,
    messenger,
    state,
    maxIdleTime = 30000,
    idleTimeCheckInterval = 5000,
    maxRequestTime = 60000,
  }: SnapControllerArgs) {
    super({
      messenger,
      metadata: {
        snapErrors: {
          persist: false,
          anonymous: false,
        },
        snapStates: {
          persist: true,
          anonymous: false,
        },
        snaps: {
          persist: (snaps) => {
            return Object.values(snaps)
              .map((snap) => {
                return {
                  ...snap,
                  // At the time state is rehydrated, no snap will be running.
                  status: SnapStatus.stopped,
                };
              })
              .reduce((memo: Record<string, Snap>, snap) => {
                memo[snap.id] = snap;
                return memo;
              }, {});
          },
          anonymous: false,
        },
      },
      name,
      state: { ...defaultState, ...state },
    });

    this._removeAllPermissionsFor = removeAllPermissionsFor;
    this._closeAllConnections = closeAllConnections;
    this._requestPermissions = requestPermissions;
    this._getPermissions = getPermissions;
    this._hasPermission = hasPermission;

    this._terminateSnap = terminateSnap;
    this._terminateAllSnaps = terminateAllSnaps;
    this._executeSnap = executeSnap;
    this._getRpcMessageHandler = getRpcMessageHandler;
    this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
    this._onUnresponsiveSnap = this._onUnresponsiveSnap.bind(this);

    this.messagingSystem.subscribe(
      'ServiceMessenger:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messagingSystem.subscribe(
      'ServiceMessenger:unresponsive',
      this._onUnresponsiveSnap,
    );

    this._snapsBeingAdded = new Map();
    this._maxIdleTime = maxIdleTime;
    this._maxRequestTime = maxRequestTime;
    this._idleTimeCheckInterval = idleTimeCheckInterval;
    this._pollForLastRequestStatus();
    this._lastRequestMap = new Map();
    this._rpcHandlerMap = new Map();
  }

  _pollForLastRequestStatus() {
    this._timeoutForLastRequestStatus = setTimeout(async () => {
      this._stopSnapsLastRequestPastMax();
      this._pollForLastRequestStatus();
    }, this._idleTimeCheckInterval) as unknown as number;
  }

  _stopSnapsLastRequestPastMax() {
    this._lastRequestMap.forEach(async (timestamp, snapId) => {
      if (this._maxIdleTime && timeSince(timestamp) > this._maxIdleTime) {
        this.stopSnap(snapId);
      }
    });
  }

  _onUnresponsiveSnap(snapId: SnapId) {
    this._transitionSnapState(snapId, SnapStatusEvent.crash);
    this._stopSnap(snapId, false);
    this.addSnapError({
      code: -32001, // just made this code up
      message: 'Snap Unresponsive',
      data: {
        snapId,
      },
    });
  }

  _onUnhandledSnapError(snapId: SnapId, error: ErrorJSON) {
    this._transitionSnapState(snapId, SnapStatusEvent.crash);
    this._stopSnap(snapId, false);
    this.addSnapError(error);
  }

  /**
   * Transitions between states using `snapStatusStateMachineConfig` as the template to figure out the next state.
   * This transition function uses a very minimal subset of XState conventions:
   * - supports initial state
   * - .on supports raw event target string
   * - .on supports {target, cond} object
   * - the arguments for `cond` is the `SerializedSnap` instead of Xstate convention of `(event, context) => boolean`
   *
   * @param snapId - The id of the snap to transition
   * @param event - The event enum to use to transition
   */
  _transitionSnapState(snapId: SnapId, event: SnapStatusEvent) {
    const snapStatus = this.state.snaps[snapId].status;
    let nextStatus =
      (snapStatusStateMachineConfig.states[snapStatus].on as any)[event] ??
      snapStatus;
    if (nextStatus.cond) {
      const cond = nextStatus.cond(this.state.snaps[snapId]);
      if (cond === false) {
        throw new Error(
          `Condition failed for state transition "${snapId}" with event "${event}".`,
        );
      }
    }

    if (nextStatus.target) {
      nextStatus = nextStatus.target;
    }

    if (nextStatus === snapStatus) {
      return;
    }

    this.update((state: any) => {
      state.snaps[snapId].status = nextStatus;
    });
  }

  /**
   * Runs existing (installed) snaps.
   * Deletes any snaps that cannot be started.
   */
  async runExistingSnaps(): Promise<void> {
    const { snaps } = this.state;

    if (Object.keys(snaps).length > 0) {
      console.log('Starting existing snaps...', snaps);
    } else {
      console.log('No existing snaps to run.');
      return;
    }

    await Promise.all(
      Object.values(snaps).map(async ({ id: snapId, sourceCode }) => {
        console.log(`Starting: ${snapId}`);

        try {
          await this._startSnap({
            snapId,
            sourceCode,
          });
        } catch (err) {
          console.warn(`Failed to start "${snapId}", deleting it.`, err);
          // Clean up failed snaps:
          this.removeSnap(snapId);
        }
      }),
    );
  }

  /**
   * Starts the given snap. Throws an error if no such snap exists
   * or if it is already running.
   *
   * @param snapId - The id of the Snap to start.
   */
  async startSnap(snapId: SnapId): Promise<void> {
    const snap = this.get(snapId);
    if (!snap) {
      throw new Error(`Snap "${snapId}" not found.`);
    }

    if (this.state.snaps[snapId].enabled === false) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }

    await this._startSnap({
      snapId,
      sourceCode: snap.sourceCode,
    });
  }

  /**
   * Enables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to enable.
   */
  enableSnap(snapId: SnapId): void {
    this.update((state: any) => {
      state.snaps[snapId].enabled = true;
    });
  }

  /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to disable.
   */
  disableSnap(snapId: SnapId): void {
    this.stopSnap(snapId);
    this.update((state: any) => {
      state.snaps[snapId].enabled = false;
    });
  }

  /**
   * Stops the given snap. Throws an error if no such snap exists
   * or if it is already stopped.
   *
   * @param snapId - The id of the Snap to stop.
   */
  stopSnap(snapId: SnapId): void {
    const snap = this.get(snapId);
    if (!snap) {
      throw new Error(`Snap "${snapId}" not found.`);
    }

    if (!this.isRunning(snapId)) {
      throw new Error(`Snap "${snapId}" already stopped.`);
    }

    this._stopSnap(snapId);
    console.log(`Snap "${snapId}" stopped.`);
  }

  /**
   * Stops the given snap, removes all hooks, closes all connections, and
   * terminates its worker.
   *
   * @param snapId - The id of the Snap to stop.
   * @param setNotRunning - Whether to mark the snap as not running.
   * Should only be set to false if the snap is about to be deleted.
   */
  private _stopSnap(snapId: SnapId, setNotRunning = true): void {
    this._lastRequestMap.delete(snapId);
    this._closeAllConnections(snapId);
    this._terminateSnap(snapId);
    if (setNotRunning) {
      this._transitionSnapState(snapId, SnapStatusEvent.stop);
    }
  }

  /**
   * Returns whether the given snap is running.
   * Throws an error if the snap doesn't exist.
   *
   * @param snapId - The id of the Snap to check.
   */
  isRunning(snapId: SnapId): boolean {
    const snap = this.get(snapId);
    if (!snap) {
      throw new Error(`Snap "${snapId}" not found.`);
    }

    return snap.status === SnapStatus.running;
  }

  /**
   * Returns whether the given snap has been added to state.
   *
   * @param snapId - The id of the Snap to check for.
   */
  has(snapId: SnapId): boolean {
    return snapId in this.state.snaps;
  }

  /**
   * Gets the snap with the given id if it exists, including all data.
   * This should not be used if the snap is to be serializable, as e.g.
   * the snap sourceCode may be quite large.
   *
   * @param snapId - The id of the Snap to get.
   */
  get(snapId: SnapId) {
    return this.state.snaps[snapId];
  }

  /**
   * Gets the snap with the given id if it exists, excluding any
   * non-serializable or expensive-to-serialize data.
   *
   * @param snapId - The id of the Snap to get.
   */
  getSerializable(snapId: SnapId): SerializableSnap | null {
    const snap = this.get(snapId);

    return snap
      ? // The cast to "any" of the accumulator object is due to a TypeScript bug
        (Object.keys(snap).reduce((serialized, key) => {
          if (SERIALIZABLE_SNAP_PROPERTIES.has(key as keyof Snap)) {
            serialized[key] = snap[key as keyof SerializableSnap];
          }

          return serialized;
        }, {} as any) as SerializableSnap)
      : null;
  }

  /**
   * Updates the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   */
  async updateSnapState(snapId: SnapId, newSnapState: Json): Promise<void> {
    this.update((state: any) => {
      state.snapStates[snapId] = newSnapState;
    });
  }

  /**
   * Adds error from a snap to the SnapControllers state.
   *
   * @param snapError - The error to store on the SnapController
   */
  async addSnapError(snapError: SnapError) {
    this.update((state: any) => {
      const id = nanoid();
      state.snapErrors[id] = {
        ...snapError,
        internalID: id,
      };
    });
  }

  /**
   * Removes an error by internalID from a the SnapControllers state.
   *
   * @param internalID - The internal error ID to remove on the SnapController
   */
  async removeSnapError(internalID: string) {
    this.update((state: any) => {
      delete state.snapErrors[internalID];
    });
  }

  /**
   * Clears all errors from the SnapControllers state.
   *
   */
  async clearSnapErrors() {
    this.update((state: any) => {
      state.snapErrors = {};
    });
  }

  /**
   * Gets the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state to get.
   */
  async getSnapState(snapId: SnapId): Promise<Json> {
    return this.state.snapStates[snapId];
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
    this._terminateAllSnaps();
    this._removeAllPermissionsFor(snapIds);
    this.update((state: any) => {
      state.snaps = {};
      state.snapStates = {};
    });
  }

  /**
   * Removes the given snap from state, and clears all associated handlers
   * and listeners.
   *
   * @param snapId - The id of the Snap.
   */
  removeSnap(snapId: SnapId): void {
    this.removeSnaps([snapId]);
  }

  /**
   * Stops the given snaps, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param snapIds - The ids of the Snaps.
   */
  removeSnaps(snapIds: string[]): void {
    if (!Array.isArray(snapIds)) {
      throw new Error('Expected array of snap ids.');
    }

    this.update((state: any) => {
      snapIds.forEach((snapId) => {
        this._stopSnap(snapId, false);
        this._rpcHandlerMap.delete(snapId);
        delete state.snaps[snapId];
        delete state.snapStates[snapId];
      });
    });

    this._removeAllPermissionsFor(snapIds);
  }

  /**
   * Gets the serialized permitted snaps of the given origin, if any.
   * @param origin - The origin whose permitted snaps to retrieve.
   */
  getPermittedSnaps(origin: string): InstallSnapsResult {
    return this._getPermissions(origin).reduce((permittedSnaps, perm) => {
      if (perm.parentCapability.startsWith(SNAP_PREFIX)) {
        const snapId = perm.parentCapability.replace(SNAP_PREFIX_REGEX, '');
        const snap = this.getSerializable(snapId);

        permittedSnaps[snapId] = snap || {
          error: serializeError(new Error('Snap permitted but not installed.')),
        };
      }
      return permittedSnaps;
    }, {} as InstallSnapsResult);
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
  async installSnaps(
    origin: string,
    requestedSnaps: RequestedSnapPermissions,
  ): Promise<InstallSnapsResult> {
    const result: InstallSnapsResult = {};

    // use a for-loop so that we can return an object and await the resolution
    // of each call to processRequestedSnap
    await Promise.all(
      Object.entries(requestedSnaps).map(
        async ([snapId, { version = 'latest' }]) => {
          const permissionName = SNAP_PREFIX + snapId;

          if (this._hasPermission(origin, permissionName)) {
            if (isValidSnapVersion(version)) {
              // attempt to install and run the snap, storing any errors that
              // occur during the process
              result[snapId] = {
                ...(await this.processRequestedSnap(snapId, version)),
              };
            }

            result[snapId] = {
              error: ethErrors.rpc.invalidParams(
                `The "version" field must be a valid SemVer version or the string "latest" if specified. Received: "${version}".`,
              ),
            };
          } else {
            // only allow the installation of permitted snaps
            result[snapId] = {
              error: ethErrors.provider.unauthorized(
                `Not authorized to install snap "${snapId}". Request the permission for the snap before attempting to install it.`,
              ),
            };
          }
        },
      ),
    );
    return result;
  }

  /**
   * Adds, authorizes, and runs the given snap with a snap provider.
   * Results from this method should be efficiently serializable.
   *
   * @param snapId - The id of the snap.
   * @param version - The version of the snap to install.
   * @returns The resulting snap object, or an error if something went wrong.
   */
  async processRequestedSnap(
    snapId: SnapId,
    version: string,
  ): Promise<ProcessSnapReturnType> {
    // If the snap is already installed, just return it
    const snap = this.get(snapId);
    if (snap) {
      return this.getSerializable(snapId) as SerializableSnap;
    }

    try {
      const { sourceCode } = await this.add({
        id: snapId,
        version,
      });

      await this.authorize(snapId);

      await this._startSnap({
        snapId,
        sourceCode,
      });

      return this.getSerializable(snapId) as SerializableSnap;
    } catch (err) {
      console.error(`Error when adding snap.`, err);
      return { error: serializeError(err) };
    }
  }

  /**
   * Returns a promise representing the complete installation of the requested snap.
   * If the snap is already being installed, the previously pending promise will be returned.
   *
   * @param snapId - The id of the Snap.
   * @param args - Object containing either the URL of the snap's manifest,
   * or the snap's manifest and source code.
   * @returns The resulting snap object.
   */
  add(args: AddSnapArgs): Promise<Snap> {
    const { id: _snapId } = args;
    this.validateSnapId(_snapId);
    const snapId: ValidatedSnapId = _snapId as ValidatedSnapId;

    if (
      !args ||
      !('id' in args) ||
      (!('manifest' in args) && 'sourceCode' in args) ||
      ('manifest' in args && !('sourceCode' in args))
    ) {
      throw new Error(`Invalid add snap args for snap "${snapId}".`);
    }

    if (!this._snapsBeingAdded.has(snapId)) {
      console.log(`Adding snap: ${snapId}`);
      this._snapsBeingAdded.set(
        snapId,
        this._add(args as ValidatedAddSnapArgs),
      );
    }

    return this._snapsBeingAdded.get(snapId) as Promise<Snap>;
  }

  private validateSnapId(snapId: unknown): void {
    if (!snapId || typeof snapId !== 'string') {
      throw new Error(`Invalid snap id: Not a string. Received "${snapId}"`);
    }

    for (const prefix of Object.values(SnapIdPrefixes)) {
      if (snapId.startsWith(prefix) && snapId.replace(prefix, '').length > 0) {
        return;
      }
    }

    throw new Error(`Invalid snap id. Received: "${snapId}"`);
  }

  private async _startSnap(snapData: SnapData) {
    const { snapId } = snapData;
    if (this.isRunning(snapId)) {
      throw new Error(`Snap "${snapId}" is already started.`);
    }

    const result = await this._executeSnap(snapData);
    this._transitionSnapState(snapId, SnapStatusEvent.start);
    return result;
  }

  /**
   * Internal method. See the "add" method.
   *
   * @param snapId - The id of the Snap.
   * @param args - The add snap args.
   * @returns The resulting snap object.
   */
  private async _add(args: ValidatedAddSnapArgs): Promise<Snap> {
    const { id: snapId, version } = args;

    let manifest: SnapManifest, sourceCode: string;
    if ('manifest' in args) {
      manifest = args.manifest;
      sourceCode = args.sourceCode;
      validateSnapJsonFile(NpmSnapFileNames.Manifest, manifest);
    } else {
      [manifest, sourceCode] = await this._fetchSnap(snapId, version);
    }

    if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
      throw new Error(`Invalid source code for snap "${snapId}".`);
    }

    const initialPermissions = manifest?.initialPermissions;
    if (
      !initialPermissions ||
      typeof initialPermissions !== 'object' ||
      Array.isArray(initialPermissions)
    ) {
      throw new Error(`Invalid initial permissions for snap "${snapId}".`);
    }

    let snap: Snap = {
      initialPermissions,
      id: snapId,
      permissionName: SNAP_PREFIX + snapId, // so we can easily correlate them
      sourceCode,
      version: manifest.version,
      manifest,
      enabled: true,
      status: snapStatusStateMachineConfig.initial,
    };

    const snapsState = this.state.snaps;

    // restore relevant snap state if it exists
    if (snapsState[snapId]) {
      snap = { ...snapsState[snapId], ...snap };
    }

    // store the snap back in state
    this.update((state: any) => {
      state.snaps[snapId] = snap;
    });

    return snap;
  }

  /**
   * Fetches the manifest and source code of a snap.
   *
   * @param snapId - The id of the Snap.
   * @param version - The version of the Snap to fetch.
   * @returns A tuple of the Snap manifest object and the Snap source code.
   */
  private async _fetchSnap(
    snapId: ValidatedSnapId,
    version?: string,
  ): Promise<[SnapManifest, string]> {
    try {
      if (snapId.startsWith(SnapIdPrefixes.local)) {
        return this._fetchLocalSnap(snapId.replace(SnapIdPrefixes.local, ''));
      } else if (snapId.startsWith(SnapIdPrefixes.npm)) {
        return this._fetchNpmSnap(
          snapId.replace(SnapIdPrefixes.npm, ''),
          version,
        );
      }

      // This should be impossible.
      /* istanbul ignore next */
      throw new Error(`Invalid Snap id: "${snapId}"`);
    } catch (error) {
      throw new Error(
        `Failed to fetch Snap "${snapId}": ${(error as Error).message}`,
      );
    }
  }

  private async _fetchNpmSnap(
    packageName: string,
    version?: string,
  ): Promise<[SnapManifest, string]> {
    if (!isValidSnapVersion(version)) {
      throw new Error(`Received invalid Snap version: "${version}".`);
    }

    const [manifest, sourceCode] = await fetchNpmSnap(packageName, version);
    return [manifest, sourceCode];
  }

  /**
   * Fetches the manifest and source code of a local snap.
   *
   * @param localhostUrl - The localhost URL to download from.
   * @returns The validated manifest and the source code.
   */
  private async _fetchLocalSnap(
    localhostUrl: string,
  ): Promise<[SnapManifest, string]> {
    const manifestUrl = new URL(NpmSnapFileNames.Manifest, localhostUrl);
    if (!LOCALHOST_HOSTNAMES.has(manifestUrl.hostname)) {
      throw new Error(
        `Invalid URL: Locally hosted Snaps must be hosted on localhost. Received URL: "${manifestUrl.toString()}"`,
      );
    }

    const _manifest = await fetchContent(manifestUrl, 'json');
    validateSnapJsonFile(NpmSnapFileNames.Manifest, _manifest);
    const manifest = _manifest as SnapManifest;

    const {
      source: {
        location: {
          npm: { filePath },
        },
      },
    } = manifest;

    const sourceCode = await fetchContent(
      new URL(filePath, localhostUrl),
      'text',
    );
    validateSnapShasum(manifest, sourceCode);

    return [manifest, sourceCode];
  }

  /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * @param snapId - The id of the Snap.
   * @returns The snap's approvedPermissions.
   */
  async authorize(snapId: SnapId): Promise<string[]> {
    console.log(`Authorizing snap: ${snapId}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapId];
    const { initialPermissions } = snap;

    // Don't prompt if there are no permissions requested:
    if (Object.keys(initialPermissions).length === 0) {
      return [];
    }

    if (initialPermissions === null) {
      return [];
    }

    try {
      const approvedPermissions = await this._requestPermissions(
        snapId,
        initialPermissions,
      );
      return approvedPermissions.map((perm) => perm.parentCapability);
    } finally {
      this._snapsBeingAdded.delete(snapId);
    }
  }

  destroy() {
    super.destroy();

    if (this._timeoutForLastRequestStatus) {
      clearTimeout(this._timeoutForLastRequestStatus);
    }

    this.messagingSystem.unsubscribe(
      'ServiceMessenger:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messagingSystem.unsubscribe(
      'ServiceMessenger:unresponsive',
      this._onUnresponsiveSnap,
    );
  }

  /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   */
  async getRpcMessageHandler(
    snapId: SnapId,
  ): Promise<
    (origin: string, request: Record<string, unknown>) => Promise<unknown>
  > {
    const existingHandler = this._rpcHandlerMap.get(snapId);
    if (existingHandler) {
      return existingHandler;
    }

    const rpcHandler = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      let handler = await this._getRpcMessageHandler(snapId);

      if (this.state.snaps[snapId].enabled === false) {
        throw new Error(`Snap "${snapId}" is disabled.`);
      }

      if (this.state.snaps[snapId].status === SnapStatus.installing) {
        throw new Error(`Snap "${snapId}" has not been started yet.`);
      }

      if (!handler && this.isRunning(snapId) === false) {
        // cold start
        await this.startSnap(snapId);
        handler = await this._getRpcMessageHandler(snapId);
      }

      if (!handler) {
        throw new Error(
          `Snap execution service returned no RPC handler for running snap "${snapId}".`,
        );
      }

      this._recordSnapRpcRequest(snapId);

      // Handle max request time
      let timeout: number | undefined;

      const timeoutPromise = new Promise((_resolve, reject) => {
        timeout = setTimeout(() => {
          this._stopSnap(snapId);
          reject(new Error('The request timed out.'));
        }, this._maxRequestTime) as unknown as number;
      });

      // This will either get the result or reject due to the timeout.
      const result = await Promise.race([
        handler(origin, request),
        timeoutPromise,
      ]);

      clearTimeout(timeout);
      return result;
    };

    this._rpcHandlerMap.set(snapId, rpcHandler);
    return rpcHandler;
  }

  private _recordSnapRpcRequest(snapId: SnapId) {
    this._lastRequestMap.set(snapId, Date.now());
  }
}

function isValidSnapVersion(version: unknown): version is string {
  return Boolean(
    typeof version === 'string' &&
      (version === 'latest' || isValidSemver(version)),
  );
}
