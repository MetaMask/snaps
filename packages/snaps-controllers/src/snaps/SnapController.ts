import type {
  AddApprovalRequest,
  UpdateRequestState,
} from '@metamask/approval-controller';
import type { RestrictedControllerMessenger } from '@metamask/base-controller';
import { BaseControllerV2 as BaseController } from '@metamask/base-controller';
import type {
  Caveat,
  GetEndowments,
  GetPermissions,
  GetSubjectMetadata,
  GetSubjects,
  GrantPermissions,
  HasPermission,
  HasPermissions,
  PermissionConstraint,
  PermissionsRequest,
  RequestedPermissions,
  RevokeAllPermissions,
  RevokePermissionForAllSubjects,
  RevokePermissions,
  SubjectPermissions,
  UpdateCaveat,
  ValidPermission,
} from '@metamask/permission-controller';
import { SubjectType } from '@metamask/permission-controller';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import type { BlockReason } from '@metamask/snaps-registry';
import type {
  InstallSnapsResult,
  PersistedSnap,
  ProcessSnapResult,
  RequestedSnapPermissions,
  Snap,
  SnapId,
  SnapManifest,
  SnapRpcHook,
  SnapRpcHookArgs,
  StatusContext,
  StatusEvents,
  StatusStates,
  TruncatedSnap,
  TruncatedSnapFields,
  ValidatedSnapId,
  VirtualFile,
} from '@metamask/snaps-utils';
import {
  assertIsSnapManifest,
  assertIsValidSnapId,
  DEFAULT_ENDOWMENTS,
  DEFAULT_REQUESTED_SNAP_VERSION,
  getErrorMessage,
  HandlerType,
  logError,
  logWarning,
  normalizeRelative,
  resolveVersionRange,
  SnapCaveatType,
  SnapStatus,
  SnapStatusEvents,
  validateFetchedSnap,
} from '@metamask/snaps-utils';
import type { Json, NonEmptyArray, SemVerRange } from '@metamask/utils';
import {
  assert,
  assertIsJsonRpcRequest,
  Duration,
  gtRange,
  gtVersion,
  hasProperty,
  inMilliseconds,
  isNonEmptyArray,
  isValidSemVerRange,
  satisfiesVersionRange,
  timeSince,
} from '@metamask/utils';
import type { StateMachine } from '@xstate/fsm';
import { createMachine, interpret } from '@xstate/fsm';
import { ethErrors } from 'eth-rpc-errors';
import type { Patch } from 'immer';
import { nanoid } from 'nanoid';

import { forceStrict, validateMachine } from '../fsm';
import { log } from '../logging';
import type {
  ExecuteSnapAction,
  ExecutionServiceEvents,
  HandleRpcRequestAction,
  SnapErrorJson,
  TerminateAllSnapsAction,
  TerminateSnapAction,
} from '../services';
import { hasTimedOut, setDiff, withTimeout } from '../utils';
import { handlerEndowments, SnapEndowments } from './endowments';
import { getRpcCaveatOrigins } from './endowments/rpc';
import type { SnapLocation } from './location';
import { detectSnapLocation } from './location';
import { processSnapPermissions } from './permissions';
import type {
  GetMetadata,
  GetResult,
  SnapsRegistryInfo,
  SnapsRegistryMetadata,
  SnapsRegistryRequest,
  Update,
} from './registry';
import { SnapsRegistryStatus } from './registry';
import { RequestQueue } from './RequestQueue';
import { Timer } from './Timer';

export const controllerName = 'SnapController';

// TODO: Figure out how to name these
export const SNAP_APPROVAL_INSTALL = 'wallet_installSnap';
export const SNAP_APPROVAL_UPDATE = 'wallet_updateSnap';
export const SNAP_APPROVAL_RESULT = 'wallet_installSnapResult';

const TRUNCATED_SNAP_PROPERTIES = new Set<TruncatedSnapFields>([
  'initialPermissions',
  'id',
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
}

export type SnapError = {
  message: string;
  code: number;
  data?: Json;
};

/**
 * The return type of {@link SnapController.#fetchSnap} and its sibling methods.
 */
type FetchSnapResult = {
  /**
   * The manifest of the fetched Snap.
   */
  manifest: VirtualFile<SnapManifest>;

  /**
   * Auxillary files references in manifest.
   */
  files: VirtualFile[];

  /**
   * Location that was used to fetch the snap.
   *
   * Helpful if you want to pass it forward since files will be still cached.
   */
  location: SnapLocation;
};

// Types that probably should be defined elsewhere in prod
type CloseAllConnectionsFunction = (origin: string) => void;
type StoredSnaps = Record<ValidatedSnapId, Snap>;

export type SnapControllerState = {
  snaps: StoredSnaps;
  snapStates: Record<ValidatedSnapId, string | null>;
  snapErrors: {
    [internalID: string]: SnapError & { internalID: string };
  };
};

export type PersistedSnapControllerState = SnapControllerState & {
  snaps: Record<ValidatedSnapId, PersistedSnap>;
  snapStates: Record<ValidatedSnapId, string>;
};

type RollbackSnapshot = {
  statePatches: Patch[];
  permissions: {
    revoked: unknown;
    granted: unknown[];
    requestData: unknown;
  };
  newVersion: string;
};

type PendingApproval = {
  id: string;
  promise: Promise<unknown>;
};

// Controller Messenger Actions

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

export type GetRegistryMetadata = {
  type: `${typeof controllerName}:getRegistryMetadata`;
  handler: SnapController['getRegistryMetadata'];
};

export type DisconnectOrigin = {
  type: `${typeof controllerName}:disconnectOrigin`;
  handler: SnapController['removeSnapFromSubject'];
};

export type RevokeDynamicPermissions = {
  type: `${typeof controllerName}:revokeDynamicPermissions`;
  handler: SnapController['revokeDynamicSnapPermissions'];
};

export type SnapControllerActions =
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
  | DecrementActiveReferences
  | GetRegistryMetadata
  | DisconnectOrigin
  | RevokeDynamicPermissions;

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
  payload: [snapId: string, blockedSnapInfo?: BlockReason];
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
 * Emitted when a snap is rolled back.
 */
export type SnapRolledback = {
  type: `${typeof controllerName}:snapRolledback`;
  payload: [snap: TruncatedSnap, failedVersion: string];
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
  | SnapRolledback
  | SnapTerminated;

export type AllowedActions =
  | GetEndowments
  | GetPermissions
  | GetSubjects
  | GetSubjectMetadata
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
  | TerminateSnapAction
  | UpdateCaveat
  | UpdateRequestState
  | GetResult
  | GetMetadata
  | Update;

export type AllowedEvents =
  | ExecutionServiceEvents
  | SnapInstalled
  | SnapUpdated;

type SnapControllerMessenger = RestrictedControllerMessenger<
  typeof controllerName,
  SnapControllerActions | AllowedActions,
  SnapControllerEvents | AllowedEvents,
  AllowedActions['type'],
  AllowedEvents['type']
>;

type FeatureFlags = {
  /**
   * We still need to implement new UI approval page in metamask-extension before we can allow
   * DApps to update Snaps. After it's added, this flag can be removed.
   *
   * @see {SNAP_APPROVAL_UPDATE}
   * @see {SnapController.processRequestedSnap}
   */
  dappsCanUpdateSnaps?: true;
  requireAllowlist?: true;
  allowLocalSnaps?: true;
};

type SnapControllerArgs = {
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
type AddSnapArgs = {
  id: ValidatedSnapId;
  origin: string;
  location: SnapLocation;
  versionRange: SemVerRange;
};

// When we set a snap, we need all required properties to be present and
// validated.
type SetSnapArgs = Omit<AddSnapArgs, 'location' | 'versionRange'> & {
  manifest: VirtualFile<SnapManifest>;
  files: VirtualFile[];
  isUpdate?: boolean;
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
  const truncatedSnap = Object.keys(snap).reduce<Partial<TruncatedSnap>>(
    (serialized, key) => {
      if (TRUNCATED_SNAP_PROPERTIES.has(key as any)) {
        serialized[key as keyof TruncatedSnap] = snap[
          key as keyof TruncatedSnap
        ] as any;
      }

      return serialized;
    },
    {},
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return truncatedSnap as TruncatedSnap;
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
  #closeAllConnections: CloseAllConnectionsFunction;

  #dynamicPermissions: string[];

  #environmentEndowmentPermissions: string[];

  #excludedPermissions: Record<string, string>;

  #featureFlags: FeatureFlags;

  #fetchFunction: typeof fetch;

  #idleTimeCheckInterval: number;

  #maxIdleTime: number;

  // This property cannot be hash private yet because of tests.
  private readonly maxRequestTime: number;

  #detectSnapLocation: typeof detectSnapLocation;

  #snapsRuntimeData: Map<ValidatedSnapId, SnapRuntimeData>;

  #rollbackSnapshots: Map<SnapId, RollbackSnapshot>;

  #timeoutForLastRequestStatus?: number;

  #statusMachine!: StateMachine.Machine<
    StatusContext,
    StatusEvents,
    StatusStates
  >;

  constructor({
    closeAllConnections,
    messenger,
    state,
    dynamicPermissions = ['eth_accounts'],
    environmentEndowmentPermissions = [],
    excludedPermissions = {},
    idleTimeCheckInterval = inMilliseconds(5, Duration.Second),
    maxIdleTime = inMilliseconds(30, Duration.Second),
    maxRequestTime = inMilliseconds(60, Duration.Second),
    fetchFunction = globalThis.fetch.bind(globalThis),
    featureFlags = {},
    detectSnapLocation: detectSnapLocationFunction = detectSnapLocation,
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
                  status: SnapStatus.Stopped,
                };
              })
              .reduce((memo: Record<ValidatedSnapId, Snap>, snap) => {
                memo[snap.id] = snap;
                return memo;
              }, {});
          },
          anonymous: false,
        },
      },
      name,
      state: {
        ...defaultState,
        ...state,
      },
    });

    this.#closeAllConnections = closeAllConnections;
    this.#dynamicPermissions = dynamicPermissions;
    this.#environmentEndowmentPermissions = environmentEndowmentPermissions;
    this.#excludedPermissions = excludedPermissions;
    this.#featureFlags = featureFlags;
    this.#fetchFunction = fetchFunction;
    this.#idleTimeCheckInterval = idleTimeCheckInterval;
    this.#maxIdleTime = maxIdleTime;
    this.maxRequestTime = maxRequestTime;
    this.#detectSnapLocation = detectSnapLocationFunction;
    this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
    this._onOutboundRequest = this._onOutboundRequest.bind(this);
    this._onOutboundResponse = this._onOutboundResponse.bind(this);
    this.#rollbackSnapshots = new Map();
    this.#snapsRuntimeData = new Map();
    this.#pollForLastRequestStatus();

    /* eslint-disable @typescript-eslint/unbound-method */
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
    /* eslint-enable @typescript-eslint/unbound-method */

    this.messagingSystem.subscribe('SnapController:snapInstalled', ({ id }) => {
      this.#callLifecycleHook(id, HandlerType.OnInstall).catch((error) => {
        logError(
          `Error when calling \`onInstall\` lifecycle hook for snap "${id}": ${getErrorMessage(
            error,
          )}`,
        );
      });
    });

    this.messagingSystem.subscribe('SnapController:snapUpdated', ({ id }) => {
      this.#callLifecycleHook(id, HandlerType.OnUpdate).catch((error) => {
        logError(
          `Error when calling \`onUpdate\` lifecycle hook for snap "${id}": ${getErrorMessage(
            error,
          )}`,
        );
      });
    });

    this.#initializeStateMachine();
    this.#registerMessageHandlers();

    Object.values(state?.snaps ?? {}).forEach((snap) =>
      this.#setupRuntime(snap.id, {
        sourceCode: snap.sourceCode,
        state: state?.snapStates?.[snap.id] ?? null,
      }),
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
  #initializeStateMachine() {
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
            [SnapStatusEvents.Stop]: SnapStatus.Stopped,
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
            [SnapStatusEvents.Update]: SnapStatus.Updating,
          },
        },
      },
    };
    this.#statusMachine = createMachine(statusConfig);
    validateMachine(this.#statusMachine);
  }

  /**
   * Constructor helper for registering the controller's messaging system
   * actions.
   */
  #registerMessageHandlers(): void {
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
      async (...args) => this.getSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:handleRequest`,
      async (...args) => this.handleRequest(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:has`,
      (...args) => this.has(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateBlockedSnaps`,
      async () => this.updateBlockedSnaps(),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:updateSnapState`,
      async (...args) => this.updateSnapState(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:enable`,
      (...args) => this.enableSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:disable`,
      async (...args) => this.disableSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:remove`,
      async (...args) => this.removeSnap(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getPermitted`,
      (...args) => this.getPermittedSnaps(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:install`,
      async (...args) => this.installSnaps(...args),
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

    this.messagingSystem.registerActionHandler(
      `${controllerName}:getRegistryMetadata`,
      async (...args) => this.getRegistryMetadata(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:disconnectOrigin`,
      (...args) => this.removeSnapFromSubject(...args),
    );

    this.messagingSystem.registerActionHandler(
      `${controllerName}:revokeDynamicPermissions`,
      (...args) => this.revokeDynamicSnapPermissions(...args),
    );
  }

  #pollForLastRequestStatus() {
    this.#timeoutForLastRequestStatus = setTimeout(() => {
      this.#stopSnapsLastRequestPastMax().catch((error) => {
        // TODO: Decide how to handle errors.
        logError(error);
      });

      this.#pollForLastRequestStatus();
    }, this.#idleTimeCheckInterval) as unknown as number;
  }

  /**
   * Checks all installed snaps against the block list and
   * blocks/unblocks snaps as appropriate. See {@link SnapController.blockSnap}
   * for more information.
   */
  async updateBlockedSnaps(): Promise<void> {
    await this.messagingSystem.call('SnapsRegistry:update');

    const blockedSnaps = await this.messagingSystem.call(
      'SnapsRegistry:get',
      Object.values(this.state.snaps).reduce<SnapsRegistryRequest>(
        (blockListArg, snap) => {
          blockListArg[snap.id] = {
            version: snap.version,
            checksum: snap.manifest.source.shasum,
          };
          return blockListArg;
        },
        {},
      ),
    );

    await Promise.all(
      Object.entries(blockedSnaps).map(async ([snapId, { status, reason }]) => {
        if (status === SnapsRegistryStatus.Blocked) {
          return this.#blockSnap(snapId as ValidatedSnapId, reason);
        }

        return this.#unblockSnap(snapId as ValidatedSnapId);
      }),
    );
  }

  /**
   * Blocks an installed snap and prevents it from being started again. Emits
   * {@link SnapBlocked}. Does nothing if the snap is not installed.
   *
   * @param snapId - The snap to block.
   * @param blockedSnapInfo - Information detailing why the snap is blocked.
   */
  async #blockSnap(
    snapId: ValidatedSnapId,
    blockedSnapInfo?: BlockReason,
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
      logError(
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
  #unblockSnap(snapId: ValidatedSnapId) {
    if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
      return;
    }

    this.update((state: any) => {
      state.snaps[snapId].blocked = false;
      delete state.snaps[snapId].blockInformation;
    });

    this.messagingSystem.publish(`${controllerName}:snapUnblocked`, snapId);
  }

  async #assertIsInstallAllowed(
    snapId: ValidatedSnapId,
    snapInfo: SnapsRegistryInfo,
  ) {
    const results = await this.messagingSystem.call('SnapsRegistry:get', {
      [snapId]: snapInfo,
    });
    const result = results[snapId];
    if (result.status === SnapsRegistryStatus.Blocked) {
      throw new Error(
        `Cannot install version "${
          snapInfo.version
        }" of snap "${snapId}": The version is blocked. ${
          result.reason?.explanation ?? ''
        }`,
      );
    } else if (
      this.#featureFlags.requireAllowlist &&
      result.status !== SnapsRegistryStatus.Verified
    ) {
      throw new Error(
        `Cannot install version "${snapInfo.version}" of snap "${snapId}": The snap is not on the allow list.`,
      );
    }
  }

  async #stopSnapsLastRequestPastMax() {
    const entries = [...this.#snapsRuntimeData.entries()];
    return Promise.all(
      entries
        .filter(
          ([_snapId, runtime]) =>
            runtime.activeReferences === 0 &&
            runtime.pendingInboundRequests.length === 0 &&
            // lastRequest should always be set here but TypeScript wants this check
            runtime.lastRequest &&
            this.#maxIdleTime &&
            timeSince(runtime.lastRequest) > this.#maxIdleTime,
        )
        .map(async ([snapId]) => this.stopSnap(snapId, SnapStatusEvents.Stop)),
    );
  }

  _onUnhandledSnapError(snapId: SnapId, error: SnapErrorJson) {
    this.stopSnap(snapId as ValidatedSnapId, SnapStatusEvents.Crash)
      .then(() => this.addSnapError(error))
      .catch((stopSnapError) => {
        // TODO: Decide how to handle errors.
        logError(stopSnapError);
      });
  }

  _onOutboundRequest(snapId: SnapId) {
    const runtime = this.#getRuntimeExpect(snapId as ValidatedSnapId);
    // Ideally we would only pause the pending request that is making the outbound request
    // but right now we don't have a way to know which request initiated the outbound request
    runtime.pendingInboundRequests
      .filter((pendingRequest) => pendingRequest.timer.status === 'running')
      .forEach((pendingRequest) => pendingRequest.timer.pause());
    runtime.pendingOutboundRequests += 1;
  }

  _onOutboundResponse(snapId: SnapId) {
    const runtime = this.#getRuntimeExpect(snapId as ValidatedSnapId);
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
  #transition(
    snapId: ValidatedSnapId,
    event: StatusEvents | StatusEvents['type'],
  ) {
    const { interpreter } = this.#getRuntimeExpect(snapId);
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
  async startSnap(snapId: ValidatedSnapId): Promise<void> {
    const snap = this.state.snaps[snapId];

    if (snap.enabled === false) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }

    await this.#startSnap({
      snapId,
      sourceCode: snap.sourceCode,
    });
  }

  /**
   * Enables the given snap. A snap can only be started if it is enabled. A snap
   * can only be enabled if it isn't blocked.
   *
   * @param snapId - The id of the Snap to enable.
   */
  enableSnap(snapId: ValidatedSnapId): void {
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
  async disableSnap(snapId: ValidatedSnapId): Promise<void> {
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
    snapId: ValidatedSnapId,
    statusEvent:
      | SnapStatusEvents.Stop
      | SnapStatusEvents.Crash = SnapStatusEvents.Stop,
  ): Promise<void> {
    const runtime = this.#getRuntime(snapId);
    if (!runtime) {
      throw new Error(`The snap "${snapId}" is not running.`);
    }

    // Reset request tracking
    runtime.lastRequest = null;
    runtime.pendingInboundRequests = [];
    runtime.pendingOutboundRequests = 0;
    try {
      if (this.isRunning(snapId)) {
        this.#closeAllConnections(snapId);
        await this.#terminateSnap(snapId);
      }
    } finally {
      if (this.isRunning(snapId)) {
        this.#transition(snapId, statusEvent);
      }
    }
  }

  /**
   * Terminates the specified snap and emits the `snapTerminated` event.
   *
   * @param snapId - The snap to terminate.
   */
  async #terminateSnap(snapId: ValidatedSnapId) {
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
  isRunning(snapId: ValidatedSnapId): boolean {
    return this.getExpect(snapId).status === 'running';
  }

  /**
   * Returns whether the given snap has been added to state.
   *
   * @param snapId - The id of the Snap to check for.
   * @returns `true` if the snap exists in the controller state, otherwise `false`.
   */
  has(snapId: ValidatedSnapId): boolean {
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
    return this.state.snaps[snapId as ValidatedSnapId];
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
  getExpect(snapId: ValidatedSnapId): Snap {
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
  getTruncated(snapId: ValidatedSnapId): TruncatedSnap | null {
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
  getTruncatedExpect(snapId: ValidatedSnapId): TruncatedSnap {
    return truncateSnap(this.getExpect(snapId));
  }

  /**
   * Updates the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   */
  async updateSnapState(
    snapId: ValidatedSnapId,
    newSnapState: string,
  ): Promise<void> {
    this.update((state) => {
      state.snapStates[snapId] = newSnapState;
    });
  }

  /**
   * Clears the state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be cleared.
   */
  clearSnapState(snapId: ValidatedSnapId) {
    this.update((state) => {
      state.snapStates[snapId] = null;
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
   * Removes an error by internalID from the SnapControllers state.
   *
   * @param internalID - The internal error ID to remove on the SnapController.
   */
  removeSnapError(internalID: string) {
    this.update((state: any) => {
      delete state.snapErrors[internalID];
    });
  }

  /**
   * Clears all errors from the SnapControllers state.
   */
  clearSnapErrors() {
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
  async getSnapState(snapId: ValidatedSnapId): Promise<Json> {
    const state = this.state.snapStates[snapId];
    return state ?? null;
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all snap providers.
   */
  async clearState() {
    const snapIds = Object.keys(this.state.snaps);
    snapIds.forEach((snapId) => {
      this.#closeAllConnections(snapId);
    });

    await this.messagingSystem.call('ExecutionService:terminateAllSnaps');
    snapIds.forEach((snapId) => this.#revokeAllSnapPermissions(snapId));

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
  async removeSnap(snapId: ValidatedSnapId): Promise<void> {
    return this.removeSnaps([snapId]);
  }

  /**
   * Stops the given snaps, removes them from state, and clears all associated
   * permissions, handlers, and listeners.
   *
   * @param snapIds - The ids of the Snaps.
   */
  async removeSnaps(snapIds: ValidatedSnapId[]): Promise<void> {
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
        this.#revokeAllSnapPermissions(snapId);

        this.#removeSnapFromSubjects(snapId);

        this.#snapsRuntimeData.delete(snapId);

        this.update((state: any) => {
          delete state.snaps[snapId];
          delete state.snapStates[snapId];
        });

        this.messagingSystem.publish(`SnapController:snapRemoved`, truncated);
      }),
    );
  }

  /**
   * Removes a snap's permission (caveat) from the specified subject.
   *
   * @param origin - The origin from which to remove the snap.
   * @param snapId - The id of the snap to remove.
   */
  removeSnapFromSubject(origin: string, snapId: ValidatedSnapId) {
    const subjectPermissions = this.messagingSystem.call(
      'PermissionController:getPermissions',
      origin,
    ) as SubjectPermissions<PermissionConstraint>;

    const snapIdsCaveat = subjectPermissions?.[
      WALLET_SNAP_PERMISSION_KEY
    ]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds) as
      | Caveat<string, Json>
      | undefined;

    if (!snapIdsCaveat) {
      return;
    }

    const caveatHasSnap = Boolean(
      (snapIdsCaveat.value as Record<string, Json>)?.[snapId],
    );
    if (caveatHasSnap) {
      const newCaveatValue = {
        ...(snapIdsCaveat.value as Record<string, Json>),
      };
      delete newCaveatValue[snapId];
      if (Object.keys(newCaveatValue).length > 0) {
        this.messagingSystem.call(
          'PermissionController:updateCaveat',
          origin,
          WALLET_SNAP_PERMISSION_KEY,
          SnapCaveatType.SnapIds,
          newCaveatValue,
        );
      } else {
        this.messagingSystem.call('PermissionController:revokePermissions', {
          [origin]: [WALLET_SNAP_PERMISSION_KEY],
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
  revokeDynamicSnapPermissions(
    snapId: string,
    permissionNames: NonEmptyArray<string>,
  ) {
    assert(
      permissionNames.every((permissionName) =>
        this.#dynamicPermissions.includes(permissionName),
      ),
      'Non-dynamic permissions cannot be revoked',
    );
    this.messagingSystem.call('PermissionController:revokePermissions', {
      [snapId]: permissionNames,
    });
  }

  /**
   * Removes a snap's permission (caveat) from all subjects.
   *
   * @param snapId - The id of the Snap.
   */
  #removeSnapFromSubjects(snapId: ValidatedSnapId) {
    const subjects = this.messagingSystem.call(
      'PermissionController:getSubjectNames',
    );
    for (const subject of subjects) {
      this.removeSnapFromSubject(subject, snapId);
    }
  }

  /**
   * Safely revokes all permissions granted to a Snap.
   *
   * @param snapId - The snap ID.
   */
  #revokeAllSnapPermissions(snapId: string) {
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
   * Handles incrementing the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced.
   */
  incrementActiveReferences(snapId: ValidatedSnapId) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.activeReferences += 1;
  }

  /**
   * Handles decrement the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced..
   */
  decrementActiveReferences(snapId: ValidatedSnapId) {
    const runtime = this.#getRuntimeExpect(snapId);
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
  getPermittedSnaps(origin: string): InstallSnapsResult {
    const permissions =
      this.messagingSystem.call(
        'PermissionController:getPermissions',
        origin,
      ) ?? {};
    const snaps =
      permissions[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find(
        (caveat) => caveat.type === SnapCaveatType.SnapIds,
      )?.value ?? {};
    return Object.keys(snaps).reduce<InstallSnapsResult>(
      (permittedSnaps, snapId) => {
        const snap = this.get(snapId);
        const truncatedSnap = this.getTruncated(snapId as ValidatedSnapId);

        if (truncatedSnap && snap?.status !== SnapStatus.Installing) {
          permittedSnaps[snapId] = truncatedSnap;
        }
        return permittedSnaps;
      },
      {},
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
  async installSnaps(
    origin: string,
    requestedSnaps: RequestedSnapPermissions,
  ): Promise<InstallSnapsResult> {
    const result: InstallSnapsResult = {};

    const snapIds = Object.keys(requestedSnaps);

    const pendingUpdates = [];
    const pendingInstalls = [];

    try {
      for (const [snapId, { version: rawVersion }] of Object.entries(
        requestedSnaps,
      )) {
        assertIsValidSnapId(snapId);

        const [error, version] = resolveVersionRange(rawVersion);

        if (error) {
          throw ethErrors.rpc.invalidParams(
            `The "version" field must be a valid SemVer version range if specified. Received: "${rawVersion}".`,
          );
        }

        const location = this.#detectSnapLocation(snapId, {
          versionRange: version,
          fetch: this.#fetchFunction,
          allowLocal: this.#featureFlags.allowLocalSnaps,
        });

        // Existing snaps may need to be updated, unless they should be re-installed (e.g. local snaps)
        // Everything else is treated as an install
        const isUpdate = this.has(snapId) && !location.shouldAlwaysReload;

        if (isUpdate && this.#isValidUpdate(snapId, version)) {
          pendingUpdates.push(snapId);
          let rollbackSnapshot = this.#getRollbackSnapshot(snapId);
          if (rollbackSnapshot === undefined) {
            rollbackSnapshot = this.#createRollbackSnapshot(snapId);
            rollbackSnapshot.newVersion = version;
          } else {
            throw new Error('This snap is already being updated.');
          }
        } else if (!isUpdate) {
          pendingInstalls.push(snapId);
        }

        result[snapId] = await this.processRequestedSnap(
          origin,
          snapId,
          location,
          version,
        );
      }
      snapIds.forEach((snapId) => this.#rollbackSnapshots.delete(snapId));
    } catch (error) {
      const installed = pendingInstalls.filter((snapId) => this.has(snapId));
      await this.removeSnaps(installed);
      const snapshottedSnaps = [...this.#rollbackSnapshots.keys()];
      const snapsToRollback = pendingUpdates.filter((snapId) =>
        snapshottedSnaps.includes(snapId),
      );
      await this.#rollbackSnaps(snapsToRollback);

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
  private async processRequestedSnap(
    origin: string,
    snapId: ValidatedSnapId,
    location: SnapLocation,
    versionRange: SemVerRange,
  ): Promise<ProcessSnapResult> {
    const existingSnap = this.getTruncated(snapId);

    // For devX we always re-install local snaps.
    if (existingSnap && !location.shouldAlwaysReload) {
      if (satisfiesVersionRange(existingSnap.version, versionRange)) {
        return existingSnap;
      }

      if (this.#featureFlags.dappsCanUpdateSnaps === true) {
        return await this.updateSnap(origin, snapId, location, versionRange);
      }
      throw ethErrors.rpc.invalidParams(
        `Version mismatch with already installed snap. ${snapId}@${existingSnap.version} doesn't satisfy requested version ${versionRange}.`,
      );
    }

    let pendingApproval = this.#createApproval({
      origin,
      snapId,
      type: SNAP_APPROVAL_INSTALL,
    });

    // Existing snaps must be stopped before overwriting
    if (existingSnap && this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }

    // Existing snaps that should be re-installed should not maintain their existing permissions
    if (existingSnap && location.shouldAlwaysReload) {
      this.#revokeAllSnapPermissions(snapId);
    }

    try {
      const { sourceCode } = await this.#add({
        origin,
        id: snapId,
        location,
        versionRange,
      });

      await this.authorize(snapId, pendingApproval);

      pendingApproval = this.#createApproval({
        origin,
        snapId,
        type: SNAP_APPROVAL_RESULT,
      });

      await this.#startSnap({
        snapId,
        sourceCode,
      });

      const truncated = this.getTruncatedExpect(snapId);

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_INSTALL,
      });

      this.messagingSystem.publish(`SnapController:snapInstalled`, truncated);

      return truncated;
    } catch (error) {
      logError(`Error when adding ${snapId}.`, error);

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_INSTALL,
        error: error instanceof Error ? error.message : error.toString(),
      });

      throw error;
    }
  }

  #createApproval({
    origin,
    snapId,
    type,
  }: {
    origin: string;
    snapId: ValidatedSnapId;
    type: string;
  }): PendingApproval {
    const id = nanoid();
    const promise = this.messagingSystem.call(
      'ApprovalController:addRequest',
      {
        origin,
        id,
        type,
        requestData: {
          // Mirror previous installation metadata
          metadata: { id, origin: snapId, dappOrigin: origin },
          snapId,
        },
        requestState: {
          loading: true,
        },
      },
      true,
    );

    return { id, promise };
  }

  #updateApproval(id: string, requestState: Record<string, Json>) {
    try {
      this.messagingSystem.call('ApprovalController:updateRequestState', {
        id,
        requestState,
      });
    } catch {
      // Do nothing
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
   * @returns The snap metadata if updated, `null` otherwise.
   */
  async updateSnap(
    origin: string,
    snapId: ValidatedSnapId,
    location: SnapLocation,
    newVersionRange: string = DEFAULT_REQUESTED_SNAP_VERSION,
  ): Promise<TruncatedSnap> {
    if (!isValidSemVerRange(newVersionRange)) {
      throw new Error(
        `Received invalid snap version range: "${newVersionRange}".`,
      );
    }

    let pendingApproval = this.#createApproval({
      origin,
      snapId,
      type: SNAP_APPROVAL_UPDATE,
    });

    try {
      const snap = this.getExpect(snapId);

      const newSnap = await this.#fetchSnap(snapId, location);

      const newVersion = newSnap.manifest.result.version;
      if (!gtVersion(newVersion, snap.version)) {
        throw ethErrors.rpc.invalidParams(
          `Snap "${snapId}@${snap.version}" is already installed. Couldn't update to a version inside requested "${newVersionRange}" range.`,
        );
      }

      if (!satisfiesVersionRange(newVersion, newVersionRange)) {
        throw new Error(
          `Version mismatch. Manifest for "${snapId}" specifies version "${newVersion}" which doesn't satisfy requested version range "${newVersionRange}".`,
        );
      }

      await this.#assertIsInstallAllowed(snapId, {
        version: newVersion,
        checksum: newSnap.manifest.result.source.shasum,
      });

      const processedPermissions = processSnapPermissions(
        newSnap.manifest.result.initialPermissions,
      );

      this.#validateSnapPermissions(processedPermissions);

      const { newPermissions, unusedPermissions, approvedPermissions } =
        this.#calculatePermissionsChange(snapId, processedPermissions);

      this.#updateApproval(pendingApproval.id, {
        permissions: newPermissions,
        newVersion: newSnap.manifest.result.version,
        newPermissions,
        approvedPermissions,
        unusedPermissions,
        loading: false,
      });

      const { permissions: approvedNewPermissions, ...requestData } =
        (await pendingApproval.promise) as PermissionsRequest;

      pendingApproval = this.#createApproval({
        origin,
        snapId,
        type: SNAP_APPROVAL_RESULT,
      });

      if (this.isRunning(snapId)) {
        await this.stopSnap(snapId, SnapStatusEvents.Stop);
      }

      this.#transition(snapId, SnapStatusEvents.Update);

      this.#set({
        origin,
        id: snapId,
        manifest: newSnap.manifest,
        files: newSnap.files,
        isUpdate: true,
      });

      const unusedPermissionsKeys = Object.keys(unusedPermissions);
      if (isNonEmptyArray(unusedPermissionsKeys)) {
        this.messagingSystem.call('PermissionController:revokePermissions', {
          [snapId]: unusedPermissionsKeys,
        });
      }

      if (isNonEmptyArray(Object.keys(approvedNewPermissions))) {
        this.messagingSystem.call('PermissionController:grantPermissions', {
          approvedPermissions: approvedNewPermissions,
          subject: { origin: snapId },
          requestData,
        });
      }

      const rollbackSnapshot = this.#getRollbackSnapshot(snapId);
      if (rollbackSnapshot !== undefined) {
        rollbackSnapshot.permissions.revoked = unusedPermissions;
        rollbackSnapshot.permissions.granted = Object.keys(
          approvedNewPermissions,
        );
        rollbackSnapshot.permissions.requestData = requestData;
      }

      const normalizedSourcePath = normalizeRelative(
        newSnap.manifest.result.source.location.npm.filePath,
      );

      const sourceCode = newSnap.files
        .find((file) => file.path === normalizedSourcePath)
        ?.toString();

      assert(
        typeof sourceCode === 'string' && sourceCode.length > 0,
        `Invalid source code for snap "${snapId}".`,
      );

      try {
        await this.#startSnap({ snapId, sourceCode });
      } catch {
        throw new Error(`Snap ${snapId} crashed with updated source code.`);
      }

      const truncatedSnap = this.getTruncatedExpect(snapId);
      this.messagingSystem.publish(
        'SnapController:snapUpdated',
        truncatedSnap,
        snap.version,
      );

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_UPDATE,
      });

      return truncatedSnap;
    } catch (error) {
      logError(`Error when updating ${snapId},`, error);

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        error: error instanceof Error ? error.message : error.toString(),
        type: SNAP_APPROVAL_UPDATE,
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
   */
  async getRegistryMetadata(
    snapId: ValidatedSnapId,
  ): Promise<SnapsRegistryMetadata | null> {
    return await this.messagingSystem.call('SnapsRegistry:getMetadata', snapId);
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
  async #add(args: AddSnapArgs): Promise<PersistedSnap> {
    const { id: snapId, location, versionRange } = args;

    this.#setupRuntime(snapId, { sourceCode: null, state: null });
    const runtime = this.#getRuntimeExpect(snapId);
    if (!runtime.installPromise) {
      log(`Adding snap: ${snapId}`);

      // If fetching and setting the snap succeeds, this property will be set
      // to null in the authorize() method.
      runtime.installPromise = (async () => {
        const fetchedSnap = await this.#fetchSnap(snapId, location);
        const manifest = fetchedSnap.manifest.result;
        if (!satisfiesVersionRange(manifest.version, versionRange)) {
          throw new Error(
            `Version mismatch. Manifest for "${snapId}" specifies version "${manifest.version}" which doesn't satisfy requested version range "${versionRange}".`,
          );
        }
        await this.#assertIsInstallAllowed(snapId, {
          version: manifest.version,
          checksum: manifest.source.shasum,
        });

        return this.#set({
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

  async #startSnap(snapData: { snapId: ValidatedSnapId; sourceCode: string }) {
    const { snapId } = snapData;
    if (this.isRunning(snapId)) {
      throw new Error(`Snap "${snapId}" is already started.`);
    }

    try {
      const result = await this.#executeWithTimeout(
        snapId,
        this.messagingSystem.call('ExecutionService:executeSnap', {
          ...snapData,
          endowments: await this.#getEndowments(snapId),
        }),
      );
      this.#transition(snapId, SnapStatusEvents.Start);
      return result;
    } catch (error) {
      await this.#terminateSnap(snapId);
      throw error;
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
  async #getEndowments(snapId: string): Promise<string[]> {
    let allEndowments: string[] = [];

    for (const permissionName of this.#environmentEndowmentPermissions) {
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
      // This is a bug in TypeScript: https://github.com/microsoft/TypeScript/issues/48313
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      DEFAULT_ENDOWMENTS.length + allEndowments.length
    ) {
      logError(
        `Duplicate endowments found for ${snapId}. Default endowments should not be requested.`,
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
  #set(args: SetSnapArgs): PersistedSnap {
    const { id: snapId, origin, manifest, files, isUpdate = false } = args;

    assertIsSnapManifest(manifest.result);
    const { version } = manifest.result;

    const normalizedSourcePath = normalizeRelative(
      manifest.result.source.location.npm.filePath,
    );

    const { iconPath } = manifest.result.source.location.npm;
    const normalizedIconPath = iconPath && normalizeRelative(iconPath);

    const sourceCode = files
      .find((file) => file.path === normalizedSourcePath)
      ?.toString();

    const svgIcon = normalizedIconPath
      ? files.find((file) => file.path === normalizedIconPath)
      : undefined;

    assert(
      typeof sourceCode === 'string' && sourceCode.length > 0,
      `Invalid source code for snap "${snapId}".`,
    );

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

      id: snapId,
      initialPermissions: manifest.result.initialPermissions,
      manifest: manifest.result,
      status: this.#statusMachine.config.initial as StatusStates['value'],
      sourceCode,
      version,
      versionHistory,
    };
    // If the snap was blocked, it isn't any longer
    delete snap.blockInformation;

    // store the snap back in state
    const { inversePatches } = this.update((state: any) => {
      state.snaps[snapId] = snap;
    });

    // checking for isUpdate here as this function is also used in
    // the install flow, we do not care to create snapshots for installs
    if (isUpdate) {
      const rollbackSnapshot = this.#getRollbackSnapshot(snapId);
      if (rollbackSnapshot !== undefined) {
        rollbackSnapshot.statePatches = inversePatches;
      }
    }

    this.messagingSystem.publish(
      `SnapController:snapAdded`,
      snap,
      svgIcon?.toString(),
    );
    return { ...snap, sourceCode };
  }

  /**
   * Fetches the manifest and source code of a snap.
   *
   * This function is not hash private yet because of tests.
   *
   * @param snapId - The id of the Snap.
   * @param location - Source from which snap will be fetched.
   * @returns A tuple of the Snap manifest object and the Snap source code.
   */
  async #fetchSnap(
    snapId: ValidatedSnapId,
    location: SnapLocation,
  ): Promise<FetchSnapResult> {
    try {
      const manifest = await location.manifest();
      const sourceCode = await location.fetch(
        manifest.result.source.location.npm.filePath,
      );
      const { iconPath } = manifest.result.source.location.npm;
      const svgIcon = iconPath ? await location.fetch(iconPath) : undefined;

      const files = [sourceCode];
      if (svgIcon) {
        files.push(svgIcon);
      }

      validateFetchedSnap({ manifest, sourceCode, svgIcon });

      return { manifest, files, location };
    } catch (error) {
      throw new Error(
        `Failed to fetch snap "${snapId}": ${getErrorMessage(error)}.`,
      );
    }
  }

  #validateSnapPermissions(
    processedPermissions: Record<string, Pick<PermissionConstraint, 'caveats'>>,
  ) {
    const permissionKeys = Object.keys(processedPermissions);
    const handlerPermissions = Array.from(
      new Set(Object.values(handlerEndowments)),
    );

    assert(
      permissionKeys.some((key) => handlerPermissions.includes(key)),
      `A snap must request at least one of the following permissions: ${handlerPermissions.join(
        ', ',
      )}.`,
    );

    const excludedPermissionErrors = permissionKeys.reduce<string[]>(
      (errors, permission) => {
        if (hasProperty(this.#excludedPermissions, permission)) {
          errors.push(this.#excludedPermissions[permission]);
        }

        return errors;
      },
      [],
    );

    assert(
      excludedPermissionErrors.length === 0,
      `One or more permissions are not allowed:\n${excludedPermissionErrors.join(
        '\n',
      )}`,
    );
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
  private async authorize(
    snapId: ValidatedSnapId,
    pendingApproval: PendingApproval,
  ): Promise<void> {
    log(`Authorizing snap: ${snapId}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapId];
    const { initialPermissions } = snap;

    try {
      const processedPermissions = processSnapPermissions(initialPermissions);

      this.#validateSnapPermissions(processedPermissions);

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        permissions: processedPermissions,
      });

      const { permissions: approvedPermissions, ...requestData } =
        (await pendingApproval.promise) as PermissionsRequest;

      if (isNonEmptyArray(Object.keys(approvedPermissions))) {
        this.messagingSystem.call('PermissionController:grantPermissions', {
          approvedPermissions,
          subject: { origin: snapId },
          requestData,
        });
      }
    } finally {
      const runtime = this.#getRuntimeExpect(snapId);
      runtime.installPromise = null;
    }
  }

  destroy() {
    super.destroy();

    if (this.#timeoutForLastRequestStatus) {
      clearTimeout(this.#timeoutForLastRequestStatus);
    }

    /* eslint-disable @typescript-eslint/unbound-method */
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
    /* eslint-enable @typescript-eslint/unbound-method */
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
    request: rawRequest,
  }: SnapRpcHookArgs & { snapId: ValidatedSnapId }): Promise<unknown> {
    const request = {
      jsonrpc: '2.0',
      id: nanoid(),
      ...rawRequest,
    };

    assertIsJsonRpcRequest(request);

    const permissionName = handlerEndowments[handlerType];
    const hasPermission = this.messagingSystem.call(
      'PermissionController:hasPermission',
      snapId,
      permissionName,
    );

    if (!hasPermission) {
      throw new Error(
        `Snap "${snapId}" is not permitted to use "${permissionName}".`,
      );
    }

    if (permissionName === SnapEndowments.Rpc) {
      const subject = this.messagingSystem.call(
        'SubjectMetadataController:getSubjectMetadata',
        origin,
      );
      const isSnap = subject?.subjectType === SubjectType.Snap;

      const permissions = this.messagingSystem.call(
        'PermissionController:getPermissions',
        snapId,
      );

      const rpcPermission = permissions?.[SnapEndowments.Rpc];
      assert(rpcPermission);

      const origins = getRpcCaveatOrigins(rpcPermission);
      assert(origins);

      if ((isSnap && !origins.snaps) || (!isSnap && !origins.dapps)) {
        throw new Error(
          `Snap "${snapId}" is not permitted to handle JSON-RPC requests from "${origin}".`,
        );
      }
    }

    const handler = await this.#getRpcRequestHandler(snapId);
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
  #getRpcRequestHandler(snapId: ValidatedSnapId): SnapRpcHook {
    const runtime = this.#getRuntimeExpect(snapId);
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

      if (!this.isRunning(snapId)) {
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

      const timer = new Timer(this.maxRequestTime);
      this.#recordSnapRpcRequestStart(snapId, request.id, timer);

      const handleRpcRequestPromise = this.messagingSystem.call(
        'ExecutionService:handleRpcRequest',
        snapId,
        { origin, handler: handlerType, request },
      );

      // This will either get the result or reject due to the timeout.
      try {
        const result = await this.#executeWithTimeout(
          snapId,
          handleRpcRequestPromise,
          timer,
        );
        this.#recordSnapRpcRequestFinish(snapId, request.id);
        return result;
      } catch (error) {
        await this.stopSnap(snapId, SnapStatusEvents.Crash);
        throw error;
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
  async #executeWithTimeout<PromiseValue>(
    snapId: ValidatedSnapId,
    promise: Promise<PromiseValue>,
    timer?: Timer,
  ): Promise<PromiseValue> {
    const isLongRunning = this.messagingSystem.call(
      'PermissionController:hasPermission',
      snapId,
      SnapEndowments.LongRunning,
    );

    // Long running snaps have timeouts disabled
    if (isLongRunning) {
      logWarning(
        `${SnapEndowments.LongRunning} will soon be deprecated. For more information please see https://github.com/MetaMask/snaps-monorepo/issues/945.`,
      );
      return promise;
    }

    const result = await withTimeout(promise, timer ?? this.maxRequestTime);
    if (result === hasTimedOut) {
      throw new Error('The request timed out.');
    }
    return result;
  }

  #recordSnapRpcRequestStart(
    snapId: ValidatedSnapId,
    requestId: unknown,
    timer: Timer,
  ) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.pendingInboundRequests.push({ requestId, timer });
    runtime.lastRequest = null;
  }

  #recordSnapRpcRequestFinish(snapId: ValidatedSnapId, requestId: unknown) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter(
      (request) => request.requestId !== requestId,
    );

    if (runtime.pendingInboundRequests.length === 0) {
      runtime.lastRequest = Date.now();
    }
  }

  /**
   * Retrieves the rollback snapshot of a snap.
   *
   * @param snapId - The snap id.
   * @returns A `RollbackSnapshot` or `undefined` if one doesn't exist.
   */
  #getRollbackSnapshot(snapId: ValidatedSnapId): RollbackSnapshot | undefined {
    return this.#rollbackSnapshots.get(snapId);
  }

  /**
   * Creates a `RollbackSnapshot` that is used to help ensure
   * atomicity in multiple snap updates.
   *
   * @param snapId - The snap id.
   * @throws {@link Error}. If the snap exists before creation or if creation fails.
   * @returns A `RollbackSnapshot`.
   */
  #createRollbackSnapshot(snapId: ValidatedSnapId): RollbackSnapshot {
    assert(
      this.#rollbackSnapshots.get(snapId) === undefined,
      new Error(`Snap "${snapId}" rollback snapshot already exists.`),
    );

    this.#rollbackSnapshots.set(snapId, {
      statePatches: [],
      permissions: { revoked: null, granted: [], requestData: null },
      newVersion: '',
    });

    const newRollbackSnapshot = this.#rollbackSnapshots.get(snapId);

    assert(
      newRollbackSnapshot !== undefined,
      new Error(`Snapshot creation failed for ${snapId}.`),
    );
    return newRollbackSnapshot;
  }

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
  async #rollbackSnap(snapId: ValidatedSnapId) {
    const rollbackSnapshot = this.#getRollbackSnapshot(snapId);
    if (!rollbackSnapshot) {
      throw new Error('A snapshot does not exist for this snap.');
    }

    await this.stopSnap(snapId, SnapStatusEvents.Stop);
    // Always set to stopped even if it wasn't running initially
    if (this.get(snapId)?.status !== SnapStatus.Stopped) {
      this.#transition(snapId, SnapStatusEvents.Stop);
    }

    const { statePatches, permissions } = rollbackSnapshot;

    if (statePatches?.length) {
      this.applyPatches(statePatches);
    }

    // Reset snap status, as we may have been in another state when we stored state patches
    // But now we are 100% in a stopped state
    if (this.get(snapId)?.status !== SnapStatus.Stopped) {
      this.update((state) => {
        state.snaps[snapId].status = SnapStatus.Stopped;
      });
    }

    if (permissions.revoked && Object.keys(permissions.revoked).length) {
      this.messagingSystem.call('PermissionController:grantPermissions', {
        approvedPermissions: permissions.revoked as RequestedPermissions,
        subject: { origin: snapId },
        requestData: permissions.requestData as Record<string, unknown>,
      });
    }

    if (permissions.granted?.length) {
      this.messagingSystem.call('PermissionController:revokePermissions', {
        [snapId]: permissions.granted as NonEmptyArray<string>,
      });
    }

    const truncatedSnap = this.getTruncatedExpect(snapId);

    this.messagingSystem.publish(
      'SnapController:snapRolledback',
      truncatedSnap,
      rollbackSnapshot.newVersion,
    );

    this.#rollbackSnapshots.delete(snapId);
  }

  /**
   * Iterates through an array of snap ids
   * and calls `rollbackSnap` on them.
   *
   * @param snapIds - An array of snap ids.
   */
  async #rollbackSnaps(snapIds: ValidatedSnapId[]) {
    for (const snapId of snapIds) {
      await this.#rollbackSnap(snapId);
    }
  }

  #getRuntime(snapId: ValidatedSnapId): SnapRuntimeData | undefined {
    return this.#snapsRuntimeData.get(snapId);
  }

  #getRuntimeExpect(snapId: ValidatedSnapId): SnapRuntimeData {
    const runtime = this.#getRuntime(snapId);
    assert(
      runtime !== undefined,
      new Error(`Snap "${snapId}" runtime data not found`),
    );
    return runtime;
  }

  #setupRuntime(
    snapId: ValidatedSnapId,
    data: { sourceCode: string | null; state: string | null },
  ) {
    if (this.#snapsRuntimeData.has(snapId)) {
      return;
    }

    const snap = this.get(snapId);
    const interpreter = interpret(this.#statusMachine);
    interpreter.start({
      context: { snapId },
      value:
        snap?.status ??
        (this.#statusMachine.config.initial as StatusStates['value']),
    });

    forceStrict(interpreter);

    this.#snapsRuntimeData.set(snapId, {
      lastRequest: null,
      rpcHandler: null,
      installPromise: null,
      activeReferences: 0,
      pendingInboundRequests: [],
      pendingOutboundRequests: 0,
      interpreter,
      ...data,
    });
  }

  #calculatePermissionsChange(
    snapId: ValidatedSnapId,
    desiredPermissionsSet: RequestedSnapPermissions,
  ): {
    newPermissions: RequestedSnapPermissions;
    unusedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
    approvedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
  } {
    const oldPermissions =
      this.messagingSystem.call(
        'PermissionController:getPermissions',
        snapId,
      ) ?? {};

    const newPermissions = setDiff(desiredPermissionsSet, oldPermissions);
    // TODO(ritave): The assumption that these are unused only holds so long as we do not
    //               permit dynamic permission requests.
    const unusedPermissions = setDiff(oldPermissions, desiredPermissionsSet);

    // It's a Set Intersection of oldPermissions and desiredPermissionsSet
    // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
    const approvedPermissions = setDiff(oldPermissions, unusedPermissions);

    return { newPermissions, unusedPermissions, approvedPermissions };
  }

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
   * @param newVersionRange - The new version range being requsted.
   * @returns `true` if validation checks pass and `false` if they do not.
   */
  #isValidUpdate(
    snapId: ValidatedSnapId,
    newVersionRange: SemVerRange,
  ): boolean {
    const existingSnap = this.getExpect(snapId);

    if (satisfiesVersionRange(existingSnap.version, newVersionRange)) {
      return false;
    }

    if (gtRange(existingSnap.version, newVersionRange)) {
      return false;
    }

    return true;
  }

  /**
   * Call a lifecycle hook on a snap, if the snap has the
   * `endowment:lifecycle-hooks` permission. If the snap does not have the
   * permission, nothing happens.
   *
   * @param snapId - The snap ID.
   * @param handler - The lifecycle hook to call. This should be one of the
   * supported lifecycle hooks.
   * @private
   */
  async #callLifecycleHook(snapId: ValidatedSnapId, handler: HandlerType) {
    const permissionName = handlerEndowments[handler];
    const hasPermission = this.messagingSystem.call(
      'PermissionController:hasPermission',
      snapId,
      permissionName,
    );

    if (!hasPermission) {
      return;
    }

    await this.handleRequest({
      snapId,
      handler,
      origin: '',
      request: {
        jsonrpc: '2.0',
        method: handler,
      },
    });
  }
}
