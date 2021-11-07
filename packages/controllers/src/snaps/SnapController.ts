import { ethErrors, serializeError } from 'eth-rpc-errors';
import type { Patch } from 'immer';
import { IOcapLdCapability } from 'rpc-cap/dist/src/@types/ocap-ld';
import {
  BaseControllerV2 as BaseController,
  RestrictedControllerMessenger,
} from '@metamask/controllers';
import { Json } from 'json-rpc-engine';
import {
  ErrorJSON,
  ErrorMessageEvent,
  SnapData,
  SnapName,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { nanoid } from 'nanoid';
import {
  GetRpcMessageHandler,
  ExecuteSnap,
  TerminateAll,
  TerminateSnap,
} from '../services/ExecutionEnvironmentService';
import { timeSince } from '../utils';
import { INLINE_SNAPS } from './inlineSnaps';

export const controllerName = 'SnapController';

export const SNAP_PREFIX = 'wallet_snap_';
export const SNAP_PREFIX_REGEX = new RegExp(`^${SNAP_PREFIX}`, 'u');
const SERIALIZABLE_SNAP_PROPERTIES = new Set([
  'initialPermissions',
  'name',
  'permissionName',
]);

type RequestedSnapPermissions = {
  [permission: string]: Json;
};

export type SerializableSnap = {
  initialPermissions: RequestedSnapPermissions;
  name: string;
  permissionName: string;
  version: string;
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
export type InstallSnapsResult = {
  [snapName: string]: ProcessSnapReturnType;
};

// Types that probably should be defined elsewhere in prod
type RemoveAllPermissionsFunction = (snapIds: string[]) => void;
type CloseAllConnectionsFunction = (domain: string) => void;
type RequestPermissionsFunction = (
  domain: string,
  requestedPermissions: RequestedSnapPermissions,
) => Promise<IOcapLdCapability[]>;
type HasPermissionFunction = (
  domain: string,
  permissionName: string,
) => boolean;
type GetPermissionsFunction = (domain: string) => IOcapLdCapability[];
type SnapId = string;
type StoredSnaps = Record<SnapId, Snap>;

export type SnapControllerState = {
  inlineSnapIsRunning: boolean;
  snaps: StoredSnaps;
  snapStates: {
    [SnapId: string]: Json;
  };
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

export type SnapControllerEvents = SnapStateChange;

// TODO: Use ControllerMessenger events
type SnapControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapControllerActions,
  SnapControllerEvents | ErrorMessageEvent | UnresponsiveMessageEvent,
  never,
  ErrorMessageEvent['type'] | UnresponsiveMessageEvent['type']
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
  idleTimeCheckInterval?: number;
};

type AddSnapBase = {
  name: string;
};

type AddSnapByFetchingArgs = AddSnapBase & {
  manifestUrl: string;
};

// The parts of a snap package.json file that we care about
type SnapManifest = {
  version: string;
  web3Wallet: { initialPermissions: RequestedSnapPermissions };
};

type AddSnapDirectlyArgs = AddSnapBase & {
  manifest: SnapManifest;
  sourceCode: string;
};

type AddSnapArgs = AddSnapByFetchingArgs | AddSnapDirectlyArgs;

const defaultState: SnapControllerState = {
  snapErrors: {},
  inlineSnapIsRunning: false,
  snaps: {},
  snapStates: {},
};

export enum SnapStatus {
  idle = 'idle',
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
  initial: SnapStatus.idle,
  states: {
    [SnapStatus.idle]: {
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

  private _idleTimeCheckInterval: number;

  private _timeoutForLastRequestStatus?: NodeJS.Timeout;

  private _lastRequestMap: Map<SnapName, number>;

  private _rpcHandlerMap: Map<
    SnapName,
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
  }: SnapControllerArgs) {
    super({
      messenger,
      metadata: {
        snapErrors: {
          persist: false,
          anonymous: false,
        },
        inlineSnapIsRunning: {
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
                  status: snapStatusStateMachineConfig.initial,
                };
              })
              .reduce((memo: Record<string, Snap>, snap) => {
                memo[snap.name] = snap;
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
    this._idleTimeCheckInterval = idleTimeCheckInterval;
    this._pollForLastRequestStatus();
    this._lastRequestMap = new Map();
    this._rpcHandlerMap = new Map();
  }

  _pollForLastRequestStatus() {
    this._timeoutForLastRequestStatus = setTimeout(async () => {
      this._stopSnapsLastRequestPastMax();
      this._pollForLastRequestStatus();
    }, this._idleTimeCheckInterval);
  }

  _stopSnapsLastRequestPastMax() {
    this._lastRequestMap.forEach(async (timestamp, snapName) => {
      if (this._maxIdleTime && timeSince(timestamp) > this._maxIdleTime) {
        this.stopSnap(snapName);
      }
    });
  }

  _onUnresponsiveSnap(snapName: string) {
    this._transitionSnapState(snapName, SnapStatusEvent.crash);
    this._stopSnap(snapName, false);
    this.addSnapError({
      code: -32001, // just made this code up
      message: 'Snap Unresponsive',
      data: {
        snapName,
      },
    });
  }

  _onUnhandledSnapError(snapName: string, error: ErrorJSON) {
    this._transitionSnapState(snapName, SnapStatusEvent.crash);
    this._stopSnap(snapName, false);
    this.addSnapError(error);
  }

  /**
   * Transitions between states using `snapStatusStateMachineConfig` as the template to figure out the next state.
   * This transition function uses a very minimal subset of XState conventions:
   * - supports initial state
   * - .on supports raw event target string
   * - .on supports {target, cond} object
   * - the arguments for `cond` is the `SerializedSnap` instead of Xstate convention of `(event, context) => boolean`
   * @param snapName the name of the snap to transition
   * @param event the event enum to use to transition
   */
  _transitionSnapState(snapName: string, event: SnapStatusEvent) {
    const snapStatus = this.state.snaps[snapName].status;
    let nextStatus =
      (snapStatusStateMachineConfig.states[snapStatus].on as any)[event] ??
      snapStatus;
    if (nextStatus.cond) {
      const cond = nextStatus.cond(this.state.snaps[snapName]);
      if (cond === false) {
        throw new Error(
          `Condition failed for state transition "${snapName}" with event "${event}".`,
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
      state.snaps[snapName].status = nextStatus;
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
      Object.values(snaps).map(async ({ name: snapName, sourceCode }) => {
        console.log(`Starting: ${snapName}`);

        try {
          await this._startSnap({
            snapName,
            sourceCode,
          });
        } catch (err) {
          console.warn(`Failed to start "${snapName}", deleting it.`, err);
          // Clean up failed snaps:
          this.removeSnap(snapName);
        }
      }),
    );
  }

  /**
   * Starts the given snap. Throws an error if no such snap exists
   * or if it is already running.
   *
   * @param snapName - The name of the snap to start.
   */
  async startSnap(snapName: string): Promise<void> {
    const snap = this.get(snapName);
    if (!snap) {
      throw new Error(`Snap "${snapName}" not found.`);
    }

    if (this.state.snaps[snapName].enabled === false) {
      throw new Error(`Snap "${snapName}" is disabled.`);
    }

    await this._startSnap({
      snapName,
      sourceCode: snap.sourceCode,
    });
  }

  /**
   * Enables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapName - The name of the snap to enable.
   */
  enableSnap(snapName: string): void {
    this.update((state: any) => {
      state.snaps[snapName].enabled = true;
    });
  }

  /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapName - The name of the snap to disable.
   */
  disableSnap(snapName: string): void {
    this.stopSnap(snapName);
    this.update((state: any) => {
      state.snaps[snapName].enabled = false;
    });
  }

  /**
   * Stops the given snap. Throws an error if no such snap exists
   * or if it is already stopped.
   *
   * @param snapName - The name of the snap to stop.
   */
  stopSnap(snapName: string): void {
    const snap = this.get(snapName);
    if (!snap) {
      throw new Error(`Snap "${snapName}" not found.`);
    }

    if (!this.isRunning(snapName)) {
      throw new Error(`Snap "${snapName}" already stopped.`);
    }

    this._stopSnap(snapName);
    console.log(`Snap "${snapName}" stopped.`);
  }

  /**
   * Stops the given snap, removes all hooks, closes all connections, and
   * terminates its worker.
   *
   * @param snapName - The name of the snap to stop.
   * @param setNotRunning - Whether to mark the snap as not running.
   * Should only be set to false if the snap is about to be deleted.
   */
  private _stopSnap(snapName: string, setNotRunning = true): void {
    this._closeAllConnections(snapName);
    this._terminateSnap(snapName);
    if (setNotRunning) {
      this._transitionSnapState(snapName, SnapStatusEvent.stop);
    }
  }

  /**
   * Returns whether the given snap is running.
   * Throws an error if the snap doesn't exist.
   *
   * @param snapName - The name of the snap to check.
   */
  isRunning(snapName: string): boolean {
    const snap = this.get(snapName);
    if (!snap) {
      throw new Error(`Snap "${snapName}" not found.`);
    }

    return snap.status === SnapStatus.running;
  }

  /**
   * Returns whether the given snap has been added to state.
   *
   * @param snapName - The name of the snap to check for.
   */
  has(snapName: string): boolean {
    return snapName in this.state.snaps;
  }

  /**
   * Gets the snap with the given name if it exists, including all data.
   * This should not be used if the snap is to be serializable, as e.g.
   * the snap sourceCode may be quite large.
   *
   * @param snapName - The name of the snap to get.
   */
  get(snapName: string) {
    return this.state.snaps[snapName];
  }

  /**
   * Gets the snap with the given name if it exists, excluding any
   * non-serializable or expensive-to-serialize data.
   *
   * @param snapName - The name of the snap to get.
   */
  getSerializable(snapName: string): SerializableSnap | null {
    const snap = this.get(snapName);

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
   * Updates the own state of the snap with the given name.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapName - The name of the snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   */
  async updateSnapState(snapName: string, newSnapState: Json): Promise<void> {
    this.update((state: any) => {
      state.snapStates[snapName] = newSnapState;
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
   * Gets the own state of the snap with the given name.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapName - The name of the snap whose state to get.
   */
  async getSnapState(snapName: string): Promise<Json> {
    return this.state.snapStates[snapName];
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all snap providers.
   */
  clearState() {
    const snapNames = Object.keys(this.state.snaps);
    snapNames.forEach((snapName) => {
      this._closeAllConnections(snapName);
    });
    this._terminateAllSnaps();
    this._removeAllPermissionsFor(snapNames);
    this.update((state: any) => {
      state.inlineSnapIsRunning = false;
      state.snaps = {};
      state.snapStates = {};
    });
  }

  /**
   * Removes the given snap from state, and clears all associated handlers
   * and listeners.
   *
   * @param snapName - The name of the snap.
   */
  removeSnap(snapName: string): void {
    this.removeSnaps([snapName]);
  }

  /**
   * Stops the given snaps, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param {Array<string>} snapName - The name of the snaps.
   */
  removeSnaps(snapNames: string[]): void {
    if (!Array.isArray(snapNames)) {
      throw new Error('Expected array of snap names.');
    }

    this.update((state: any) => {
      snapNames.forEach((snapName) => {
        this._stopSnap(snapName, false);
        this._rpcHandlerMap.delete(snapName);
        delete state.snaps[snapName];
        delete state.snapStates[snapName];
      });
    });

    this._removeAllPermissionsFor(snapNames);
  }

  /**
   * Gets the serialized permitted snaps of the given origin, if any.
   * @param origin - The origin whose permitted snaps to retrieve.
   */
  getPermittedSnaps(origin: string): InstallSnapsResult {
    return this._getPermissions(origin).reduce((permittedSnaps, perm) => {
      if (perm.parentCapability.startsWith(SNAP_PREFIX)) {
        const snapName = perm.parentCapability.replace(SNAP_PREFIX_REGEX, '');
        const snap = this.getSerializable(snapName);

        permittedSnaps[snapName] = snap || {
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
   * @returns An object of snap names and snap objects, or errors if a
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
      Object.keys(requestedSnaps).map(async (snapName) => {
        const permissionName = SNAP_PREFIX + snapName;

        if (this._hasPermission(origin, permissionName)) {
          // attempt to install and run the snap, storing any errors that
          // occur during the process
          result[snapName] = {
            ...(await this.processRequestedSnap(snapName)),
          };
        } else {
          // only allow the installation of permitted snaps
          result[snapName] = {
            error: ethErrors.provider.unauthorized(
              `Not authorized to install snap '${snapName}'. Request the permission for the snap before attempting to install it.`,
            ),
          };
        }
      }),
    );
    return result;
  }

  /**
   * Adds, authorizes, and runs the given snap with a snap provider.
   * Results from this method should be efficiently serializable.
   *
   * @param - snapName - The name of the snap.
   * @returns The resulting snap object, or an error if something went wrong.
   */
  async processRequestedSnap(snapName: string): Promise<ProcessSnapReturnType> {
    // If the snap is already installed, just return it
    const snap = this.get(snapName);
    if (snap) {
      return this.getSerializable(snapName) as SerializableSnap;
    }

    try {
      const { sourceCode } = await this.add({
        name: snapName,
        manifestUrl: snapName,
      });

      await this.authorize(snapName);

      await this._startSnap({
        snapName,
        sourceCode,
      });

      return this.getSerializable(snapName) as SerializableSnap;
    } catch (err) {
      console.error(`Error when adding snap.`, err);
      return { error: serializeError(err) };
    }
  }

  /**
   * Returns a promise representing the complete installation of the requested snap.
   * If the snap is already being installed, the previously pending promise will be returned.
   *
   * @param snapName - The name of the snap.
   * @param args - Object containing either the URL of the snap's manifest,
   * or the snap's manifest and source code.
   * @returns The resulting snap object.
   */
  add(args: AddSnapArgs): Promise<Snap> {
    const { name: snapName } = args;
    if (!snapName || typeof snapName !== 'string') {
      throw new Error(`Invalid snap name: ${snapName}`);
    }

    if (
      !args ||
      (!('manifestUrl' in args) &&
        (!('manifest' in args) || !('sourceCode' in args)))
    ) {
      throw new Error(`Invalid add snap args for snap "${snapName}".`);
    }

    if (!this._snapsBeingAdded.has(snapName)) {
      console.log(`Adding snap: ${snapName}`);
      this._snapsBeingAdded.set(snapName, this._add(args));
    }

    return this._snapsBeingAdded.get(snapName) as Promise<Snap>;
  }

  private async _startSnap(snapData: SnapData) {
    const { snapName } = snapData;
    if (this.isRunning(snapName)) {
      throw new Error(`Snap "${snapName}" is already started.`);
    }

    const result = await this._executeSnap(snapData);
    this._transitionSnapState(snapName, SnapStatusEvent.start);
    return result;
  }

  /**
   * Internal method. See the "add" method.
   *
   * @param snapName - The name of the snap.
   * @param args - The add snap args.
   * @returns The resulting snap object.
   */
  private async _add(args: AddSnapArgs): Promise<Snap> {
    const { name: snapName } = args;

    let manifest: SnapManifest, sourceCode: string;
    if ('manifestUrl' in args) {
      const _sourceUrl = args.manifestUrl || snapName;
      [manifest, sourceCode] = await this._fetchSnap(snapName, _sourceUrl);
    } else {
      manifest = args.manifest;
      sourceCode = args.sourceCode;
    }

    if (typeof sourceCode !== 'string' || sourceCode.length === 0) {
      throw new Error(`Invalid source code for snap "${snapName}".`);
    }

    const initialPermissions = manifest?.web3Wallet?.initialPermissions;
    if (
      !initialPermissions ||
      typeof initialPermissions !== 'object' ||
      Array.isArray(initialPermissions)
    ) {
      throw new Error(`Invalid initial permissions for snap "${snapName}".`);
    }

    let snap: Snap = {
      initialPermissions,
      name: snapName,
      permissionName: SNAP_PREFIX + snapName, // so we can easily correlate them
      sourceCode,
      version: manifest.version,
      enabled: true,
      status: snapStatusStateMachineConfig.initial,
    };

    const snapsState = this.state.snaps;

    // restore relevant snap state if it exists
    if (snapsState[snapName]) {
      snap = { ...snapsState[snapName], ...snap };
    }

    // store the snap back in state
    this.update((state: any) => {
      state.snaps[snapName] = snap;
    });

    return snap;
  }

  /**
   * Fetches the manifest and source code of a snap.
   *
   * @param name - The name of the snap.
   * @param manifestUrl - The URL of the snap's manifest file.
   * @returns An array of the snap manifest object and the snap source code.
   */
  private async _fetchSnap(
    snapName: string,
    manifestUrl: string,
  ): Promise<[SnapManifest, string]> {
    try {
      console.log(`Fetching snap manifest from: ${manifestUrl}`);
      const snapSource = await fetch(manifestUrl);
      const manifest = await snapSource.json();

      console.log(`Destructuring snap: `, manifest);
      const {
        web3Wallet: { bundle },
      } = manifest;

      console.log(`Fetching snap source code from: ${bundle.url}`);
      const snapBundle = await fetch(bundle.url);
      const sourceCode = await snapBundle.text();

      return [manifest, sourceCode];
    } catch (err) {
      throw new Error(
        `Problem fetching snap "${snapName}": ${(err as Error).message}`,
      );
    }
  }

  /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * @param snapName - The name of the snap.
   * @returns The snap's approvedPermissions.
   */
  async authorize(snapName: string): Promise<string[]> {
    console.log(`Authorizing snap: ${snapName}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapName];
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
        snapName,
        initialPermissions,
      );
      return approvedPermissions.map((perm) => perm.parentCapability);
    } finally {
      this._snapsBeingAdded.delete(snapName);
    }
  }

  /**
   * Test method.
   */
  runInlineSnap(inlineSnapName: keyof typeof INLINE_SNAPS = 'IDLE') {
    this._startSnap({
      snapName: 'inlineSnap',
      sourceCode: INLINE_SNAPS[inlineSnapName],
    });

    this.update((state: any) => {
      state.inlineSnapIsRunning = true;
    });
  }

  /**
   * Test method.
   */
  removeInlineSnap() {
    this.update((state: any) => {
      state.inlineSnapIsRunning = false;
    });
    this.removeSnap('inlineSnap');
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
   * @param snapName - The name of the snap whose message handler to get.
   */
  async getRpcMessageHandler(
    snapName: string,
  ): Promise<
    (origin: string, request: Record<string, unknown>) => Promise<unknown>
  > {
    const existingHandler = this._rpcHandlerMap.get(snapName);
    if (existingHandler) {
      return existingHandler;
    }

    const rpcHandler = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      let handler = await this._getRpcMessageHandler(snapName);

      if (this.state.snaps[snapName].enabled === false) {
        throw new Error(`Snap "${snapName}" is disabled.`);
      }

      if (this.state.snaps[snapName].status === SnapStatus.idle) {
        throw new Error(`Snap "${snapName}" has not been started yet.`);
      }

      if (!handler && this.isRunning(snapName) === false) {
        // cold start
        await this.startSnap(snapName);
        handler = await this._getRpcMessageHandler(snapName);
      }

      if (!handler) {
        throw new Error(
          `Snap execution service returned no RPC handler for running snap "${snapName}".`,
        );
      }

      this._recordSnapRpcRequest(snapName);
      return handler(origin, request);
    };

    this._rpcHandlerMap.set(snapName, rpcHandler);
    return rpcHandler;
  }

  private _recordSnapRpcRequest(snapName: string) {
    this._lastRequestMap.set(snapName, Date.now());
  }
}
