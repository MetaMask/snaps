import {
  BaseControllerV2 as BaseController,
  GetEndowments,
  GetPermissions,
  HasPermission,
  HasPermissions,
  RequestPermissions,
  RestrictedControllerMessenger,
  RevokeAllPermissions,
  RevokePermissions,
} from '@metamask/controllers';
import {
  ErrorJSON,
  ErrorMessageEvent,
  SnapData,
  SnapId,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { errorCodes, ethErrors, serializeError } from 'eth-rpc-errors';
import { SerializedEthereumRpcError } from 'eth-rpc-errors/dist/classes';
import type { Patch } from 'immer';
import { Json } from 'json-rpc-engine';
import { nanoid } from 'nanoid';
import { gt as gtSemver, satisfies as satisfiesSemver } from 'semver';
import { assertExhaustive } from '..';
import {
  ExecuteSnap,
  GetRpcMessageHandler,
  TerminateAll,
  TerminateSnap,
} from '../services/ExecutionService';
import { isNonEmptyArray, setDiff, timeSince } from '../utils';
import { DEFAULT_ENDOWMENTS } from './default-endowments';
import { SnapManifest, validateSnapJsonFile } from './json-schemas';
import {
  DEFAULT_REQUESTED_SNAP_VERSION,
  fetchContent,
  fetchNpmSnap,
  getSnapPrefix,
  isValidSnapVersionRange,
  LOCALHOST_HOSTNAMES,
  NpmSnapFileNames,
  resolveVersion,
  SnapIdPrefixes,
  ValidatedSnapId,
  validateSnapShasum,
} from './utils';

export const controllerName = 'SnapController';

export const SNAP_PREFIX = 'wallet_snap_';
export const SNAP_PREFIX_REGEX = new RegExp(`^${SNAP_PREFIX}`, 'u');

type TruncatedSnapFields =
  | 'id'
  | 'initialPermissions'
  | 'permissionName'
  | 'version';

const TRUNCATED_SNAP_PROPERTIES = new Set<TruncatedSnapFields>([
  'initialPermissions',
  'id',
  'permissionName',
  'version',
]);

type RequestedSnapPermissions = {
  [permission: string]: Record<string, Json>;
};

/**
 * A Snap as it exists in {@link SnapController} state.
 */
export type Snap = {
  /**
   * Whether the Snap is enabled, which determines if it can be started.
   */
  enabled: boolean;

  /**
   * The ID of the Snap.
   */
  id: SnapId;

  /**
   * The initial permissions of the Snap, which will be requested when it is
   * installed.
   */
  initialPermissions: RequestedSnapPermissions;

  /**
   * The Snap's manifest file.
   */
  manifest: SnapManifest;

  /**
   * The name of the permission used to invoke the Snap.
   */
  permissionName: string;

  /**
   * The source code of the Snap.
   */
  sourceCode: string;

  /**
   * The current status of the Snap, e.g. whether it's running or stopped.
   */
  status: SnapStatus;

  /**
   * The version of the Snap.
   */
  version: string;

  /**
   * The version history of the Snap.
   * Can be used to derive when the Snap was installed, when it was updated to a certain version and who requested the change.
   */
  versionHistory: VersionHistory[];
};

export type VersionHistory = {
  origin: string;
  version: string;
  // Unix timestamp
  date: number;
};

/**
 * A wrapper type for any data stored during runtime of Snaps.
 * It is not persisted in state as it contains non-serializable data and is only relevant for the current session.
 */
export interface SnapRuntimeData {
  /**
   * A promise that resolves when the Snap has finished installing
   */
  installPromise: null | Promise<Snap>;

  /**
   * A Unix timestamp for the last time the Snap received an RPC request
   */
  lastRequest: null | number;

  /**
   * RPC handler designated for the Snap
   */
  rpcHandler:
    | null
    | ((origin: string, request: Record<string, unknown>) => Promise<unknown>);
}

/**
 * A {@link Snap} object with the fields that are relevant to an external
 * caller.
 */
export type TruncatedSnap = Pick<Snap, TruncatedSnapFields>;

export type SnapError = {
  message: string;
  code: number;
  data?: Json;
};

/**
 * The return type of {@link SnapController._fetchSnap} and its sibling methods.
 */
type FetchSnapResult = {
  /**
   * The manifest of the fetched Snap.
   */
  manifest: SnapManifest;

  /**
   * The source code of the fetched Snap.
   */
  sourceCode: string;

  /**
   * The raw XML content of the Snap's SVG icon, if any.
   */
  svgIcon?: string;
};

export type ProcessSnapResult =
  | TruncatedSnap
  | { error: SerializedEthereumRpcError };
export type InstallSnapsResult = Record<SnapId, ProcessSnapResult>;

// Types that probably should be defined elsewhere in prod
type CloseAllConnectionsFunction = (origin: string) => void;
type StoredSnaps = Record<SnapId, Snap>;

export type SnapControllerState = {
  snaps: StoredSnaps;
  snapStates: Record<SnapId, Json>;
  snapErrors: {
    [internalID: string]: SnapError & { internalID: string };
  };
};

// Controller Messenger Actions

/**
 * Adds the specified Snap to state. Used during installation.
 */
export type AddSnap = {
  type: `${typeof controllerName}:add`;
  handler: SnapController['add'];
};

/**
 * Gets the specified Snap from state.
 */
export type GetSnap = {
  type: `${typeof controllerName}:get`;
  handler: SnapController['get'];
};

/**
 * Gets the specified Snap's JSON-RPC message handler function.
 */
export type GetSnapRpcMessageHandler = {
  type: `${typeof controllerName}:getRpcMessageHandler`;
  handler: SnapController['getRpcMessageHandler'];
};

/**
 * Gets the specified Snap's persisted state.
 */
export type GetSnapState = {
  type: `${typeof controllerName}:getSnapState`;
  handler: SnapController['getSnapState'];
};

/**
 * Checks if the specified snap exists in state.
 */
export type HasSnap = {
  type: `${typeof controllerName}:has`;
  handler: SnapController['has'];
};

/**
 * Updates the specified Snap's persisted state.
 */
export type UpdateSnapState = {
  type: `${typeof controllerName}:updateSnapState`;
  handler: SnapController['updateSnapState'];
};

export type SnapControllerActions =
  | AddSnap
  | GetSnap
  | GetSnapRpcMessageHandler
  | GetSnapState
  | HasSnap
  | UpdateSnapState;

// Controller Messenger Events

export type SnapStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [SnapControllerState, Patch[]];
};

/**
 * Emitted when a Snap has been added to state during installation.
 */
export type SnapAdded = {
  type: `${typeof controllerName}:snapAdded`;
  payload: [snapId: string, snap: Snap, svgIcon: string | undefined];
};

/**
 * Emitted when a Snap has been started after being added and authorized during
 * installation.
 */
export type SnapInstalled = {
  type: `${typeof controllerName}:snapInstalled`;
  payload: [snapId: string];
};

/**
 * Emitted when a Snap is removed.
 */
export type SnapRemoved = {
  type: `${typeof controllerName}:snapRemoved`;
  payload: [snapId: string];
};

/**
 * Emitted when a Snap is updated
 */
export type SnapUpdated = {
  type: `${typeof controllerName}:snapUpdated`;
  payload: [snapId: string, newVersion: string, oldVersion: string];
};

export type SnapControllerEvents =
  | SnapAdded
  | SnapInstalled
  | SnapRemoved
  | SnapStateChange
  | SnapUpdated;

export type AllowedActions =
  | GetEndowments
  | GetPermissions
  | HasPermission
  | HasPermissions
  | RevokePermissions
  | RevokeAllPermissions
  | RequestPermissions;

export type AllowedEvents = ErrorMessageEvent | UnresponsiveMessageEvent;

type SnapControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapControllerActions | AllowedActions,
  SnapControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

type SnapControllerArgs = {
  closeAllConnections: CloseAllConnectionsFunction;
  endowmentPermissionNames: string[];
  executeSnap: ExecuteSnap;
  getRpcMessageHandler: GetRpcMessageHandler;
  messenger: SnapControllerMessenger;
  state?: SnapControllerState;
  terminateAllSnaps: TerminateAll;
  terminateSnap: TerminateSnap;
  idleTimeCheckInterval?: number;
  maxIdleTime?: number;
  maxRequestTime?: number;
  npmRegistryUrl?: string;
};

type AddSnapBase = {
  id: SnapId;
  origin: string;
  versionRange?: string;
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
  update = 'update',
}

/**
 * Guard transitioning when the snap is disabled.
 */
const disabledGuard = (serializedSnap: Snap) => {
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
        [SnapStatusEvent.update]: SnapStatus.installing,
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
  private _closeAllConnections: CloseAllConnectionsFunction;

  private _endowmentPermissionNames: string[];

  private _executeSnap: ExecuteSnap;

  private _getRpcMessageHandler: GetRpcMessageHandler;

  private _idleTimeCheckInterval: number;

  private _maxIdleTime: number;

  private _maxRequestTime: number;

  private _snapsRuntimeData: Map<SnapId, SnapRuntimeData>;

  private _terminateAllSnaps: TerminateAll;

  private _terminateSnap: TerminateSnap;

  private _timeoutForLastRequestStatus?: number;

  private _npmRegistryUrl?: string;

  constructor({
    closeAllConnections,
    executeSnap,
    getRpcMessageHandler,
    messenger,
    state,
    terminateAllSnaps,
    terminateSnap,
    endowmentPermissionNames = [],
    npmRegistryUrl,
    idleTimeCheckInterval = 5000,
    maxIdleTime = 30000,
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

    this._closeAllConnections = closeAllConnections;
    this._endowmentPermissionNames = endowmentPermissionNames;
    this._executeSnap = executeSnap;
    this._getRpcMessageHandler = getRpcMessageHandler;
    this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
    this._onUnresponsiveSnap = this._onUnresponsiveSnap.bind(this);
    this._terminateSnap = terminateSnap;
    this._terminateAllSnaps = terminateAllSnaps;

    this._idleTimeCheckInterval = idleTimeCheckInterval;
    this._maxIdleTime = maxIdleTime;
    this._maxRequestTime = maxRequestTime;
    this._pollForLastRequestStatus();
    this._snapsRuntimeData = new Map();
    this._npmRegistryUrl = npmRegistryUrl;

    this.messagingSystem.subscribe(
      'ExecutionService:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messagingSystem.subscribe(
      'ExecutionService:unresponsive',
      this._onUnresponsiveSnap,
    );

    this.registerMessageHandlers();
  }

  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  private registerMessageHandlers(): void {
    this.messagingSystem.registerActionHandler(
      `${controllerName}:add`,
      (...args) => this.add(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:get`,
      (...args) => this.get(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getRpcMessageHandler`,
      (...args) => this.getRpcMessageHandler(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getSnapState`,
      (...args) => this.getSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:has`,
      (...args) => this.has(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateSnapState`,
      (...args) => this.updateSnapState(...args),
    );
  }

  _pollForLastRequestStatus() {
    this._timeoutForLastRequestStatus = setTimeout(async () => {
      this._stopSnapsLastRequestPastMax();
      this._pollForLastRequestStatus();
    }, this._idleTimeCheckInterval) as unknown as number;
  }

  _stopSnapsLastRequestPastMax() {
    this._snapsRuntimeData.forEach(async (runtime, snapId) => {
      if (
        runtime.lastRequest &&
        this._maxIdleTime &&
        timeSince(runtime.lastRequest) > this._maxIdleTime
      ) {
        this.stopSnap(snapId, SnapStatusEvent.stop);
      }
    });
  }

  async _onUnresponsiveSnap(snapId: SnapId) {
    await this.stopSnap(snapId, SnapStatusEvent.crash);
    this.addSnapError({
      // TODO: Standardize error code
      code: errorCodes.rpc.internal,
      message: 'Snap Unresponsive',
      data: {
        snapId,
      },
    });
  }

  async _onUnhandledSnapError(snapId: SnapId, error: ErrorJSON) {
    await this.stopSnap(snapId, SnapStatusEvent.crash);
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
  disableSnap(snapId: SnapId): Promise<void> {
    this.update((state: any) => {
      if (!state.snaps[snapId]) {
        throw new Error(`Snap "${snapId}" not found.`);
      }
      state.snaps[snapId].enabled = false;
    });

    if (this.isRunning(snapId)) {
      return this.stopSnap(snapId, SnapStatusEvent.stop);
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
  public async stopSnap(
    snapId: SnapId,
    statusEvent:
      | SnapStatusEvent.stop
      | SnapStatusEvent.crash = SnapStatusEvent.stop,
  ): Promise<void> {
    const runtime = this._getSnapRuntimeData(snapId);
    if (!runtime) {
      return;
    }

    runtime.lastRequest = null;
    try {
      if (this.isRunning(snapId)) {
        this._closeAllConnections(snapId);
        await this._terminateSnap(snapId);
      }
    } finally {
      if (this.isRunning(snapId)) {
        this._transitionSnapState(snapId, statusEvent);
      }
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
    return Boolean(this.get(snapId));
  }

  /**
   * Gets the snap with the given id if it exists, including all data.
   * This should not be used if the snap is to be serializable, as e.g.
   * the snap sourceCode may be quite large.
   *
   * @param snapId - The id of the Snap to get.
   */
  get(snapId: SnapId): Snap | undefined {
    return this.state.snaps[snapId];
  }

  /**
   * Gets the snap with the given id if it exists, excluding any
   * non-serializable or expensive-to-serialize data.
   *
   * @param snapId - The id of the Snap to get.
   */
  getTruncated(snapId: SnapId): TruncatedSnap | null {
    const snap = this.get(snapId);

    return snap
      ? (Object.keys(snap).reduce((serialized, key) => {
          if (TRUNCATED_SNAP_PROPERTIES.has(key as any)) {
            serialized[key as keyof TruncatedSnap] = snap[
              key as keyof TruncatedSnap
            ] as any;
          }

          return serialized;
        }, {} as Partial<TruncatedSnap>) as TruncatedSnap)
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
  addSnapError(snapError: SnapError): void {
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
    return this.state.snapStates[snapId] ?? null;
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
    snapIds.forEach(this.revokeAllSnapPermissions);

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
  async removeSnap(snapId: SnapId): Promise<void> {
    return this.removeSnaps([snapId]);
  }

  /**
   * Stops the given snaps, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param snapIds - The ids of the Snaps.
   */
  async removeSnaps(snapIds: string[]): Promise<void> {
    if (!Array.isArray(snapIds)) {
      throw new Error('Expected array of snap ids.');
    }

    await Promise.all(
      snapIds.map(async (snapId) => {
        // Disable the snap and revoke all of its permissions before deleting
        // it. This ensures that the snap will not be restarted or otherwise
        // affect the host environment while we are deleting it.
        await this.disableSnap(snapId);
        this.revokeAllSnapPermissions(snapId);

        this._snapsRuntimeData.delete(snapId);

        this.update((state: any) => {
          delete state.snaps[snapId];
          delete state.snapStates[snapId];
        });

        this.messagingSystem.publish(`SnapController:snapRemoved`, snapId);
      }),
    );
  }

  /**
   * Safely revokes all permissions granted to a Snap.
   *
   * @param snapId - The snap ID.
   */
  private revokeAllSnapPermissions(snapId: string): void {
    if (
      this.messagingSystem.call('PermissionController:hasPermissions', snapId)
    ) {
      this.messagingSystem.call(
        'PermissionController:revokeAllPermissions',
        snapId,
      );
    }
  }

  /**
   * Gets the serialized permitted snaps of the given origin, if any.
   * @param origin - The origin whose permitted snaps to retrieve.
   */
  getPermittedSnaps(origin: string): InstallSnapsResult {
    return Object.values(
      this.messagingSystem.call(
        'PermissionController:getPermissions',
        origin,
      ) ?? {},
    ).reduce((permittedSnaps, perm) => {
      if (perm.parentCapability.startsWith(SNAP_PREFIX)) {
        const snapId = perm.parentCapability.replace(SNAP_PREFIX_REGEX, '');
        const snap = this.getTruncated(snapId);

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

    await Promise.all(
      Object.entries(requestedSnaps).map(
        async ([snapId, { version: rawVersion }]) => {
          const version = resolveVersion(rawVersion);
          const permissionName = SNAP_PREFIX + snapId;

          if (!isValidSnapVersionRange(version)) {
            result[snapId] = {
              error: ethErrors.rpc.invalidParams(
                `The "version" field must be a valid SemVer version range if specified. Received: "${version}".`,
              ),
            };
            return;
          }

          if (
            this.messagingSystem.call(
              'PermissionController:hasPermission',
              origin,
              permissionName,
            )
          ) {
            // Attempt to install and run the snap, storing any errors that
            // occur during the process.
            result[snapId] = {
              ...(await this.processRequestedSnap(origin, snapId, version)),
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
   * @param origin - The origin requesting the snap.
   * @param snapId - The id of the snap.
   * @param version - The version of the snap to install.
   * @returns The resulting snap object, or an error if something went wrong.
   */
  private async processRequestedSnap(
    origin: string,
    snapId: SnapId,
    version: string,
  ): Promise<ProcessSnapResult> {
    const existingSnap = this.getTruncated(snapId);
    // For devX we always re-install local snaps.
    if (existingSnap && !snapId.startsWith(SnapIdPrefixes.local)) {
      if (satisfiesSemver(existingSnap.version, version)) {
        return existingSnap;
      }
      return {
        error: ethErrors.rpc.invalidParams(
          `Version mismatch with already installed snap. ${snapId}@${existingSnap.version} doesn't satisfy requested version ${version}`,
        ),
      };
    }

    // Existing snaps must be stopped before overwriting
    if (existingSnap && this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvent.stop);
    }

    try {
      const { sourceCode } = await this.add({
        origin,
        id: snapId,
        versionRange: version,
      });

      await this.authorize(snapId);

      await this._startSnap({
        snapId,
        sourceCode,
      });

      this.messagingSystem.publish(`SnapController:snapInstalled`, snapId);
      return this.getTruncated(snapId) as TruncatedSnap;
    } catch (err) {
      console.error(`Error when adding snap.`, err);
      if (this.has(snapId)) {
        this.removeSnap(snapId);
      }

      return { error: serializeError(err) };
    }
  }

  /**
   * Updates, re-authorizes and then restarts given snap.
   *
   * @param snapId The id of the Snap to be updated
   * @param newVersionRange A semver version range in which the maximum version will be chosen
   * @returns @type {TruncatedSnap} if updated, @type {null} otherwise
   */
  async updateSnap(
    origin: string,
    snapId: ValidatedSnapId,
    newVersionRange: string = DEFAULT_REQUESTED_SNAP_VERSION,
  ): Promise<TruncatedSnap | null> {
    const snap = this.get(snapId);
    if (snap === undefined) {
      throw new Error(
        `Could not find snap ${snapId}. Install the snap before attempting to update it.`,
      );
    }

    if (!isValidSnapVersionRange(newVersionRange)) {
      throw new Error(
        `Received invalid Snap version range: "${newVersionRange}".`,
      );
    }

    const newSnap = await this._fetchSnap(snapId, newVersionRange);
    if (!gtSemver(newSnap.manifest.version, snap.version)) {
      console.warn(
        `Tried updating snap "${snapId}" within "${newVersionRange}" version range, but newer version "${snap.version}" is already installed`,
      );
      return null;
    }

    if (this.isRunning(snapId)) {
      this.stopSnap(snapId, SnapStatusEvent.stop);
    }

    this._transitionSnapState(snapId, SnapStatusEvent.update);

    await this._set({
      origin,
      id: snapId,
      manifest: newSnap.manifest,
      sourceCode: newSnap.sourceCode,
      versionRange: newVersionRange,
    });

    await this.authorize(snapId);

    await this._startSnap({ snapId, sourceCode: newSnap.sourceCode });

    this.messagingSystem.publish(
      'SnapController:snapUpdated',
      snapId,
      newSnap.manifest.version,
      snap.version,
    );

    return this.getTruncated(snapId);
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
  async add(args: AddSnapArgs): Promise<Snap> {
    const { id: _snapId } = args;
    this.validateSnapId(_snapId);
    const snapId: ValidatedSnapId = _snapId as ValidatedSnapId;

    if (
      !args ||
      !('origin' in args) ||
      !('id' in args) ||
      (!('manifest' in args) && 'sourceCode' in args) ||
      ('manifest' in args && !('sourceCode' in args))
    ) {
      throw new Error(`Invalid add snap args for snap "${snapId}".`);
    }

    const runtime = this._getSnapRuntimeData(snapId);
    if (!runtime.installPromise) {
      console.log(`Adding snap: ${snapId}`);
      runtime.installPromise = this._set(args as ValidatedAddSnapArgs);
    }

    try {
      return await runtime.installPromise;
    } catch (err) {
      // Reset promise so users can retry installation in case the problem is temporary
      runtime.installPromise = null;
      throw err;
    }
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

    const result = await this._executeSnap({
      ...snapData,
      endowments: await this._getEndowments(snapId),
    });
    this._transitionSnapState(snapId, SnapStatusEvent.start);
    return result;
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
  private async _getEndowments(snapId: string): Promise<string[]> {
    let allEndowments: string[] = [];

    for (const permissionName of this._endowmentPermissionNames) {
      if (
        this.messagingSystem.call(
          'PermissionController:hasPermission',
          snapId,
          permissionName,
        )
      ) {
        const endowments = await this.messagingSystem.call(
          'PermissionController:getEndowments',
          snapId,
          permissionName,
        );

        if (endowments) {
          // We don't have any guarantees about the type of the endowments
          // value, so we have to guard at runtime.
          if (
            !Array.isArray(endowments) ||
            endowments.some((value) => typeof value !== 'string')
          ) {
            throw new Error('Expected an array of string endowment names.');
          }

          allEndowments = allEndowments.concat(endowments as string[]);
        }
      }
    }

    const dedupedEndowments = [
      ...new Set([...DEFAULT_ENDOWMENTS, ...allEndowments]),
    ];

    if (
      dedupedEndowments.length <
      DEFAULT_ENDOWMENTS.length + allEndowments.length
    ) {
      console.error(
        'Duplicate endowments found. Default endowments should not be requested.',
        allEndowments,
      );
    }
    return dedupedEndowments;
  }

  /**
   * Internal method. See the "add" method.
   *
   * @param args - The add snap args.
   * @returns The resulting snap object.
   */
  private async _set(args: ValidatedAddSnapArgs): Promise<Snap> {
    const {
      id: snapId,
      versionRange = DEFAULT_REQUESTED_SNAP_VERSION,
      origin,
    } = args;

    let manifest: SnapManifest, sourceCode: string, svgIcon: string | undefined;
    if ('manifest' in args) {
      manifest = args.manifest;
      sourceCode = args.sourceCode;
      validateSnapJsonFile(NpmSnapFileNames.Manifest, manifest);
    } else {
      ({ manifest, sourceCode, svgIcon } = await this._fetchSnap(
        snapId,
        versionRange,
      ));
    }

    if (!satisfiesSemver(manifest.version, versionRange)) {
      throw new Error(
        `Version mismatch. Manifest for ${snapId} specifies version ${manifest.version} which doesn't satisfy requested version range ${versionRange}`,
      );
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

    const snapsState = this.state.snaps;

    const existingSnap = snapsState[snapId];

    const { version } = manifest;
    const previousVersionHistory = existingSnap?.versionHistory ?? [];
    const versionHistory = [
      ...previousVersionHistory,
      {
        version,
        date: Date.now(),
        origin,
      },
    ];

    const snap: Snap = {
      // restore relevant snap state if it exists
      ...existingSnap,
      enabled: true,
      id: snapId,
      initialPermissions,
      manifest,
      permissionName: SNAP_PREFIX + snapId, // so we can easily correlate them
      sourceCode,
      status: snapStatusStateMachineConfig.initial,
      version,
      versionHistory,
    };

    // store the snap back in state
    this.update((state: any) => {
      state.snaps[snapId] = snap;
    });

    this.messagingSystem.publish(
      `SnapController:snapAdded`,
      snapId,
      snap,
      svgIcon,
    );
    return snap;
  }

  /**
   * Fetches the manifest and source code of a snap.
   *
   * @param snapId - The id of the Snap.
   * @param versionRange - The SemVer version of the Snap to fetch.
   * @returns A tuple of the Snap manifest object and the Snap source code.
   */
  private async _fetchSnap(
    snapId: ValidatedSnapId,
    versionRange: string = DEFAULT_REQUESTED_SNAP_VERSION,
  ): Promise<FetchSnapResult> {
    try {
      const snapPrefix = getSnapPrefix(snapId);
      switch (snapPrefix) {
        case SnapIdPrefixes.local:
          return this._fetchLocalSnap(snapId.replace(SnapIdPrefixes.local, ''));
        case SnapIdPrefixes.npm:
          return this._fetchNpmSnap(
            snapId.replace(SnapIdPrefixes.npm, ''),
            versionRange,
          );
        /* istanbul ignore next */
        default:
          // This whill fail to compile if the above switch is not fully exhaustive
          return assertExhaustive(snapPrefix);
      }
    } catch (error) {
      throw new Error(
        `Failed to fetch Snap "${snapId}": ${(error as Error).message}`,
      );
    }
  }

  private async _fetchNpmSnap(
    packageName: string,
    versionRange: string,
  ): Promise<FetchSnapResult> {
    if (!isValidSnapVersionRange(versionRange)) {
      throw new Error(
        `Received invalid Snap version range: "${versionRange}".`,
      );
    }

    const { manifest, sourceCode, svgIcon } = await fetchNpmSnap(
      packageName,
      versionRange,
      this._npmRegistryUrl,
    );
    return { manifest, sourceCode, svgIcon };
  }

  /**
   * Fetches the manifest and source code of a local snap.
   *
   * @param localhostUrl - The localhost URL to download from.
   * @returns The validated manifest and the source code.
   */
  private async _fetchLocalSnap(
    localhostUrl: string,
  ): Promise<FetchSnapResult> {
    // Local snaps are mostly used for development purposes. Fetches were cached in the browser and were not requested
    // afterwards which lead to confusing development where old versions of snaps were installed.
    // Thus we disable caching
    const fetchOptions: RequestInit = { cache: 'no-cache' };
    const manifestUrl = new URL(NpmSnapFileNames.Manifest, localhostUrl);
    if (!LOCALHOST_HOSTNAMES.has(manifestUrl.hostname)) {
      throw new Error(
        `Invalid URL: Locally hosted Snaps must be hosted on localhost. Received URL: "${manifestUrl.toString()}"`,
      );
    }

    const _manifest = await (
      await fetchContent(manifestUrl.toString(), fetchOptions)
    ).json();
    validateSnapJsonFile(NpmSnapFileNames.Manifest, _manifest);
    const manifest = _manifest as SnapManifest;

    const {
      source: {
        location: {
          npm: { filePath, iconPath },
        },
      },
    } = manifest;

    const [sourceCode, svgIcon] = await Promise.all([
      (
        await fetchContent(
          new URL(filePath, localhostUrl).toString(),
          fetchOptions,
        )
      ).text(),
      iconPath
        ? (
            await fetchContent(
              new URL(iconPath, localhostUrl).toString(),
              fetchOptions,
            )
          ).text()
        : undefined,
    ]);

    validateSnapShasum(manifest, sourceCode);
    return { manifest, sourceCode, svgIcon };
  }

  /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * @param snapId - The id of the Snap.
   * @returns The snap's approvedPermissions.
   */
  private async authorize(snapId: SnapId): Promise<string[]> {
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
      // If we are re-authorizing after updating a snap, we revoke all unused permissions,
      // and only ask to authorize the new ones.
      const alreadyApprovedPermissions = await this.messagingSystem.call(
        'PermissionController:getPermissions',
        snapId,
      );

      const newPermissions = setDiff(
        initialPermissions,
        alreadyApprovedPermissions ?? {},
      );
      // TODO(ritave): The assumption that these are unused only holds so long as we do not
      //               permit dynamic permission requests.
      const unusedPermissions = Object.keys(
        setDiff(alreadyApprovedPermissions ?? {}, initialPermissions),
      );

      if (isNonEmptyArray(unusedPermissions)) {
        await this.messagingSystem.call(
          'PermissionController:revokePermissions',
          { [origin]: unusedPermissions },
        );
      }

      if (isNonEmptyArray(Object.keys(newPermissions))) {
        const [approvedPermissions] = await this.messagingSystem.call(
          'PermissionController:requestPermissions',
          { origin: snapId },
          newPermissions,
        );
        return Object.values(approvedPermissions).map(
          (perm) => perm.parentCapability,
        );
      }
      return [];
    } finally {
      const runtime = this._getSnapRuntimeData(snapId);
      runtime.installPromise = null;
    }
  }

  destroy() {
    super.destroy();

    if (this._timeoutForLastRequestStatus) {
      clearTimeout(this._timeoutForLastRequestStatus);
    }

    this.messagingSystem.unsubscribe(
      'ExecutionService:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messagingSystem.unsubscribe(
      'ExecutionService:unresponsive',
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
    const runtime = this._getSnapRuntimeData(snapId);
    const existingHandler = runtime?.rpcHandler;
    if (existingHandler) {
      return existingHandler;
    }

    class QueueThing {
      public readonly maxQueue: number;
      private readonly locks: Map<string, number>;
      constructor(maxQueue: number) {
        this.maxQueue = maxQueue;
        this.locks = new Map<string, number>();
      }

      public increment (origin: string) {
        const currentCount = this.locks.get(origin) ?? 0;
        if (currentCount > this.maxQueue) {
          throw new Error('noooooo')
        }
        this.locks.set(origin, currentCount + 1);
      }

      public get (origin: string): number {
        return this.locks.get(origin) ?? 0;
      }
    }

    const locks = new QueueThing(5);
    let startPromise: Promise<void> | null;

    const rpcHandler = async (
      origin: string,
      request: Record<string, unknown>,
    ) => {
      let handler = await this._getRpcMessageHandler(snapId);

      if (this.state.snaps[snapId].enabled === false) {
        throw new Error(`Snap "${snapId}" is disabled.`);
      }

      if (this.state.snaps[snapId].status === SnapStatus.installing) {
        throw new Error(`Snap "${snapId}" is currently being installed. Please try again later.`);
      }

      if (!handler && this.isRunning(snapId) === false) {
        if (startPromise === null) {
          // cold start
          startPromise = this.startSnap(snapId);
        } else if (locks.get(origin) >= locks.maxQueue) {
          throw new Error('Hang on a second.')
        }

        locks.increment(origin);
        await startPromise;
        // TODO: decrement locks
        // TODO: set startPromise to null
        handler = await this._getRpcMessageHandler(snapId);
      }

      if (!handler) {
        throw new Error(
          `Snap execution service returned no RPC handler for running snap "${snapId}".`,
        );
      }

      let _request = request;
      if (!Object.hasOwnProperty.call(request, 'jsonrpc')) {
        _request = { ...request, jsonrpc: '2.0' };
      } else if (request.jsonrpc !== '2.0') {
        throw ethErrors.rpc.invalidRequest({
          message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
          data: request.jsonrpc,
        });
      }

      this._recordSnapRpcRequest(snapId);

      // Handle max request time
      let timeout: number | undefined;

      const timeoutPromise = new Promise((_resolve, reject) => {
        timeout = setTimeout(() => {
          this.stopSnap(snapId, SnapStatusEvent.stop);
          reject(new Error('The request timed out.'));
        }, this._maxRequestTime) as unknown as number;
      });

      // This will either get the result or reject due to the timeout.
      const result = await Promise.race([
        handler(origin, _request),
        timeoutPromise,
      ]);

      clearTimeout(timeout);
      return result;
    };

    runtime.rpcHandler = rpcHandler;
    return rpcHandler;
  }

  private _recordSnapRpcRequest(snapId: SnapId) {
    const runtime = this._getSnapRuntimeData(snapId);
    runtime.lastRequest = Date.now();
  }

  private _getSnapRuntimeData(snapId: SnapId) {
    if (!this._snapsRuntimeData.has(snapId)) {
      this._snapsRuntimeData.set(snapId, {
        lastRequest: null,
        rpcHandler: null,
        installPromise: null,
      });
    }
    return this._snapsRuntimeData.get(snapId) as SnapRuntimeData;
  }
}
