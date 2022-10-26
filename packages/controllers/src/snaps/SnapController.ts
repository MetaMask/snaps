import passworder from '@metamask/browser-passworder';
import {
  AddApprovalRequest,
  BaseControllerV2 as BaseController,
  Caveat,
  GetEndowments,
  GetPermissions,
  GrantPermissions,
  HasPermission,
  HasPermissions,
  PermissionsRequest,
  RestrictedControllerMessenger,
  RevokeAllPermissions,
  RevokePermissionForAllSubjects,
  RevokePermissions,
  SubjectPermissions,
  ValidPermission,
} from '@metamask/controllers';
import {
  DEFAULT_ENDOWMENTS,
  DEFAULT_REQUESTED_SNAP_VERSION,
  getSnapPermissionName,
  getSnapPrefix,
  gtVersion,
  isValidSnapVersionRange,
  LOCALHOST_HOSTNAMES,
  NpmSnapFileNames,
  resolveVersion,
  satisfiesVersionRange,
  SnapId,
  SnapIdPrefixes,
  SnapManifest,
  SnapRpcHook,
  SnapRpcHookArgs,
  SNAP_PREFIX,
  ValidatedSnapId,
  validateSnapId,
  validateSnapShasum,
  TruncatedSnapFields,
  Snap,
  StatusContext,
  StatusEvents,
  StatusStates,
  BlockedSnapInfo,
  TruncatedSnap,
  InstallSnapsResult,
  RequestedSnapPermissions,
  ProcessSnapResult,
  SNAP_PREFIX_REGEX,
  fromEntries,
  SnapStatus,
  SnapStatusEvents,
  assertIsSnapManifest,
  PersistedSnap,
} from '@metamask/snap-utils';
import {
  Duration,
  hasProperty,
  inMilliseconds,
  isNonEmptyArray,
  Json,
  timeSince,
  assert,
  assertExhaustive,
} from '@metamask/utils';
import { createMachine, interpret, StateMachine } from '@xstate/fsm';
import { ethErrors, serializeError } from 'eth-rpc-errors';
import type { Patch } from 'immer';
import { nanoid } from 'nanoid';

import { caveatMappers } from '@metamask/rpc-methods';
import { forceStrict, validateMachine } from '../fsm';
import {
  ExecuteSnapAction,
  ExecutionServiceEvents,
  HandleRpcRequestAction,
  SnapErrorJson,
  TerminateAllSnapsAction,
  TerminateSnapAction,
} from '../services/ExecutionService';
import { hasTimedOut, setDiff, withTimeout } from '../utils';
import { endowmentCaveatMappers, SnapEndowments } from './endowments';
import { RequestQueue } from './RequestQueue';
import { fetchNpmSnap } from './utils';

import { Timer } from './Timer';

export const controllerName = 'SnapController';

// TODO: Figure out how to name these
export const SNAP_APPROVAL_INSTALL = 'wallet_installSnap';
export const SNAP_APPROVAL_UPDATE = 'wallet_updateSnap';

const TRUNCATED_SNAP_PROPERTIES = new Set<TruncatedSnapFields>([
  'initialPermissions',
  'id',
  'permissionName',
  'version',
  'enabled',
  'blocked',
]);

export type PendingRequest = {
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
}

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

// Types that probably should be defined elsewhere in prod
type CloseAllConnectionsFunction = (origin: string) => void;
type StoredSnaps = Record<SnapId, Snap>;

export type SnapControllerState = {
  snaps: StoredSnaps;
  snapStates: Record<SnapId, string>;
  snapErrors: {
    [internalID: string]: SnapError & { internalID: string };
  };
};

export type PersistedSnapControllerState = SnapControllerState & {
  snaps: Record<SnapId, PersistedSnap>;
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
 * Handles sending an inbound request to a snap and returns its result.
 */
export type HandleSnapRequest = {
  type: `${typeof controllerName}:handleRequest`;
  handler: SnapController['handleRequest'];
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

/**
 * Clears the specified Snap's persisted state.
 */
export type ClearSnapState = {
  type: `${typeof controllerName}:clearSnapState`;
  handler: SnapController['clearSnapState'];
};

/**
 * Checks all installed snaps against the blocklist.
 */
export type UpdateBlockedSnaps = {
  type: `${typeof controllerName}:updateBlockedSnaps`;
  handler: SnapController['updateBlockedSnaps'];
};

export type EnableSnap = {
  type: `${typeof controllerName}:enable`;
  handler: SnapController['enableSnap'];
};

export type DisableSnap = {
  type: `${typeof controllerName}:disable`;
  handler: SnapController['disableSnap'];
};

export type RemoveSnap = {
  type: `${typeof controllerName}:remove`;
  handler: SnapController['removeSnap'];
};

export type GetPermittedSnaps = {
  type: `${typeof controllerName}:getPermitted`;
  handler: SnapController['getPermittedSnaps'];
};

export type GetAllSnaps = {
  type: `${typeof controllerName}:getAll`;
  handler: SnapController['getAllSnaps'];
};

export type IncrementActiveReferences = {
  type: `${typeof controllerName}:incrementActiveReferences`;
  handler: SnapController['incrementActiveReferences'];
};

export type DecrementActiveReferences = {
  type: `${typeof controllerName}:decrementActiveReferences`;
  handler: SnapController['decrementActiveReferences'];
};

export type InstallSnaps = {
  type: `${typeof controllerName}:install`;
  handler: SnapController['installSnaps'];
};

export type RemoveSnapError = {
  type: `${typeof controllerName}:removeSnapError`;
  handler: SnapController['removeSnapError'];
};

export type SnapControllerActions =
  | AddSnap
  | ClearSnapState
  | GetSnap
  | GetSnapState
  | HandleSnapRequest
  | HasSnap
  | UpdateBlockedSnaps
  | UpdateSnapState
  | EnableSnap
  | DisableSnap
  | RemoveSnap
  | GetPermittedSnaps
  | InstallSnaps
  | RemoveSnapError
  | GetAllSnaps
  | IncrementActiveReferences
  | DecrementActiveReferences;

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
  payload: [snap: Snap, svgIcon: string | undefined];
};

/**
 * Emitted when an installed snap has been blocked.
 */
export type SnapBlocked = {
  type: `${typeof controllerName}:snapBlocked`;
  payload: [snapId: string, blockedSnapInfo: BlockedSnapInfo];
};

/**
 * Emitted when a snap has been started after being added and authorized during
 * installation.
 */
export type SnapInstalled = {
  type: `${typeof controllerName}:snapInstalled`;
  payload: [snap: TruncatedSnap];
};

/**
 * Emitted when a snap is removed.
 */
export type SnapRemoved = {
  type: `${typeof controllerName}:snapRemoved`;
  payload: [snap: TruncatedSnap];
};

/**
 * Emitted when an installed snap has been unblocked.
 */
export type SnapUnblocked = {
  type: `${typeof controllerName}:snapUnblocked`;
  payload: [snapId: string];
};

/**
 * Emitted when a snap is updated.
 */
export type SnapUpdated = {
  type: `${typeof controllerName}:snapUpdated`;
  payload: [snap: TruncatedSnap, oldVersion: string];
};

/**
 * Emitted when a Snap is terminated. This is different from the snap being
 * stopped as it can also be triggered when a snap fails initialization.
 */
export type SnapTerminated = {
  type: `${typeof controllerName}:snapTerminated`;
  payload: [snap: TruncatedSnap];
};

export type SnapControllerEvents =
  | SnapAdded
  | SnapBlocked
  | SnapInstalled
  | SnapRemoved
  | SnapStateChange
  | SnapUnblocked
  | SnapUpdated
  | SnapTerminated;

export type AllowedActions =
  | GetEndowments
  | GetPermissions
  | HasPermission
  | HasPermissions
  | RevokePermissions
  | RevokeAllPermissions
  | RevokePermissionForAllSubjects
  | GrantPermissions
  | AddApprovalRequest
  | HandleRpcRequestAction
  | ExecuteSnapAction
  | TerminateAllSnapsAction
  | TerminateSnapAction;

export type AllowedEvents = ExecutionServiceEvents;

type SnapControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapControllerActions | AllowedActions,
  SnapControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

export enum AppKeyType {
  stateEncryption = 'stateEncryption',
}

type GetAppKey = (subject: string, appKeyType: AppKeyType) => Promise<string>;

type FeatureFlags = {
  /**
   * We still need to implement new UI approval page in metamask-extension before we can allow
   * DApps to update Snaps. After it's added, this flag can be removed.
   *
   * @see {SNAP_APPROVAL_UPDATE}
   * @see {SnapController.processRequestedSnap}
   */
  dappsCanUpdateSnaps?: true;
};

type SemVerVersion = string;
type SnapInfo = { version: SemVerVersion; shasum: string };
export type CheckSnapBlockListArg = Record<SnapId, SnapInfo>;

export type CheckSnapBlockListResult = Record<
  SnapId,
  | {
      blocked: true;
      reason?: string;
      infoUrl?: string;
    }
  | { blocked: false }
>;

/**
 * Checks whether a version of a snap is blocked.
 */
export type CheckSnapBlockList = (
  snapsToCheck: CheckSnapBlockListArg,
) => Promise<CheckSnapBlockListResult>;

type SnapControllerArgs = {
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

type AddSnapArgsBase = {
  id: SnapId;
  origin: string;
  versionRange?: string;
};

// A snap can either be added directly, with manifest and source code, or it
// can be fetched and then added.
type AddSnapArgs =
  | AddSnapArgsBase
  | (AddSnapArgsBase & {
      manifest: SnapManifest;
      sourceCode: string;
    });

// When we set a snap, we need all required properties to be present and
// validated.
type SetSnapArgs = Omit<AddSnapArgs, 'id'> & {
  id: ValidatedSnapId;
  manifest: SnapManifest;
  sourceCode: string;
  svgIcon?: string;
};

const defaultState: SnapControllerState = {
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
function truncateSnap(snap: Snap): TruncatedSnap {
  return Object.keys(snap).reduce((serialized, key) => {
    if (TRUNCATED_SNAP_PROPERTIES.has(key as any)) {
      serialized[key as keyof TruncatedSnap] = snap[
        key as keyof TruncatedSnap
      ] as any;
    }

    return serialized;
  }, {} as Partial<TruncatedSnap>) as TruncatedSnap;
}

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

  private _environmentEndowmentPermissions: string[];

  private _featureFlags: FeatureFlags;

  private _fetchFunction: typeof fetch;

  private _idleTimeCheckInterval: number;

  private _checkSnapBlockList: CheckSnapBlockList;

  private _maxIdleTime: number;

  private _maxRequestTime: number;

  private _npmRegistryUrl?: string;

  private _snapsRuntimeData: Map<SnapId, SnapRuntimeData>;

  private _getAppKey: GetAppKey;

  private _timeoutForLastRequestStatus?: number;

  private _statusMachine!: StateMachine.Machine<
    StatusContext,
    StatusEvents,
    StatusStates
  >;

  constructor({
    closeAllConnections,
    messenger,
    state,
    getAppKey,
    environmentEndowmentPermissions = [],
    npmRegistryUrl,
    idleTimeCheckInterval = inMilliseconds(5, Duration.Second),
    checkBlockList,
    maxIdleTime = inMilliseconds(30, Duration.Second),
    maxRequestTime = inMilliseconds(60, Duration.Second),
    fetchFunction = globalThis.fetch.bind(globalThis),
    featureFlags = {},
  }: SnapControllerArgs) {
    const loadedSourceCode: Record<SnapId, string> = {};
    const filteredState = {
      ...state,
      snaps: Object.values(state?.snaps ?? {}).reduce(
        (memo: Record<string, Snap>, snap) => {
          const { sourceCode, ...rest } = snap;
          loadedSourceCode[snap.id] = sourceCode;
          memo[snap.id] = rest;
          return memo;
        },
        {},
      ),
    };
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
                  sourceCode: this.getRuntimeExpect(snap.id).sourceCode,
                  // At the time state is rehydrated, no snap will be running.
                  status: SnapStatus.Stopped,
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
      state: { ...defaultState, ...filteredState },
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

    this.messagingSystem.subscribe(
      'ExecutionService:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messagingSystem.subscribe(
      'ExecutionService:outboundRequest',
      this._onOutboundRequest,
    );

    this.messagingSystem.subscribe(
      'ExecutionService:outboundResponse',
      this._onOutboundResponse,
    );

    this.initializeStateMachine();
    this.registerMessageHandlers();

    Object.entries(loadedSourceCode).forEach(([id, sourceCode]) =>
      this.setupRuntime(id, sourceCode),
    );
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
  private initializeStateMachine() {
    const disableGuard = ({ snapId }: StatusContext) => {
      return this.getExpect(snapId).enabled;
    };

    const statusConfig: StateMachine.Config<
      StatusContext,
      StatusEvents,
      StatusStates
    > = {
      initial: SnapStatus.Installing,
      states: {
        [SnapStatus.Installing]: {
          on: {
            [SnapStatusEvents.Start]: {
              target: SnapStatus.Running,
              cond: disableGuard,
            },
          },
        },
        [SnapStatus.Updating]: {
          on: {
            [SnapStatusEvents.Start]: {
              target: SnapStatus.Running,
              cond: disableGuard,
            },
          },
        },
        [SnapStatus.Running]: {
          on: {
            [SnapStatusEvents.Stop]: SnapStatus.Stopped,
            [SnapStatusEvents.Crash]: SnapStatus.Crashed,
          },
        },
        [SnapStatus.Stopped]: {
          on: {
            [SnapStatusEvents.Start]: {
              target: SnapStatus.Running,
              cond: disableGuard,
            },
            [SnapStatusEvents.Update]: SnapStatus.Updating,
          },
        },
        [SnapStatus.Crashed]: {
          on: {
            [SnapStatusEvents.Start]: {
              target: SnapStatus.Running,
              cond: disableGuard,
            },
          },
        },
      },
    };
    this._statusMachine = createMachine(statusConfig);
    validateMachine(this._statusMachine);
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
      `${controllerName}:clearSnapState`,
      (...args) => this.clearSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:get`,
      (...args) => this.get(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getSnapState`,
      (...args) => this.getSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:handleRequest`,
      (...args) => this.handleRequest(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:has`,
      (...args) => this.has(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateBlockedSnaps`,
      () => this.updateBlockedSnaps(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateSnapState`,
      (...args) => this.updateSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:enable`,
      (...args) => this.enableSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:disable`,
      (...args) => this.disableSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:remove`,
      (...args) => this.removeSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getPermitted`,
      (...args) => this.getPermittedSnaps(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:install`,
      (...args) => this.installSnaps(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:removeSnapError`,
      (...args) => this.removeSnapError(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getAll`,
      (...args) => this.getAllSnaps(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:incrementActiveReferences`,
      (...args) => this.incrementActiveReferences(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:decrementActiveReferences`,
      (...args) => this.decrementActiveReferences(...args),
    );
  }

  _pollForLastRequestStatus() {
    this._timeoutForLastRequestStatus = setTimeout(async () => {
      await this._stopSnapsLastRequestPastMax();
      this._pollForLastRequestStatus();
    }, this._idleTimeCheckInterval) as unknown as number;
  }

  /**
   * Checks all installed snaps against the block list and
   * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
   * for more information.
   */
  async updateBlockedSnaps(): Promise<void> {
    const blockedSnaps = await this._checkSnapBlockList(
      Object.values(this.state.snaps).reduce<CheckSnapBlockListArg>(
        (blockListArg, snap) => {
          blockListArg[snap.id] = {
            version: snap.version,
            shasum: snap.manifest.source.shasum,
          };
          return blockListArg;
        },
        {},
      ),
    );

    await Promise.all(
      Object.entries(blockedSnaps).map(
        ([snapId, { blocked, ...blockData }]) => {
          if (blocked) {
            return this._blockSnap(snapId, blockData);
          }

          return this._unblockSnap(snapId);
        },
      ),
    );
  }

  /**
   * Blocks an installed snap and prevents it from being started again. Emits
   * {@link SnapBlocked}. Does nothing if the snap is not installed.
   *
   * @param snapId - The snap to block.
   * @param blockedSnapInfo - Information detailing why the snap is blocked.
   */
  private async _blockSnap(
    snapId: SnapId,
    blockedSnapInfo: BlockedSnapInfo,
  ): Promise<void> {
    if (!this.has(snapId)) {
      return;
    }

    try {
      this.update((state: any) => {
        state.snaps[snapId].blocked = true;
        state.snaps[snapId].blockInformation = blockedSnapInfo;
      });

      await this.disableSnap(snapId);
    } catch (error) {
      console.error(
        `Encountered error when stopping blocked snap "${snapId}".`,
        error,
      );
    }

    this.messagingSystem.publish(
      `${controllerName}:snapBlocked`,
      snapId,
      blockedSnapInfo,
    );
  }

  /**
   * Unblocks a snap so that it can be enabled and started again. Emits
   * {@link SnapUnblocked}. Does nothing if the snap is not installed or already
   * unblocked.
   *
   * @param snapId - The id of the snap to unblock.
   */
  private async _unblockSnap(snapId: SnapId): Promise<void> {
    if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
      return;
    }

    this.update((state: any) => {
      state.snaps[snapId].blocked = false;
      delete state.snaps[snapId].blockInformation;
    });

    this.messagingSystem.publish(`${controllerName}:snapUnblocked`, snapId);
  }

  /**
   * Checks the block list to determine whether a version of a snap is blocked.
   *
   * @param snapId - The snap id to check.
   * @param snapInfo - Snap information containing version and shasum.
   * @returns Whether the version of the snap is blocked or not.
   */
  async isBlocked(
    snapId: ValidatedSnapId,
    snapInfo: SnapInfo,
  ): Promise<boolean> {
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
  private async _assertIsUnblocked(
    snapId: ValidatedSnapId,
    snapInfo: SnapInfo,
  ) {
    if (await this.isBlocked(snapId, snapInfo)) {
      throw new Error(
        `Cannot install version "${snapInfo.version}" of snap "${snapId}": the version is blocked.`,
      );
    }
  }

  async _stopSnapsLastRequestPastMax() {
    const entries = [...this._snapsRuntimeData.entries()];
    return Promise.all(
      entries
        .filter(
          ([_snapId, runtime]) =>
            runtime.activeReferences === 0 &&
            runtime.pendingInboundRequests.length === 0 &&
            // lastRequest should always be set here but TypeScript wants this check
            runtime.lastRequest &&
            this._maxIdleTime &&
            timeSince(runtime.lastRequest) > this._maxIdleTime,
        )
        .map(([snapId]) => this.stopSnap(snapId, SnapStatusEvents.Stop)),
    );
  }

  async _onUnhandledSnapError(snapId: SnapId, error: SnapErrorJson) {
    await this.stopSnap(snapId, SnapStatusEvents.Crash);
    this.addSnapError(error);
  }

  async _onOutboundRequest(snapId: SnapId) {
    const runtime = this.getRuntimeExpect(snapId);
    // Ideally we would only pause the pending request that is making the outbound request
    // but right now we don't have a way to know which request initiated the outbound request
    runtime.pendingInboundRequests
      .filter((pendingRequest) => pendingRequest.timer.status === 'running')
      .forEach((pendingRequest) => pendingRequest.timer.pause());
    runtime.pendingOutboundRequests += 1;
  }

  async _onOutboundResponse(snapId: SnapId) {
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
  private transition(
    snapId: SnapId,
    event: StatusEvents | StatusEvents['type'],
  ) {
    const { interpreter } = this.getRuntimeExpect(snapId);
    interpreter.send(event);
    this.update((state: any) => {
      state.snaps[snapId].status = interpreter.state.value;
    });
  }

  /**
   * Starts the given snap. Throws an error if no such snap exists
   * or if it is already running.
   *
   * @param snapId - The id of the Snap to start.
   */
  async startSnap(snapId: SnapId): Promise<void> {
    const runtime = this.getRuntimeExpect(snapId);

    if (this.state.snaps[snapId].enabled === false) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }

    assert(runtime.sourceCode);

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
  enableSnap(snapId: SnapId): void {
    this.getExpect(snapId);

    if (this.state.snaps[snapId].blocked) {
      throw new Error(`Snap "${snapId}" is blocked and cannot be enabled.`);
    }

    this.update((state: any) => {
      state.snaps[snapId].enabled = true;
    });
  }

  /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to disable.
   * @returns A promise that resolves once the snap has been disabled.
   */
  disableSnap(snapId: SnapId): Promise<void> {
    if (!this.has(snapId)) {
      throw new Error(`Snap "${snapId}" not found.`);
    }

    this.update((state: any) => {
      state.snaps[snapId].enabled = false;
    });

    if (this.isRunning(snapId)) {
      return this.stopSnap(snapId, SnapStatusEvents.Stop);
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
      | SnapStatusEvents.Stop
      | SnapStatusEvents.Crash = SnapStatusEvents.Stop,
  ): Promise<void> {
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
    } finally {
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
  private async terminateSnap(snapId: SnapId) {
    await this.messagingSystem.call('ExecutionService:terminateSnap', snapId);
    this.messagingSystem.publish(
      'SnapController:snapTerminated',
      this.getTruncatedExpect(snapId),
    );
  }

  /**
   * Returns whether the given snap is running.
   * Throws an error if the snap doesn't exist.
   *
   * @param snapId - The id of the Snap to check.
   * @returns `true` if the snap is running, otherwise `false`.
   */
  isRunning(snapId: SnapId): boolean {
    return this.getExpect(snapId).status === 'running';
  }

  /**
   * Returns whether the given snap has been added to state.
   *
   * @param snapId - The id of the Snap to check for.
   * @returns `true` if the snap exists in the controller state, otherwise `false`.
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
   * @returns The entire snap object from the controller state.
   */
  get(snapId: SnapId): Snap | undefined {
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
  getExpect(snapId: SnapId): Snap {
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
   */
  // TODO(ritave): this.get returns undefined, this.getTruncated returns null
  getTruncated(snapId: SnapId): TruncatedSnap | null {
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
  getTruncatedExpect(snapId: SnapId): TruncatedSnap {
    return truncateSnap(this.getExpect(snapId));
  }

  /**
   * Updates the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   */
  async updateSnapState(snapId: SnapId, newSnapState: Json): Promise<void> {
    const encrypted = await this.encryptSnapState(snapId, newSnapState);
    this.update((state: any) => {
      state.snapStates[snapId] = encrypted;
    });
  }

  /**
   * Clears the state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be cleared.
   */
  async clearSnapState(snapId: SnapId): Promise<void> {
    this.update((state: any) => {
      delete state.snapStates[snapId];
    });
  }

  /**
   * Adds error from a snap to the SnapController state.
   *
   * @param snapError - The error to store on the SnapController.
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
   * @param internalID - The internal error ID to remove on the SnapController.
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
   * @returns A promise that resolves with the decrypted snap state or null if no state exists.
   * @throws If the snap state decryption fails.
   */
  async getSnapState(snapId: SnapId): Promise<Json> {
    const state = this.state.snapStates[snapId];
    return state ? this.decryptSnapState(snapId, state) : null;
  }

  private async getEncryptionKey(snapId: SnapId): Promise<string> {
    return this._getAppKey(snapId, AppKeyType.stateEncryption);
  }

  private async encryptSnapState(snapId: SnapId, state: Json): Promise<string> {
    const appKey = await this.getEncryptionKey(snapId);
    return passworder.encrypt(appKey, state);
  }

  private async decryptSnapState(
    snapId: SnapId,
    encrypted: string,
  ): Promise<Json> {
    const appKey = await this.getEncryptionKey(snapId);
    try {
      return await passworder.decrypt(appKey, encrypted);
    } catch (err) {
      throw new Error(
        'Failed to decrypt snap state, the state must be corrupted.',
      );
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
   * @returns A promise that resolves once the snap has been removed.
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
        const truncated = this.getTruncatedExpect(snapId);
        // Disable the snap and revoke all of its permissions before deleting
        // it. This ensures that the snap will not be restarted or otherwise
        // affect the host environment while we are deleting it.
        await this.disableSnap(snapId);
        this.revokeAllSnapPermissions(snapId);

        const permissionName = getSnapPermissionName(snapId);
        // Revoke all subjects access to the snap
        this.messagingSystem.call(
          'PermissionController:revokePermissionForAllSubjects',
          permissionName,
        );

        this._snapsRuntimeData.delete(snapId);

        this.update((state: any) => {
          delete state.snaps[snapId];
          delete state.snapStates[snapId];
        });

        this.messagingSystem.publish(`SnapController:snapRemoved`, truncated);
      }),
    );
  }

  /**
   * Safely revokes all permissions granted to a Snap.
   *
   * @param snapId - The snap ID.
   */
  private async revokeAllSnapPermissions(snapId: string): Promise<void> {
    if (
      await this.messagingSystem.call(
        'PermissionController:hasPermissions',
        snapId,
      )
    ) {
      this.messagingSystem.call(
        'PermissionController:revokeAllPermissions',
        snapId,
      );
    }
  }

  /**
   * Handles incrementing the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced.
   */
  incrementActiveReferences(snapId: SnapId) {
    const runtime = this.getRuntimeExpect(snapId);
    runtime.activeReferences += 1;
  }

  /**
   * Handles decrement the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced..
   */
  decrementActiveReferences(snapId: SnapId) {
    const runtime = this.getRuntimeExpect(snapId);
    assert(
      runtime.activeReferences > 0,
      'SnapController reference management is in an invalid state.',
    );
    runtime.activeReferences -= 1;
  }

  /**
   * Gets all snaps in their truncated format.
   *
   * @returns All installed snaps in their truncated format.
   */
  getAllSnaps(): TruncatedSnap[] {
    return Object.values(this.state.snaps).map(truncateSnap);
  }

  /**
   * Gets the serialized permitted snaps of the given origin, if any.
   *
   * @param origin - The origin whose permitted snaps to retrieve.
   * @returns The serialized permitted snaps for the origin.
   */
  async getPermittedSnaps(origin: string): Promise<InstallSnapsResult> {
    return Object.values(
      (await this.messagingSystem.call(
        'PermissionController:getPermissions',
        origin,
      )) ?? {},
    ).reduce((permittedSnaps, perm) => {
      if (perm.parentCapability.startsWith(SNAP_PREFIX)) {
        const snapId = perm.parentCapability.replace(SNAP_PREFIX_REGEX, '');
        const snap = this.get(snapId);
        const truncatedSnap = this.getTruncated(snapId);

        if (truncatedSnap && snap?.status !== SnapStatus.Installing) {
          permittedSnaps[snapId] = truncatedSnap;
        }
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
          const permissionName = getSnapPermissionName(snapId);

          if (!isValidSnapVersionRange(version)) {
            result[snapId] = {
              error: ethErrors.rpc.invalidParams(
                `The "version" field must be a valid SemVer version range if specified. Received: "${version}".`,
              ),
            };
            return;
          }

          if (
            await this.messagingSystem.call(
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
   * @param versionRange - The semver range of the snap to install.
   * @returns The resulting snap object, or an error if something went wrong.
   */
  private async processRequestedSnap(
    origin: string,
    snapId: SnapId,
    versionRange: string,
  ): Promise<ProcessSnapResult> {
    try {
      validateSnapId(snapId);
    } catch (err) {
      return {
        error: ethErrors.rpc.invalidParams(
          `"${snapId}" is not a valid snap id.`,
        ),
      };
    }

    const existingSnap = this.getTruncated(snapId);
    // For devX we always re-install local snaps.
    if (existingSnap && getSnapPrefix(snapId) !== SnapIdPrefixes.local) {
      if (satisfiesVersionRange(existingSnap.version, versionRange)) {
        return existingSnap;
      }

      if (this._featureFlags.dappsCanUpdateSnaps === true) {
        try {
          const updateResult = await this.updateSnap(
            origin,
            snapId,
            versionRange,
          );
          if (updateResult === null) {
            return {
              error: ethErrors.rpc.invalidParams(
                `Snap "${snapId}@${existingSnap.version}" is already installed, couldn't update to a version inside requested "${versionRange}" range.`,
              ),
            };
          }
          return updateResult;
        } catch (err) {
          return { error: serializeError(err) };
        }
      } else {
        return {
          error: ethErrors.rpc.invalidParams(
            `Version mismatch with already installed snap. ${snapId}@${existingSnap.version} doesn't satisfy requested version ${versionRange}`,
          ),
        };
      }
    }

    // Existing snaps must be stopped before overwriting
    if (existingSnap && this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }

    try {
      const { sourceCode } = await this.add({
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
    } catch (err) {
      console.error(`Error when adding snap.`, err);
      if (this.has(snapId)) {
        this.removeSnap(snapId);
      }

      return { error: serializeError(err) };
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
  async updateSnap(
    origin: string,
    snapId: ValidatedSnapId,
    newVersionRange: string = DEFAULT_REQUESTED_SNAP_VERSION,
  ): Promise<TruncatedSnap | null> {
    const snap = this.getExpect(snapId);

    if (!isValidSnapVersionRange(newVersionRange)) {
      throw new Error(
        `Received invalid snap version range: "${newVersionRange}".`,
      );
    }

    const newSnap = await this._fetchSnap(snapId, newVersionRange);
    const newVersion = newSnap.manifest.version;
    if (!gtVersion(newVersion, snap.version)) {
      console.warn(
        `Tried updating snap "${snapId}" within "${newVersionRange}" version range, but newer version "${snap.version}" is already installed`,
      );
      return null;
    }

    await this._assertIsUnblocked(snapId, {
      version: newVersion,
      shasum: newSnap.manifest.source.shasum,
    });

    const processedPermissions = this.processSnapPermissions(
      newSnap.manifest.initialPermissions,
    );

    const { newPermissions, unusedPermissions, approvedPermissions } =
      await this.calculatePermissionsChange(snapId, processedPermissions);

    const id = nanoid();
    const { permissions: approvedNewPermissions, ...requestData } =
      (await this.messagingSystem.call(
        'ApprovalController:addRequest',
        {
          origin,
          id,
          type: SNAP_APPROVAL_UPDATE,
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
        },
        true,
      )) as PermissionsRequest;

    if (this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }

    this.transition(snapId, SnapStatusEvents.Update);

    this._set({
      origin,
      id: snapId,
      manifest: newSnap.manifest,
      sourceCode: newSnap.sourceCode,
      versionRange: newVersionRange,
    });

    const unusedPermissionsKeys = Object.keys(unusedPermissions);
    if (isNonEmptyArray(unusedPermissionsKeys)) {
      await this.messagingSystem.call(
        'PermissionController:revokePermissions',
        {
          [snapId]: unusedPermissionsKeys,
        },
      );
    }

    if (isNonEmptyArray(Object.keys(approvedNewPermissions))) {
      await this.messagingSystem.call('PermissionController:grantPermissions', {
        approvedPermissions: approvedNewPermissions,
        subject: { origin: snapId },
        requestData,
      });
    }

    await this._startSnap({ snapId, sourceCode: newSnap.sourceCode });

    const truncatedSnap = this.getTruncatedExpect(snapId);

    this.messagingSystem.publish(
      'SnapController:snapUpdated',
      truncatedSnap,
      snap.version,
    );
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
  async add(args: AddSnapArgs): Promise<PersistedSnap> {
    const { id: snapId } = args;
    validateSnapId(snapId);

    if (
      !args ||
      !('origin' in args) ||
      !('id' in args) ||
      (!('manifest' in args) && 'sourceCode' in args) ||
      ('manifest' in args && !('sourceCode' in args))
    ) {
      throw new Error(`Invalid add snap args for snap "${snapId}".`);
    }
    this.setupRuntime(snapId, null);
    const runtime = this.getRuntimeExpect(snapId);
    if (!runtime.installPromise) {
      console.info(`Adding snap: ${snapId}`);

      // If fetching and setting the snap succeeds, this property will be set
      // to null in the authorize() method.
      runtime.installPromise = (async () => {
        if ('manifest' in args && 'sourceCode' in args) {
          return this._set({ ...args, id: snapId });
        }

        const fetchedSnap = await this._fetchSnap(snapId, args.versionRange);
        await this._assertIsUnblocked(snapId, {
          version: fetchedSnap.manifest.version,
          shasum: fetchedSnap.manifest.source.shasum,
        });

        return this._set({
          ...args,
          ...fetchedSnap,
          id: snapId,
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

  private async _startSnap(snapData: { snapId: string; sourceCode: string }) {
    const { snapId } = snapData;
    if (this.isRunning(snapId)) {
      throw new Error(`Snap "${snapId}" is already started.`);
    }

    try {
      const result = await this._executeWithTimeout(
        snapId,
        this.messagingSystem.call('ExecutionService:executeSnap', {
          ...snapData,
          endowments: await this._getEndowments(snapId),
        }),
      );
      this.transition(snapId, SnapStatusEvents.Start);
      return result;
    } catch (err) {
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
  private async _getEndowments(snapId: string): Promise<string[]> {
    let allEndowments: string[] = [];

    for (const permissionName of this._environmentEndowmentPermissions) {
      if (
        await this.messagingSystem.call(
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
  private _set(args: SetSnapArgs): PersistedSnap {
    const {
      id: snapId,
      origin,
      manifest,
      sourceCode,
      svgIcon,
      versionRange = DEFAULT_REQUESTED_SNAP_VERSION,
    } = args;

    assertIsSnapManifest(manifest);
    const { version } = manifest;

    if (!satisfiesVersionRange(version, versionRange)) {
      throw new Error(
        `Version mismatch. Manifest for "${snapId}" specifies version "${version}" which doesn't satisfy requested version range "${versionRange}"`,
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
      // Restore relevant snap state if it exists
      ...existingSnap,

      // Note that the snap will be unblocked and enabled, regardless of its
      // previous state.
      blocked: false,
      enabled: true,

      // So we can easily correlate the snap with its permission
      permissionName: getSnapPermissionName(snapId),

      id: snapId,
      initialPermissions,
      manifest,
      status: this._statusMachine.config.initial as StatusStates['value'],
      version,
      versionHistory,
    };
    // If the snap was blocked, it isn't any longer
    delete snap.blockInformation;

    // store the snap back in state
    this.update((state: any) => {
      state.snaps[snapId] = snap;
    });

    const runtime = this.getRuntimeExpect(snapId);
    runtime.sourceCode = sourceCode;

    this.messagingSystem.publish(`SnapController:snapAdded`, snap, svgIcon);
    return { ...snap, sourceCode };
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
      this._fetchFunction,
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

    const manifest = await (
      await this._fetchFunction(manifestUrl.toString(), fetchOptions)
    ).json();
    assertIsSnapManifest(manifest);

    const {
      source: {
        location: {
          npm: { filePath, iconPath },
        },
      },
    } = manifest;

    const [sourceCode, svgIcon] = await Promise.all([
      (
        await this._fetchFunction(
          new URL(filePath, localhostUrl).toString(),
          fetchOptions,
        )
      ).text(),
      iconPath
        ? (
            await this._fetchFunction(
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
  private processSnapPermissions(
    initialPermissions: RequestedSnapPermissions,
  ): RequestedSnapPermissions {
    return fromEntries(
      Object.entries(initialPermissions).map(([initialPermission, value]) => {
        if (hasProperty(caveatMappers, initialPermission)) {
          return [initialPermission, caveatMappers[initialPermission](value)];
        } else if (hasProperty(endowmentCaveatMappers, initialPermission)) {
          return [
            initialPermission,
            endowmentCaveatMappers[initialPermission](value),
          ];
        }

        return [initialPermission, value];
      }),
    );
  }

  /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * @param origin - The origin of the install request.
   * @param snapId - The id of the Snap.
   * @returns The snap's approvedPermissions.
   */
  private async authorize(origin: string, snapId: SnapId): Promise<void> {
    console.info(`Authorizing snap: ${snapId}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapId];
    const { initialPermissions } = snap;

    try {
      const processedPermissions =
        this.processSnapPermissions(initialPermissions);
      const id = nanoid();
      const { permissions: approvedPermissions, ...requestData } =
        (await this.messagingSystem.call(
          'ApprovalController:addRequest',
          {
            origin,
            id,
            type: SNAP_APPROVAL_INSTALL,
            requestData: {
              // Mirror previous installation metadata
              metadata: { id, origin: snapId, dappOrigin: origin },
              permissions: processedPermissions,
              snapId,
            },
          },
          true,
        )) as PermissionsRequest;

      if (isNonEmptyArray(Object.keys(approvedPermissions))) {
        await this.messagingSystem.call(
          'PermissionController:grantPermissions',
          {
            approvedPermissions,
            subject: { origin: snapId },
            requestData,
          },
        );
      }
    } finally {
      const runtime = this.getRuntimeExpect(snapId);
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
      'ExecutionService:outboundRequest',
      this._onOutboundRequest,
    );

    this.messagingSystem.unsubscribe(
      'ExecutionService:outboundResponse',
      this._onOutboundResponse,
    );
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
    request,
  }: SnapRpcHookArgs & { snapId: SnapId }): Promise<unknown> {
    const handler = await this.getRpcRequestHandler(snapId);
    if (!handler) {
      throw new Error(
        `Snap RPC message handler not found for snap "${snapId}".`,
      );
    }
    return handler({ origin, handler: handlerType, request });
  }

  /**
   * Gets the RPC message handler for the given snap.
   *
   * @param snapId - The id of the Snap whose message handler to get.
   * @returns The RPC handler for the given snap.
   */
  private async getRpcRequestHandler(snapId: SnapId): Promise<SnapRpcHook> {
    const runtime = this.getRuntimeExpect(snapId);
    const existingHandler = runtime.rpcHandler;
    if (existingHandler) {
      return existingHandler;
    }

    const requestQueue = new RequestQueue(5);
    // We need to set up this promise map to map snapIds to their respective startPromises,
    // because otherwise we would lose context on the correct startPromise.
    const startPromises = new Map<string, Promise<void>>();

    const rpcHandler = async ({
      origin,
      handler: handlerType,
      request,
    }: SnapRpcHookArgs) => {
      if (this.state.snaps[snapId].enabled === false) {
        throw new Error(`Snap "${snapId}" is disabled.`);
      }

      if (this.state.snaps[snapId].status === SnapStatus.Installing) {
        throw new Error(
          `Snap "${snapId}" is currently being installed. Please try again later.`,
        );
      }

      if (this.isRunning(snapId) === false) {
        let localStartPromise = startPromises.get(snapId);
        if (!localStartPromise) {
          localStartPromise = this.startSnap(snapId);
          startPromises.set(snapId, localStartPromise);
        } else if (requestQueue.get(origin) >= requestQueue.maxQueueSize) {
          throw new Error(
            'Exceeds maximum number of requests waiting to be resolved, please try again.',
          );
        }

        requestQueue.increment(origin);
        try {
          await localStartPromise;
        } finally {
          requestQueue.decrement(origin);
          // Only delete startPromise for a snap if its value hasn't changed
          if (startPromises.get(snapId) === localStartPromise) {
            startPromises.delete(snapId);
          }
        }
      }

      let _request = request;
      if (!hasProperty(request, 'jsonrpc')) {
        _request = { ...request, jsonrpc: '2.0' };
      } else if (request.jsonrpc !== '2.0') {
        throw ethErrors.rpc.invalidRequest({
          message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
          data: request.jsonrpc,
        });
      }

      const timer = new Timer(this._maxRequestTime);
      this._recordSnapRpcRequestStart(snapId, request.id, timer);

      const handleRpcRequestPromise = this.messagingSystem.call(
        'ExecutionService:handleRpcRequest',
        snapId,
        { origin, handler: handlerType, request: _request },
      );

      // This will either get the result or reject due to the timeout.
      try {
        const result = await this._executeWithTimeout(
          snapId,
          handleRpcRequestPromise,
          timer,
        );
        this._recordSnapRpcRequestFinish(snapId, request.id);
        return result;
      } catch (err) {
        await this.stopSnap(snapId, SnapStatusEvents.Crash);
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
  private async _executeWithTimeout<PromiseValue>(
    snapId: SnapId,
    promise: Promise<PromiseValue>,
    timer?: Timer,
  ): Promise<PromiseValue> {
    const isLongRunning = await this.messagingSystem.call(
      'PermissionController:hasPermission',
      snapId,
      SnapEndowments.LongRunning,
    );

    // Long running snaps have timeouts disabled
    if (isLongRunning) {
      return promise;
    }

    const result = await withTimeout(promise, timer ?? this._maxRequestTime);
    if (result === hasTimedOut) {
      throw new Error('The request timed out.');
    }
    return result;
  }

  private _recordSnapRpcRequestStart(
    snapId: SnapId,
    requestId: unknown,
    timer: Timer,
  ) {
    const runtime = this.getRuntimeExpect(snapId);
    runtime.pendingInboundRequests.push({ requestId, timer });
    runtime.lastRequest = null;
  }

  private _recordSnapRpcRequestFinish(snapId: SnapId, requestId: unknown) {
    const runtime = this.getRuntimeExpect(snapId);
    runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter(
      (r) => r.requestId !== requestId,
    );

    if (runtime.pendingInboundRequests.length === 0) {
      runtime.lastRequest = Date.now();
    }
  }

  private getRuntime(snapId: SnapId): SnapRuntimeData | undefined {
    return this._snapsRuntimeData.get(snapId);
  }

  private getRuntimeExpect(snapId: SnapId): SnapRuntimeData {
    const runtime = this.getRuntime(snapId);
    assert(
      runtime !== undefined,
      new Error(`Snap "${snapId}" runtime data not found`),
    );
    return runtime;
  }

  private setupRuntime(snapId: SnapId, sourceCode: string | null) {
    if (this._snapsRuntimeData.has(snapId)) {
      return;
    }

    const snap = this.get(snapId);
    const interpreter = interpret(this._statusMachine);
    interpreter.start({
      context: { snapId },
      value:
        snap?.status ??
        (this._statusMachine.config.initial as StatusStates['value']),
    });

    forceStrict(interpreter);

    this._snapsRuntimeData.set(snapId, {
      lastRequest: null,
      rpcHandler: null,
      installPromise: null,
      activeReferences: 0,
      pendingInboundRequests: [],
      pendingOutboundRequests: 0,
      interpreter,
      sourceCode,
    });
  }

  private async calculatePermissionsChange(
    snapId: SnapId,
    desiredPermissionsSet: RequestedSnapPermissions,
  ): Promise<{
    newPermissions: RequestedSnapPermissions;
    unusedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
    approvedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
  }> {
    const oldPermissions =
      (await this.messagingSystem.call(
        'PermissionController:getPermissions',
        snapId,
      )) ?? {};

    const newPermissions = setDiff(desiredPermissionsSet, oldPermissions);
    // TODO(ritave): The assumption that these are unused only holds so long as we do not
    //               permit dynamic permission requests.
    const unusedPermissions = setDiff(oldPermissions, desiredPermissionsSet);

    // It's a Set Intersection of oldPermissions and desiredPermissionsSet
    // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
    const approvedPermissions = setDiff(oldPermissions, unusedPermissions);

    return { newPermissions, unusedPermissions, approvedPermissions };
  }
}
