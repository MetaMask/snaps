import {
  ORIGIN_METAMASK,
  type AddApprovalRequest,
  type UpdateRequestState,
} from '@metamask/approval-controller';
import type {
  ControllerGetStateAction,
  ControllerStateChangeEvent,
} from '@metamask/base-controller';
import { BaseController } from '@metamask/base-controller';
import type { CryptographicFunctions } from '@metamask/key-tree';
import type { Messenger } from '@metamask/messenger';
import type {
  Caveat,
  GetEndowments,
  GetPermissions,
  GetSubjectMetadata,
  AddSubjectMetadata,
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
import { rpcErrors } from '@metamask/rpc-errors';
import type { BlockReason } from '@metamask/snaps-registry';
import {
  WALLET_SNAP_PERMISSION_KEY,
  getMaxRequestTimeCaveat,
  handlerEndowments,
  SnapEndowments,
  getKeyringCaveatOrigins,
  getRpcCaveatOrigins,
  processSnapPermissions,
  getEncryptionEntropy,
  getChainIdsCaveat,
} from '@metamask/snaps-rpc-methods';
import type {
  RequestSnapsParams,
  RequestSnapsResult,
  SnapId,
  ComponentOrElement,
  ContentType,
  OnAssetsLookupResponse,
  OnAssetsConversionResponse,
  OnAssetsConversionArguments,
  AssetConversion,
  OnAssetsLookupArguments,
  OnAssetsMarketDataArguments,
  OnAssetsMarketDataResponse,
  AssetMarketData,
  AssetMetadata,
  EmptyObject,
} from '@metamask/snaps-sdk';
import {
  AuxiliaryFileEncoding,
  getErrorMessage,
  OnAssetsLookupResponseStruct,
} from '@metamask/snaps-sdk';
import type {
  FetchedSnapFiles,
  InitialConnections,
  PersistedSnap,
  Snap,
  SnapManifest,
  SnapPermissions,
  SnapRpcHookArgs,
  StatusContext,
  StatusEvents,
  StatusStates,
  TruncatedSnap,
  TruncatedSnapFields,
} from '@metamask/snaps-utils';
import {
  logWarning,
  getPlatformVersion,
  assertIsSnapManifest,
  assertIsValidSnapId,
  DEFAULT_ENDOWMENTS,
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
  MAX_FILE_SIZE,
  OnSettingsPageResponseStruct,
  isValidUrl,
  OnAssetHistoricalPriceResponseStruct,
  OnAssetsConversionResponseStruct,
  OnAssetsMarketDataResponseStruct,
} from '@metamask/snaps-utils';
import type {
  Json,
  NonEmptyArray,
  SemVerRange,
  CaipAssetType,
  JsonRpcRequest,
  Hex,
  SemVerVersion,
  CaipAssetTypeOrId,
} from '@metamask/utils';
import {
  hexToNumber,
  assert,
  assertIsJsonRpcRequest,
  assertStruct,
  Duration,
  gtRange,
  gtVersion,
  hasProperty,
  inMilliseconds,
  isNonEmptyArray,
  satisfiesVersionRange,
  timeSince,
  createDeferredPromise,
} from '@metamask/utils';
import type { StateMachine } from '@xstate/fsm';
import { createMachine, interpret } from '@xstate/fsm';
import { Mutex } from 'async-mutex';
import type { Patch } from 'immer';
import { nanoid } from 'nanoid';
import { gt, gte } from 'semver';

import {
  ALLOWED_PERMISSIONS,
  CLIENT_ONLY_HANDLERS,
  LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS,
  METAMASK_ORIGIN,
  STATE_DEBOUNCE_TIMEOUT,
} from './constants';
import type { SnapLocation } from './location';
import { detectSnapLocation } from './location';
import type {
  GetMetadata,
  GetResult,
  ResolveVersion,
  SnapsRegistryInfo,
  SnapsRegistryRequest,
  Update,
} from './registry';
import { SnapsRegistryStatus } from './registry';
import { getRunnableSnaps } from './selectors';
import { Timer } from './Timer';
import { forceStrict, validateMachine } from '../fsm';
import type { CreateInterface, GetInterface } from '../interface';
import { log } from '../logging';
import type {
  ExecuteSnapAction,
  ExecutionServiceEvents,
  HandleRpcRequestAction,
  SnapErrorJson,
  TerminateSnapAction,
} from '../services';
import type {
  EncryptionResult,
  ExportableKeyEncryptor,
  KeyDerivationOptions,
} from '../types';
import {
  debouncePersistState,
  fetchSnap,
  hasTimedOut,
  permissionsDiff,
  setDiff,
  throttleTracking,
  withTimeout,
  isTrackableHandler,
  isLocalSnapId,
} from '../utils';

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

export type PreinstalledSnapFile = {
  path: string;
  value: string | Uint8Array;
};

export type PreinstalledSnap = {
  snapId: SnapId;
  manifest: SnapManifest;
  files: PreinstalledSnapFile[];
  removable?: boolean;
  hidden?: boolean;
  hideSnapBranding?: boolean;
};

/**
 * A wrapper type for any data stored during runtime of Snaps.
 * It is not persisted in state as it contains non-serializable data and is only relevant for the
 * current session.
 */
export type SnapRuntimeData = {
  /**
   * A promise that resolves when the Snap has finished installing
   */
  installPromise: null | Promise<PersistedSnap>;

  /**
   * A promise that resolves when the Snap has finished booting
   */
  startPromise: null | Promise<void>;

  /**
   * A promise that resolves when the Snap has finished stopping
   */
  stopPromise: null | Promise<void>;

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
   * The finite state machine interpreter for possible states that the Snap can be in such as
   * stopped, running, blocked
   *
   * @see {@link SnapController:constructor}
   */
  interpreter: StateMachine.Service<StatusContext, StatusEvents, StatusStates>;

  /**
   * Cached encryption key used for state encryption.
   */
  encryptionKey: string | null;

  /**
   * Cached encryption salt used for state encryption.
   */
  encryptionSalt: string | null;

  /**
   * Cached encrypted state of the Snap.
   */
  state?: Record<string, Json> | null;

  /**
   * Cached unencrypted state of the Snap.
   */
  unencryptedState?: Record<string, Json> | null;

  /**
   * A mutex to prevent concurrent state updates.
   */
  stateMutex: Mutex;

  /**
   * A mutex to prevent concurrent state decryption.
   */
  getStateMutex: Mutex;
};

export type SnapError = {
  message: string;
  code: number;
  data?: Json;
};

// Types that probably should be defined elsewhere in prod
type CloseAllConnectionsFunction = (origin: string) => void;
type StoredSnaps = Record<SnapId, Snap>;

export type SnapControllerState = {
  snaps: StoredSnaps;
  snapStates: Record<SnapId, string | null>;
  unencryptedSnapStates: Record<SnapId, string | null>;
};

export type PersistedSnapControllerState = SnapControllerState & {
  snaps: Record<SnapId, PersistedSnap>;
  snapStates: Record<SnapId, string>;
};

type RollbackSnapshot = {
  statePatches: Patch[];
  permissions: {
    revoked?: SubjectPermissions<ValidPermission<string, Caveat<string, any>>>;
    granted?: RequestedPermissions;
    requestData?: Record<string, unknown>;
  };
  previousInitialConnections?: Record<string, EmptyObject> | null;
  newInitialConnections?: Record<string, EmptyObject>;
  newVersion: string;
};

type PendingApproval = {
  id: string;
  promise: Promise<unknown>;
};

// Controller Messenger Actions

/**
 * Initialise the SnapController. This should be called after all controllers
 * are created.
 */
export type SnapControllerInitAction = {
  type: `${typeof controllerName}:init`;
  handler: SnapController['init'];
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
export type UpdateRegistry = {
  type: `${typeof controllerName}:updateRegistry`;
  handler: SnapController['updateRegistry'];
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

export type GetRunnableSnaps = {
  type: `${typeof controllerName}:getRunnableSnaps`;
  handler: SnapController['getRunnableSnaps'];
};

export type StopAllSnaps = {
  type: `${typeof controllerName}:stopAllSnaps`;
  handler: SnapController['stopAllSnaps'];
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

export type DisconnectOrigin = {
  type: `${typeof controllerName}:disconnectOrigin`;
  handler: SnapController['removeSnapFromSubject'];
};

export type RevokeDynamicPermissions = {
  type: `${typeof controllerName}:revokeDynamicPermissions`;
  handler: SnapController['revokeDynamicSnapPermissions'];
};

export type GetSnapFile = {
  type: `${typeof controllerName}:getFile`;
  handler: SnapController['getSnapFile'];
};

export type IsMinimumPlatformVersion = {
  type: `${typeof controllerName}:isMinimumPlatformVersion`;
  handler: SnapController['isMinimumPlatformVersion'];
};

export type SetClientActive = {
  type: `${typeof controllerName}:setClientActive`;
  handler: SnapController['setClientActive'];
};

export type SnapControllerGetStateAction = ControllerGetStateAction<
  typeof controllerName,
  SnapControllerState
>;

export type SnapControllerActions =
  | SnapControllerInitAction
  | ClearSnapState
  | GetSnap
  | GetSnapState
  | HandleSnapRequest
  | HasSnap
  | UpdateRegistry
  | UpdateSnapState
  | EnableSnap
  | DisableSnap
  | RemoveSnap
  | GetPermittedSnaps
  | InstallSnaps
  | GetAllSnaps
  | GetRunnableSnaps
  | IncrementActiveReferences
  | DecrementActiveReferences
  | DisconnectOrigin
  | RevokeDynamicPermissions
  | GetSnapFile
  | SnapControllerGetStateAction
  | StopAllSnaps
  | IsMinimumPlatformVersion
  | SetClientActive;

// Controller Messenger Events

export type SnapStateChange = {
  type: `${typeof controllerName}:stateChange`;
  payload: [SnapControllerState, Patch[]];
};

/**
 * Emitted when an installed snap has been blocked.
 */
export type SnapBlocked = {
  type: `${typeof controllerName}:snapBlocked`;
  payload: [snapId: string, blockedSnapInfo?: BlockReason];
};

/**
 * Emitted when a snap installation or update is started.
 */
export type SnapInstallStarted = {
  type: `${typeof controllerName}:snapInstallStarted`;
  payload: [snapId: SnapId, origin: string, isUpdate: boolean];
};

/**
 * Emitted when a snap installation or update failed.
 */
export type SnapInstallFailed = {
  type: `${typeof controllerName}:snapInstallFailed`;
  payload: [snapId: SnapId, origin: string, isUpdate: boolean, error: string];
};

/**
 * Emitted when a snap has been started after being added and authorized during
 * installation.
 */
export type SnapInstalled = {
  type: `${typeof controllerName}:snapInstalled`;
  payload: [snap: TruncatedSnap, origin: string, preinstalled: boolean];
};

/**
 * Emitted when a snap that has previously been fully installed, is uninstalled.
 */
export type SnapUninstalled = {
  type: `${typeof controllerName}:snapUninstalled`;
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
  payload: [
    snap: TruncatedSnap,
    oldVersion: string,
    origin: string,
    preinstalled: boolean,
  ];
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

/**
 * Emitted when a Snap is enabled by a user.
 * This is not emitted by default when installing a snap.
 */
export type SnapEnabled = {
  type: `${typeof controllerName}:snapEnabled`;
  payload: [snap: TruncatedSnap];
};

/**
 * Emitted when a Snap is disabled by a user.
 */
export type SnapDisabled = {
  type: `${typeof controllerName}:snapDisabled`;
  payload: [snap: TruncatedSnap];
};

/**
 * Emitted when there is a state change.
 */
export type SnapControllerStateChangeEvent = ControllerStateChangeEvent<
  typeof controllerName,
  SnapControllerState
>;

type KeyringControllerLock = {
  type: 'KeyringController:lock';
  payload: [];
};

export type SnapControllerEvents =
  | SnapBlocked
  | SnapInstalled
  | SnapUninstalled
  | SnapInstallStarted
  | SnapInstallFailed
  | SnapStateChange
  | SnapUnblocked
  | SnapUpdated
  | SnapRolledback
  | SnapTerminated
  | SnapEnabled
  | SnapDisabled
  | SnapControllerStateChangeEvent;

type NetworkControllerGetNetworkClientById = {
  type: `NetworkController:getNetworkClientById`;
  handler: (customNetworkClientId: string) => {
    configuration: {
      chainId: Hex;
    };
  };
};

type SelectedNetworkControllerGetNetworkClientIdForDomain = {
  type: `SelectedNetworkController:getNetworkClientIdForDomain`;
  handler: (domain: string) => string;
};

export type AllowedActions =
  | GetEndowments
  | GetPermissions
  | GetSubjects
  | GetSubjectMetadata
  | AddSubjectMetadata
  | HasPermission
  | HasPermissions
  | RevokePermissions
  | RevokeAllPermissions
  | RevokePermissionForAllSubjects
  | GrantPermissions
  | AddApprovalRequest
  | HandleRpcRequestAction
  | ExecuteSnapAction
  | TerminateSnapAction
  | UpdateCaveat
  | UpdateRequestState
  | GetResult
  | GetMetadata
  | Update
  | ResolveVersion
  | CreateInterface
  | GetInterface
  | NetworkControllerGetNetworkClientById
  | SelectedNetworkControllerGetNetworkClientIdForDomain;

export type AllowedEvents =
  | ExecutionServiceEvents
  | SnapInstalled
  | SnapUpdated
  | KeyringControllerLock;

type SnapControllerMessenger = Messenger<
  typeof controllerName,
  SnapControllerActions | AllowedActions,
  SnapControllerEvents | AllowedEvents
>;

type FeatureFlags = {
  requireAllowlist?: boolean;
  allowLocalSnaps?: boolean;
  disableSnapInstallation?: boolean;
  rejectInvalidPlatformVersion?: boolean;

  /**
   * Force any local Snap to be treated as a preinstalled Snap.
   *
   * This should only be used for local testing, and should not be enabled in
   * any production builds (including beta and Flask).
   */
  forcePreinstalledSnaps?: boolean;

  /**
   * Automatically update preinstalled Snaps "over the air",
   * when a new version of the Snap is added to the registry.
   */
  autoUpdatePreinstalledSnaps?: boolean;
};

type DynamicFeatureFlags = {
  disableSnaps?: boolean;
};

type SnapControllerArgs = {
  /**
   * A teardown function that allows the host to clean up its instrumentation
   * for a running snap.
   */
  closeAllConnections?: CloseAllConnectionsFunction;

  /**
   * A list of permissions that are allowed to be dynamic, meaning they can be revoked from the snap whenever.
   */
  dynamicPermissions?: string[];

  /**
   * The names of endowment permissions whose values are the names of JavaScript
   * APIs that will be added to the snap execution environment at runtime.
   */
  environmentEndowmentPermissions?: string[];

  /**
   * Excluded permissions with its associated error message used to forbid certain permissions.
   */
  excludedPermissions?: Record<string, string>;

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

  /**
   * A list of snaps to be preinstalled into the SnapController state on initialization.
   */
  preinstalledSnaps?: PreinstalledSnap[] | null;

  /**
   * A utility object containing functions required for state encryption.
   */
  encryptor: ExportableKeyEncryptor;

  /**
   * A hook to access the mnemonic seed of the user's primary keyring.
   *
   * @returns The mnemonic seed as bytes.
   */
  getMnemonicSeed: () => Promise<Uint8Array>;

  /**
   * A hook to get dynamic feature flags at runtime.
   *
   * @returns The feature flags.
   */
  getFeatureFlags: () => DynamicFeatureFlags;

  /**
   * The cryptographic functions to use for the client. This may be an empty
   * object to fall back to the default cryptographic functions.
   */
  clientCryptography?: CryptographicFunctions;

  /**
   * MetaMetrics event tracking hook.
   */
  trackEvent: TrackEventHook;
};

type AddSnapArgs = {
  id: SnapId;
  origin: string;
  location: SnapLocation;
  versionRange: SemVerRange;
};

// When we set a snap, we need all required properties to be present and
// validated.
type SetSnapArgs = Omit<AddSnapArgs, 'location' | 'versionRange'> & {
  files: FetchedSnapFiles;
  isUpdate?: boolean;
  removable?: boolean;
  preinstalled?: boolean;
  hidden?: boolean;
  hideSnapBranding?: boolean;
};

type TrackingEventPayload = {
  event: string;
  category: string;
  properties: Record<string, Json | undefined>;
};

type TrackEventHook = (event: TrackingEventPayload) => void;

const defaultState: SnapControllerState = {
  snaps: {},
  snapStates: {},
  unencryptedSnapStates: {},
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

  return truncatedSnap as TruncatedSnap;
}

/*
 * A snap is initialized in three phases:
 * - Add: Loads the snap from a remote source and parses it.
 * - Authorize: Requests the snap's required permissions from the user.
 * - Start: Initializes the snap in its SES realm with the authorized permissions.
 */

export class SnapController extends BaseController<
  typeof controllerName,
  SnapControllerState,
  SnapControllerMessenger
> {
  readonly #closeAllConnections?: CloseAllConnectionsFunction;

  readonly #dynamicPermissions: string[];

  readonly #environmentEndowmentPermissions: string[];

  readonly #excludedPermissions: Record<string, string>;

  readonly #featureFlags: FeatureFlags;

  readonly #fetchFunction: typeof fetch;

  readonly #idleTimeCheckInterval: number;

  readonly #maxIdleTime: number;

  // This property cannot be hash private yet because of tests.
  // eslint-disable-next-line no-restricted-syntax
  private readonly maxRequestTime: number;

  readonly #encryptor: ExportableKeyEncryptor;

  readonly #getMnemonicSeed: () => Promise<Uint8Array>;

  readonly #getFeatureFlags: () => DynamicFeatureFlags;

  readonly #clientCryptography: CryptographicFunctions | undefined;

  readonly #detectSnapLocation: typeof detectSnapLocation;

  readonly #snapsRuntimeData: Map<SnapId, SnapRuntimeData>;

  readonly #rollbackSnapshots: Map<string, RollbackSnapshot>;

  #timeoutForLastRequestStatus?: number;

  #statusMachine!: StateMachine.Machine<
    StatusContext,
    StatusEvents,
    StatusStates
  >;

  readonly #preinstalledSnaps: PreinstalledSnap[] | null;

  readonly #trackEvent: TrackEventHook;

  readonly #trackSnapExport: ReturnType<typeof throttleTracking>;

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
    fetchFunction = globalThis.fetch.bind(undefined),
    featureFlags = {},
    detectSnapLocation: detectSnapLocationFunction = detectSnapLocation,
    preinstalledSnaps = null,
    encryptor,
    getMnemonicSeed,
    getFeatureFlags = () => ({}),
    clientCryptography,
    trackEvent,
  }: SnapControllerArgs) {
    super({
      messenger,
      metadata: {
        snapStates: {
          includeInStateLogs: false,
          persist: true,
          includeInDebugSnapshot: false,
          usedInUi: false,
        },
        unencryptedSnapStates: {
          includeInStateLogs: false,
          persist: true,
          includeInDebugSnapshot: false,
          usedInUi: false,
        },
        snaps: {
          includeInStateLogs: (snaps) => {
            // Delete larger snap properties
            return Object.values(snaps).reduce<Record<SnapId, Partial<Snap>>>(
              (acc, snap) => {
                const snapCopy: Partial<Snap> = { ...snap };
                delete snapCopy.sourceCode;
                delete snapCopy.auxiliaryFiles;
                acc[snap.id] = snapCopy;
                return acc;
              },
              {},
            );
          },
          persist: (snaps) => {
            return (
              Object.values(snaps)
                // We should not persist snaps that are in the installing state,
                // since they haven't completed installation and would be unusable
                .filter((snap) => snap.status !== SnapStatus.Installing)
                .map((snap) => {
                  return {
                    ...snap,
                    // At the time state is rehydrated, no snap will be running.
                    status: SnapStatus.Stopped,
                  };
                })
                .reduce((memo: Record<SnapId, Snap>, snap) => {
                  memo[snap.id] = snap;
                  return memo;
                }, {})
            );
          },
          includeInDebugSnapshot: false,
          // TODO: Ensure larger snap properties are not sent to the UI
          // Currently these are stripped out manually in the extension
          usedInUi: true,
        },
      },
      name: controllerName,
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
    this.#encryptor = encryptor;
    this.#getMnemonicSeed = getMnemonicSeed;
    this.#getFeatureFlags = getFeatureFlags;
    this.#clientCryptography = clientCryptography;
    this.#preinstalledSnaps = preinstalledSnaps;
    this._onUnhandledSnapError = this._onUnhandledSnapError.bind(this);
    this._onOutboundRequest = this._onOutboundRequest.bind(this);
    this._onOutboundResponse = this._onOutboundResponse.bind(this);
    this.#rollbackSnapshots = new Map();
    this.#snapsRuntimeData = new Map();
    this.#trackEvent = trackEvent;

    this.#pollForLastRequestStatus();

    /* eslint-disable @typescript-eslint/unbound-method */
    this.messenger.subscribe(
      'ExecutionService:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messenger.subscribe(
      'ExecutionService:outboundRequest',
      this._onOutboundRequest,
    );

    this.messenger.subscribe(
      'ExecutionService:outboundResponse',
      this._onOutboundResponse,
    );
    /* eslint-enable @typescript-eslint/unbound-method */

    this.messenger.subscribe(
      'SnapController:snapInstalled',
      ({ id }, origin) => {
        this.#callLifecycleHook(origin, id, HandlerType.OnInstall).catch(
          (error) => {
            logError(
              `Error when calling \`onInstall\` lifecycle hook for snap "${id}": ${getErrorMessage(
                error,
              )}`,
            );
          },
        );
      },
    );

    this.messenger.subscribe(
      'SnapController:snapUpdated',
      ({ id }, _oldVersion, origin) => {
        this.#callLifecycleHook(origin, id, HandlerType.OnUpdate).catch(
          (error) => {
            logError(
              `Error when calling \`onUpdate\` lifecycle hook for snap "${id}": ${getErrorMessage(
                error,
              )}`,
            );
          },
        );
      },
    );

    this.messenger.subscribe(
      'KeyringController:lock',
      this.#handleLock.bind(this),
    );

    this.#initializeStateMachine();
    this.#registerMessageHandlers();

    Object.values(this.state?.snaps ?? {}).forEach((snap) =>
      this.#setupRuntime(snap.id),
    );

    if (this.#preinstalledSnaps) {
      this.#handlePreinstalledSnaps(this.#preinstalledSnaps);
    }

    this.#trackSnapExport = throttleTracking(
      (snapId: SnapId, handler: string, success: boolean, origin: string) => {
        const snapMetadata = this.messenger.call(
          'SnapsRegistry:getMetadata',
          snapId,
        );
        this.#trackEvent({
          event: 'Snap Export Used',
          category: 'Snaps',
          properties: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_id: snapId,
            export: handler,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_category: snapMetadata?.category,
            success,
            origin,
          },
        });
      },
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
    this.messenger.registerActionHandler(`${controllerName}:init`, (...args) =>
      this.init(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:clearSnapState`,
      (...args) => this.clearSnapState(...args),
    );

    this.messenger.registerActionHandler(`${controllerName}:get`, (...args) =>
      this.get(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getSnapState`,
      async (...args) => this.getSnapState(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:handleRequest`,
      async (...args) => this.handleRequest(...args),
    );

    this.messenger.registerActionHandler(`${controllerName}:has`, (...args) =>
      this.has(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:updateRegistry`,
      async () => this.updateRegistry(),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:updateSnapState`,
      async (...args) => this.updateSnapState(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:enable`,
      (...args) => this.enableSnap(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:disable`,
      async (...args) => this.disableSnap(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:remove`,
      async (...args) => this.removeSnap(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getPermitted`,
      (...args) => this.getPermittedSnaps(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:install`,
      async (...args) => this.installSnaps(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getAll`,
      (...args) => this.getAllSnaps(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getRunnableSnaps`,
      (...args) => this.getRunnableSnaps(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:incrementActiveReferences`,
      (...args) => this.incrementActiveReferences(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:decrementActiveReferences`,
      (...args) => this.decrementActiveReferences(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:disconnectOrigin`,
      (...args) => this.removeSnapFromSubject(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:revokeDynamicPermissions`,
      (...args) => this.revokeDynamicSnapPermissions(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:getFile`,
      async (...args) => this.getSnapFile(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:stopAllSnaps`,
      async (...args) => this.stopAllSnaps(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:isMinimumPlatformVersion`,
      (...args) => this.isMinimumPlatformVersion(...args),
    );

    this.messenger.registerActionHandler(
      `${controllerName}:setClientActive`,
      (...args) => this.setClientActive(...args),
    );
  }

  /**
   * Initialise the SnapController.
   *
   * Currently this method calls the `onStart` lifecycle hook for all
   * runnable Snaps.
   */
  init() {
    this.#callLifecycleHooks(METAMASK_ORIGIN, HandlerType.OnStart);
  }

  #handlePreinstalledSnaps(preinstalledSnaps: PreinstalledSnap[]) {
    for (const {
      snapId,
      manifest,
      files,
      removable,
      hidden,
      hideSnapBranding,
    } of preinstalledSnaps) {
      const existingSnap = this.get(snapId);
      const isAlreadyInstalled = existingSnap !== undefined;
      const isUpdate =
        isAlreadyInstalled && gtVersion(manifest.version, existingSnap.version);

      // Disallow downgrades and overwriting non preinstalled snaps
      if (
        isAlreadyInstalled &&
        (!isUpdate || existingSnap.preinstalled !== true)
      ) {
        continue;
      }

      const manifestFile = new VirtualFile<SnapManifest>({
        path: NpmSnapFileNames.Manifest,
        value: JSON.stringify(manifest),
        result: manifest,
      });

      const virtualFiles = files.map(
        ({ path, value }) => new VirtualFile({ value, path }),
      );
      const { filePath, iconPath } = manifest.source.location.npm;
      const sourceCode = virtualFiles.find((file) => file.path === filePath);
      const svgIcon = iconPath
        ? virtualFiles.find((file) => file.path === iconPath)
        : undefined;

      assert(sourceCode, 'Source code not provided for preinstalled snap.');

      assert(
        !iconPath || (iconPath && svgIcon),
        'Icon not provided for preinstalled snap.',
      );

      assert(
        manifest.source.files === undefined,
        'Auxiliary files are not currently supported for preinstalled snaps.',
      );

      const localizationFiles =
        manifest.source.locales?.map((path) =>
          virtualFiles.find((file) => file.path === path),
        ) ?? [];

      const validatedLocalizationFiles = getValidatedLocalizationFiles(
        localizationFiles.filter(Boolean) as VirtualFile[],
      );

      assert(
        localizationFiles.length === validatedLocalizationFiles.length,
        'Missing localization files for preinstalled snap.',
      );

      const filesObject: FetchedSnapFiles = {
        manifest: manifestFile,
        sourceCode,
        svgIcon,
        auxiliaryFiles: [],
        localizationFiles: validatedLocalizationFiles,
      };

      // Add snap to the SnapController state
      this.#set({
        id: snapId,
        origin: METAMASK_ORIGIN,
        files: filesObject,
        removable,
        hidden,
        hideSnapBranding,
        preinstalled: true,
      });

      // Setup permissions
      const processedPermissions = processSnapPermissions(
        manifest.initialPermissions,
      );

      this.#validateSnapPermissions(processedPermissions);

      const { newPermissions, unusedPermissions } =
        this.#calculatePermissionsChange(snapId, processedPermissions);

      this.#updatePermissions({ snapId, newPermissions, unusedPermissions });

      if (manifest.initialConnections) {
        this.#handleInitialConnections(
          snapId,
          existingSnap?.initialConnections ?? null,
          manifest.initialConnections,
        );
      }

      // Set status
      this.update((state) => {
        state.snaps[snapId].status = SnapStatus.Stopped;
      });

      this.#setupRuntime(snapId);

      // Emit events
      if (isUpdate) {
        this.messenger.publish(
          'SnapController:snapUpdated',
          this.getTruncatedExpect(snapId),
          existingSnap.version,
          METAMASK_ORIGIN,
          true,
        );
      } else {
        this.messenger.publish(
          'SnapController:snapInstalled',
          this.getTruncatedExpect(snapId),
          METAMASK_ORIGIN,
          true,
        );
      }
    }
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
   *
   * Also updates any preinstalled Snaps to the latest allowlisted version.
   */
  async updateRegistry(): Promise<void> {
    this.#assertCanUsePlatform();
    await this.messenger.call('SnapsRegistry:update');

    const blockedSnaps = await this.messenger.call(
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
          return this.#blockSnap(snapId as SnapId, reason);
        }

        return this.#unblockSnap(snapId as SnapId);
      }),
    );

    if (!this.#featureFlags.autoUpdatePreinstalledSnaps) {
      return;
    }

    const preinstalledVersionRange = '*' as SemVerRange;

    await Promise.allSettled(
      Object.values(this.state.snaps)
        .filter((snap) => snap.preinstalled)
        .map(async (snap) => {
          const resolvedVersion = await this.#resolveAllowlistVersion(
            snap.id,
            preinstalledVersionRange,
          );

          if (
            resolvedVersion !== preinstalledVersionRange &&
            gtVersion(resolvedVersion as unknown as SemVerVersion, snap.version)
          ) {
            const location = this.#detectSnapLocation(snap.id, {
              versionRange: resolvedVersion,
              fetch: this.#fetchFunction,
              allowLocal: false,
            });

            await this.#updateSnap({
              origin: ORIGIN_METAMASK,
              snapId: snap.id,
              location,
              versionRange: resolvedVersion,
              automaticUpdate: true,
            });
          }
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
    snapId: SnapId,
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

    this.messenger.publish(
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
  #unblockSnap(snapId: SnapId) {
    if (!this.has(snapId) || !this.state.snaps[snapId].blocked) {
      return;
    }

    this.update((state: any) => {
      state.snaps[snapId].blocked = false;
      delete state.snaps[snapId].blockInformation;
    });

    this.messenger.publish(`${controllerName}:snapUnblocked`, snapId);
  }

  async #assertIsInstallAllowed(
    snapId: SnapId,
    {
      platformVersion,
      ...snapInfo
    }: SnapsRegistryInfo & {
      permissions: SnapPermissions;
      platformVersion: string | undefined;
    },
  ) {
    const results = await this.messenger.call('SnapsRegistry:get', {
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
    }

    const isAllowlistingRequired = Object.keys(snapInfo.permissions).some(
      (permission) => !ALLOWED_PERMISSIONS.includes(permission),
    );

    if (
      this.#featureFlags.requireAllowlist &&
      isAllowlistingRequired &&
      result.status !== SnapsRegistryStatus.Verified
    ) {
      throw new Error(
        `Cannot install version "${snapInfo.version}" of snap "${snapId}": ${
          result.status === SnapsRegistryStatus.Unavailable
            ? 'The registry is temporarily unavailable.'
            : 'The snap is not on the allowlist.'
        }`,
      );
    }

    this.#validatePlatformVersion(snapId, platformVersion);
  }

  /**
   * Asserts whether new Snaps are allowed to be installed.
   */
  #assertCanInstallSnaps() {
    assert(
      this.#featureFlags.disableSnapInstallation !== true,
      'Installing Snaps is currently disabled in this version of MetaMask.',
    );
  }

  /**
   * Asserts whether the Snaps platform is allowed to run.
   */
  #assertCanUsePlatform() {
    const flags = this.#getFeatureFlags();
    assert(
      flags.disableSnaps !== true,
      'The Snaps platform requires basic functionality to be used. Enable basic functionality in the settings to use the Snaps platform.',
    );
  }

  async #stopSnapsLastRequestPastMax() {
    const entries = [...this.#snapsRuntimeData.entries()];
    return Promise.all(
      entries
        .filter(
          ([_snapId, runtime]) =>
            runtime.activeReferences === 0 &&
            runtime.pendingInboundRequests.length === 0 &&
            runtime.lastRequest &&
            this.#maxIdleTime &&
            timeSince(runtime.lastRequest) > this.#maxIdleTime,
        )
        .map(async ([snapId]) => this.stopSnap(snapId, SnapStatusEvents.Stop)),
    );
  }

  _onUnhandledSnapError(snapId: string, error: SnapErrorJson) {
    // Log the error that caused the crash
    // so it gets raised to the developer for debugging purposes.
    logError(`Unhandled error from "${snapId}":`, error);
    this.stopSnap(snapId as SnapId, SnapStatusEvents.Crash).catch(
      (stopSnapError) => {
        // TODO: Decide how to handle errors.
        logError(stopSnapError);
      },
    );
  }

  _onOutboundRequest(snapId: string) {
    const runtime = this.#getRuntimeExpect(snapId as SnapId);
    // Ideally we would only pause the pending request that is making the outbound request
    // but right now we don't have a way to know which request initiated the outbound request
    runtime.pendingInboundRequests
      .filter((pendingRequest) => pendingRequest.timer.status === 'running')
      .forEach((pendingRequest) => pendingRequest.timer.pause());
    runtime.pendingOutboundRequests += 1;
  }

  _onOutboundResponse(snapId: string) {
    const runtime = this.#getRuntimeExpect(snapId as SnapId);
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
  #transition(snapId: SnapId, event: StatusEvents | StatusEvents['type']) {
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
  async startSnap(snapId: SnapId): Promise<void> {
    this.#assertCanUsePlatform();
    const snap = this.state.snaps[snapId];

    if (!snap.enabled) {
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
  enableSnap(snapId: SnapId): void {
    this.getExpect(snapId);

    if (this.state.snaps[snapId].blocked) {
      throw new Error(`Snap "${snapId}" is blocked and cannot be enabled.`);
    }

    this.update((state: any) => {
      state.snaps[snapId].enabled = true;
    });

    this.messenger.publish(
      'SnapController:snapEnabled',
      this.getTruncatedExpect(snapId),
    );
  }

  /**
   * Disables the given snap. A snap can only be started if it is enabled.
   *
   * @param snapId - The id of the Snap to disable.
   * @returns A promise that resolves once the snap has been disabled.
   */
  async disableSnap(snapId: SnapId): Promise<void> {
    if (!this.has(snapId)) {
      throw new Error(`Snap "${snapId}" not found.`);
    }

    this.update((state: any) => {
      state.snaps[snapId].enabled = false;
    });

    if (this.isRunning(snapId)) {
      await this.stopSnap(snapId, SnapStatusEvents.Stop);
    }

    this.messenger.publish(
      'SnapController:snapDisabled',
      this.getTruncatedExpect(snapId),
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
  public async stopSnap(
    snapId: SnapId,
    statusEvent:
      | SnapStatusEvents.Stop
      | SnapStatusEvents.Crash = SnapStatusEvents.Stop,
  ): Promise<void> {
    const runtime = this.#getRuntime(snapId);
    if (!runtime) {
      throw new Error(`The snap "${snapId}" is not running.`);
    }

    // If we are already stopping, wait for that to finish.
    if (runtime.stopPromise) {
      await runtime.stopPromise;
      return;
    }

    // Flag that the Snap is actively stopping, this prevents other calls to stopSnap
    // while we are handling termination of the Snap
    const { promise, resolve } = createDeferredPromise();
    runtime.stopPromise = promise;

    try {
      if (this.isRunning(snapId)) {
        this.#closeAllConnections?.(snapId);
        await this.#terminateSnap(snapId);
      }
    } finally {
      // Reset request tracking
      runtime.lastRequest = null;
      runtime.pendingInboundRequests = [];
      runtime.pendingOutboundRequests = 0;
      runtime.stopPromise = null;
      if (this.isRunning(snapId)) {
        this.#transition(snapId, statusEvent);
      }
      resolve();
    }
  }

  /**
   * Stops all running snaps, removes all hooks, closes all connections, and
   * terminates their workers.
   *
   * @param statusEvent - The Snap status event that caused the snap to be
   * stopped.
   */
  public async stopAllSnaps(
    statusEvent:
      | SnapStatusEvents.Stop
      | SnapStatusEvents.Crash = SnapStatusEvents.Stop,
  ): Promise<void> {
    const snaps = Object.values(this.state.snaps).filter((snap) =>
      this.isRunning(snap.id),
    );
    const promises = snaps.map(async (snap) =>
      this.stopSnap(snap.id, statusEvent),
    );
    await Promise.allSettled(promises);
  }

  /**
   * Terminates the specified snap and emits the `snapTerminated` event.
   *
   * @param snapId - The snap to terminate.
   */
  async #terminateSnap(snapId: SnapId) {
    await this.messenger.call('ExecutionService:terminateSnap', snapId);

    // Hack to give up execution for a bit to let gracefully terminating Snaps return.
    await new Promise((resolve) => setTimeout(resolve, 1));

    const runtime = this.#getRuntimeExpect(snapId);
    // Unresponsive requests may still be timed, time them out.
    runtime.pendingInboundRequests
      .filter((pendingRequest) => pendingRequest.timer.status !== 'finished')
      .forEach((pendingRequest) => pendingRequest.timer.finish());

    // Hack to give up execution for a bit to let timed out requests return.
    await new Promise((resolve) => setTimeout(resolve, 1));

    this.messenger.publish(
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
  get(snapId: string): Snap | undefined {
    return this.state.snaps[snapId as SnapId];
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
    assert(snap !== undefined, `Snap "${snapId}" not found.`);
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
   * Check if a given Snap has a cached encryption key stored in the runtime.
   *
   * @param snapId - The Snap ID.
   * @param runtime - The Snap runtime data.
   * @returns True if the Snap has a cached encryption key, otherwise false.
   */
  #hasCachedEncryptionKey(
    snapId: SnapId,
    runtime = this.#getRuntimeExpect(snapId),
  ): runtime is SnapRuntimeData & {
    encryptionKey: string;
    encryptionSalt: string;
  } {
    return runtime.encryptionKey !== null && runtime.encryptionSalt !== null;
  }

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
  async #getSnapEncryptionKey({
    snapId,
    salt: passedSalt,
    useCache,
    keyMetadata,
  }: {
    snapId: SnapId;
    salt?: string;
    useCache: boolean;
    keyMetadata?: KeyDerivationOptions;
  }): Promise<{ key: unknown; salt: string }> {
    const runtime = this.#getRuntimeExpect(snapId);

    if (this.#hasCachedEncryptionKey(snapId, runtime) && useCache) {
      return {
        key: await this.#encryptor.importKey(runtime.encryptionKey),
        salt: runtime.encryptionSalt,
      };
    }

    const salt = passedSalt ?? this.#encryptor.generateSalt();
    const seed = await this.#getMnemonicSeed();

    const entropy = await getEncryptionEntropy({
      snapId,
      seed,
      cryptographicFunctions: this.#clientCryptography,
    });

    const encryptionKey = await this.#encryptor.keyFromPassword(
      entropy,
      salt,
      true,
      keyMetadata,
    );
    const exportedKey = await this.#encryptor.exportKey(encryptionKey);

    // Cache exported encryption key in runtime
    if (useCache) {
      runtime.encryptionKey = exportedKey;
      runtime.encryptionSalt = salt;
    }
    return { key: encryptionKey, salt };
  }

  /**
   * Decrypt the encrypted state for a given Snap.
   *
   * @param snapId - The Snap ID.
   * @param state - The encrypted state as a string.
   * @returns A valid JSON object derived from the encrypted state.
   * @throws If the decryption fails or the decrypted state is not valid JSON.
   */
  async #decryptSnapState(snapId: SnapId, state: string) {
    try {
      // We assume that the state string here is valid JSON since we control serialization.
      // This lets us skip JSON validation.
      const parsed = JSON.parse(state) as EncryptionResult;
      const { salt, keyMetadata } = parsed;

      // We only cache encryption keys if they are already cached or if the encryption key is using the latest key derivation params.
      const useCache =
        this.#hasCachedEncryptionKey(snapId) ||
        this.#encryptor.isVaultUpdated(state);

      const { key } = await this.#getSnapEncryptionKey({
        snapId,
        salt,
        useCache,
        // When decrypting state we expect key metadata to be present.
        // If it isn't present, we assume that the Snap state we are decrypting is old enough to use the legacy encryption params.
        keyMetadata: keyMetadata ?? LEGACY_ENCRYPTION_KEY_DERIVATION_OPTIONS,
      });
      const decryptedState = await this.#encryptor.decryptWithKey(key, parsed);

      // We assume this to be valid JSON, since all RPC requests from a Snap are validated and sanitized.
      return decryptedState as Record<string, Json>;
    } catch {
      throw rpcErrors.internal({
        message: 'Failed to decrypt snap state, the state must be corrupted.',
      });
    }
  }

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
  async #encryptSnapState(snapId: SnapId, state: Record<string, Json>) {
    const { key, salt } = await this.#getSnapEncryptionKey({
      snapId,
      useCache: true,
    });
    const encryptedState = await this.#encryptor.encryptWithKey(key, state);

    encryptedState.salt = salt;
    return JSON.stringify(encryptedState);
  }

  /**
   * Get the new Snap state to persist based on the given state and encryption
   * flag.
   *
   * - If the state is null, return null.
   * - If the state should be encrypted, return the encrypted state.
   * - Otherwise, if the state should not be encrypted, return the JSON-
   * stringified state.
   *
   * @param snapId - The Snap ID.
   * @param state - The state to persist.
   * @param encrypted - A flag to indicate whether to use encrypted storage or
   * not.
   * @returns The state to persist.
   */
  async #getStateToPersist(
    snapId: SnapId,
    state: Record<string, Json> | null,
    encrypted: boolean,
  ) {
    if (state === null) {
      return null;
    }

    if (encrypted) {
      return await this.#encryptSnapState(snapId, state);
    }

    return JSON.stringify(state);
  }

  /**
   * Persist the state of a Snap.
   *
   * This function is debounced per Snap, meaning that multiple calls to this
   * function for the same Snap will only result in one state update. It also
   * uses a mutex to ensure that only one state update per Snap is processed at
   * a time, avoiding possible race conditions.
   *
   * @param snapId - The Snap ID.
   * @param newSnapState - The new state of the Snap.
   * @param encrypted - A flag to indicate whether to use encrypted storage or
   * not.
   */
  readonly #persistSnapState = debouncePersistState(
    (
      snapId: SnapId,
      newSnapState: Record<string, Json> | null,
      encrypted: boolean,
    ) => {
      const runtime = this.#getRuntimeExpect(snapId);
      runtime.stateMutex
        .runExclusive(async () => {
          const newState = await this.#getStateToPersist(
            snapId,
            newSnapState,
            encrypted,
          );

          if (encrypted) {
            return this.update((state) => {
              state.snapStates[snapId] = newState;
            });
          }

          return this.update((state) => {
            state.unencryptedSnapStates[snapId] = newState;
          });
        })
        .catch(logError);
    },
    STATE_DEBOUNCE_TIMEOUT,
  );

  /**
   * Updates the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be updated.
   * @param newSnapState - The new state of the snap.
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   */
  async updateSnapState(
    snapId: SnapId,
    newSnapState: Record<string, Json>,
    encrypted: boolean,
  ) {
    const runtime = this.#getRuntimeExpect(snapId);

    if (encrypted) {
      runtime.state = newSnapState;
    } else {
      runtime.unencryptedState = newSnapState;
    }

    this.#persistSnapState(snapId, newSnapState, encrypted);
  }

  /**
   * Clears the state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state should be cleared.
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   */
  clearSnapState(snapId: SnapId, encrypted: boolean) {
    const runtime = this.#getRuntimeExpect(snapId);
    if (encrypted) {
      runtime.state = null;
    } else {
      runtime.unencryptedState = null;
    }

    this.#persistSnapState(snapId, null, encrypted);
  }

  /**
   * Gets the own state of the snap with the given id.
   * This is distinct from the state MetaMask uses to manage snaps.
   *
   * @param snapId - The id of the Snap whose state to get.
   * @param encrypted - A flag to indicate whether to use encrypted storage or not.
   * @returns The requested snap state or null if no state exists.
   */
  async getSnapState(snapId: SnapId, encrypted: boolean): Promise<Json> {
    const runtime = this.#getRuntimeExpect(snapId);
    return await runtime.getStateMutex.runExclusive(async () => {
      const cachedState = encrypted ? runtime.state : runtime.unencryptedState;

      if (cachedState !== undefined) {
        return cachedState;
      }

      const state = encrypted
        ? this.state.snapStates[snapId]
        : this.state.unencryptedSnapStates[snapId];

      if (state === null || state === undefined) {
        return null;
      }

      if (!encrypted) {
        // For performance reasons, we do not validate that the state is JSON,
        // since we control serialization.
        const json = JSON.parse(state);
        runtime.unencryptedState = json;

        return json;
      }

      const decrypted = await this.#decryptSnapState(snapId, state);
      // eslint-disable-next-line require-atomic-updates
      runtime.state = decrypted;

      return decrypted;
    });
  }

  /**
   * Gets a static auxiliary snap file in a chosen file encoding.
   *
   * @param snapId - The id of the Snap whose state to get.
   * @param path - The path to the requested file.
   * @param encoding - An optional requested file encoding.
   * @returns The file requested in the chosen file encoding or null if the file is not found.
   */
  async getSnapFile(
    snapId: SnapId,
    path: string,
    encoding: AuxiliaryFileEncoding = AuxiliaryFileEncoding.Base64,
  ): Promise<string | null> {
    const snap = this.getExpect(snapId);
    const normalizedPath = normalizeRelative(path);
    const value = snap.auxiliaryFiles?.find(
      (file) => file.path === normalizedPath,
    )?.value;

    if (!value) {
      return null;
    }

    const encoded = await encodeAuxiliaryFile(value, encoding);

    assert(
      encoded.length < MAX_FILE_SIZE,
      `Failed to encode static file to "${encoding}": Static files must be less than 64 MB when encoded.`,
    );

    return encoded;
  }

  /**
   * Determine if a given Snap ID supports a given minimum version of the Snaps platform
   * by inspecting the platformVersion in the Snap manifest.
   *
   * @param snapId - The Snap ID.
   * @param version - The version.
   * @returns True if the platform version is equal or greater to the passed version, false otherwise.
   */
  isMinimumPlatformVersion(snapId: SnapId, version: SemVerVersion): boolean {
    const snap = this.getExpect(snapId);

    const { platformVersion } = snap.manifest;

    if (!platformVersion) {
      return false;
    }

    return gte(platformVersion, version);
  }

  /**
   * Completely clear the controller's state: delete all associated data,
   * handlers, event listeners, and permissions; tear down all snap providers.
   */
  async clearState() {
    const snapIds = Object.keys(this.state.snaps);

    await this.stopAllSnaps();
    snapIds.forEach((snapId) => this.#revokeAllSnapPermissions(snapId));

    this.update((state) => {
      state.snaps = {};
      state.snapStates = {};
      state.unencryptedSnapStates = {};
    });

    this.#snapsRuntimeData.clear();
    this.#rollbackSnapshots.clear();

    // We want to remove all snaps & permissions, except for preinstalled snaps
    if (this.#preinstalledSnaps) {
      this.#handlePreinstalledSnaps(this.#preinstalledSnaps);
    }
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
  async removeSnaps(snapIds: SnapId[]): Promise<void> {
    if (!Array.isArray(snapIds)) {
      throw new Error('Expected array of snap ids.');
    }

    snapIds.forEach((snapId) => {
      const snap = this.getExpect(snapId);
      assert(snap.removable !== false, `${snapId} is not removable.`);
    });

    await Promise.all(
      snapIds.map(async (snapId) => {
        const snap = this.getExpect(snapId);
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
          delete state.unencryptedSnapStates[snapId];
        });

        // If the snap has been fully installed before, also emit snapUninstalled.
        if (snap.status !== SnapStatus.Installing) {
          this.messenger.publish(`SnapController:snapUninstalled`, truncated);
        }
      }),
    );
  }

  #handleInitialConnections(
    snapId: SnapId,
    previousInitialConnections: InitialConnections | null,
    initialConnections: InitialConnections,
  ) {
    if (previousInitialConnections) {
      const revokedInitialConnections = setDiff(
        previousInitialConnections,
        initialConnections,
      );

      for (const origin of Object.keys(revokedInitialConnections)) {
        this.removeSnapFromSubject(origin, snapId);
      }
    }

    for (const origin of Object.keys(initialConnections)) {
      this.#addSnapToSubject(origin, snapId);
    }
  }

  #addSnapToSubject(origin: string, snapId: SnapId) {
    const subjectPermissions = this.messenger.call(
      'PermissionController:getPermissions',
      origin,
    ) as SubjectPermissions<PermissionConstraint>;

    const existingCaveat = subjectPermissions?.[
      WALLET_SNAP_PERMISSION_KEY
    ]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds);

    const subjectHasSnap = Boolean(
      (existingCaveat?.value as Record<string, Json>)?.[snapId],
    );

    // If the subject is already connected to the snap, this is a no-op.
    if (subjectHasSnap) {
      return;
    }

    // If an existing caveat exists, we add the snap to that.
    if (existingCaveat) {
      this.messenger.call(
        'PermissionController:updateCaveat',
        origin,
        WALLET_SNAP_PERMISSION_KEY,
        SnapCaveatType.SnapIds,
        { ...(existingCaveat.value as Record<string, Json>), [snapId]: {} },
      );
      return;
    }

    const approvedPermissions = {
      [WALLET_SNAP_PERMISSION_KEY]: {
        caveats: [
          {
            type: SnapCaveatType.SnapIds,
            value: {
              [snapId]: {},
            },
          },
        ],
      },
    } as RequestedPermissions;

    this.messenger.call('PermissionController:grantPermissions', {
      approvedPermissions,
      subject: { origin },
    });
  }

  /**
   * Removes a snap's permission (caveat) from the specified subject.
   *
   * @param origin - The origin from which to remove the snap.
   * @param snapId - The id of the snap to remove.
   */
  removeSnapFromSubject(origin: string, snapId: SnapId) {
    const subjectPermissions = this.messenger.call(
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
        this.messenger.call(
          'PermissionController:updateCaveat',
          origin,
          WALLET_SNAP_PERMISSION_KEY,
          SnapCaveatType.SnapIds,
          newCaveatValue,
        );
      } else {
        this.messenger.call('PermissionController:revokePermissions', {
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
    this.messenger.call('PermissionController:revokePermissions', {
      [snapId]: permissionNames,
    });
  }

  /**
   * Removes a snap's permission (caveat) from all subjects.
   *
   * @param snapId - The id of the Snap.
   */
  #removeSnapFromSubjects(snapId: SnapId) {
    const subjects = this.messenger.call(
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
    if (this.messenger.call('PermissionController:hasPermissions', snapId)) {
      this.messenger.call('PermissionController:revokeAllPermissions', snapId);
    }
  }

  /**
   * Handles incrementing the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced.
   */
  incrementActiveReferences(snapId: SnapId) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.activeReferences += 1;
  }

  /**
   * Handles decrement the activeReferences counter.
   *
   * @param snapId - The snap id of the snap that was referenced..
   */
  decrementActiveReferences(snapId: SnapId) {
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
   * Gets all runnable snaps.
   *
   * @returns All runnable snaps.
   */
  getRunnableSnaps(): TruncatedSnap[] {
    return getRunnableSnaps(this.getAllSnaps());
  }

  /**
   * Gets the serialized permitted snaps of the given origin, if any.
   *
   * @param origin - The origin whose permitted snaps to retrieve.
   * @returns The serialized permitted snaps for the origin.
   */
  getPermittedSnaps(origin: string): RequestSnapsResult {
    const permissions =
      this.messenger.call('PermissionController:getPermissions', origin) ?? {};
    const snaps =
      permissions[WALLET_SNAP_PERMISSION_KEY]?.caveats?.find(
        (caveat) => caveat.type === SnapCaveatType.SnapIds,
      )?.value ?? {};
    return Object.keys(snaps).reduce<RequestSnapsResult>(
      (permittedSnaps, snapId) => {
        const snap = this.get(snapId);
        const truncatedSnap = this.getTruncated(snapId as SnapId);

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
    requestedSnaps: RequestSnapsParams,
  ): Promise<RequestSnapsResult> {
    this.#assertCanUsePlatform();

    const result: RequestSnapsResult = {};

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
          throw rpcErrors.invalidParams(
            `The "version" field must be a valid SemVer version range if specified. Received: "${
              rawVersion as string
            }".`,
          );
        }

        const location = this.#detectSnapLocation(snapId, {
          versionRange: version,
          fetch: this.#fetchFunction,
          allowLocal: this.#featureFlags.allowLocalSnaps,
          resolveVersion: async (range) =>
            this.#featureFlags.requireAllowlist
              ? await this.#resolveAllowlistVersion(snapId, range)
              : range,
        });

        // Existing snaps may need to be updated, unless they should be re-installed (e.g. local snaps)
        // Everything else is treated as an install
        const isUpdate = this.has(snapId) && !location.shouldAlwaysReload;

        if (isUpdate && this.#isValidUpdate(snapId, version)) {
          const existingSnap = this.getExpect(snapId);
          pendingUpdates.push({ snapId, oldVersion: existingSnap.version });
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

        result[snapId] = await this.#processRequestedSnap(
          origin,
          snapId,
          location,
          version,
        );
      }

      // Once we finish all installs / updates, emit events.
      pendingInstalls.forEach((snapId) =>
        this.messenger.publish(
          `SnapController:snapInstalled`,
          this.getTruncatedExpect(snapId),
          origin,
          false,
        ),
      );

      pendingUpdates.forEach(({ snapId, oldVersion }) =>
        this.messenger.publish(
          `SnapController:snapUpdated`,
          this.getTruncatedExpect(snapId),
          oldVersion,
          origin,
          false,
        ),
      );

      snapIds.forEach((snapId) => this.#rollbackSnapshots.delete(snapId));
    } catch (error) {
      const installed = pendingInstalls.filter((snapId) => this.has(snapId));
      await this.removeSnaps(installed);
      const snapshottedSnaps = [...this.#rollbackSnapshots.keys()];
      const snapsToRollback = pendingUpdates
        .map(({ snapId }) => snapId)
        .filter((snapId) => snapshottedSnaps.includes(snapId));
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
  async #processRequestedSnap(
    origin: string,
    snapId: SnapId,
    location: SnapLocation,
    versionRange: SemVerRange,
  ): Promise<TruncatedSnap> {
    const existingSnap = this.getTruncated(snapId);

    // For devX we always re-install local snaps.
    if (existingSnap && !location.shouldAlwaysReload) {
      if (satisfiesVersionRange(existingSnap.version, versionRange)) {
        return existingSnap;
      }

      return await this.#updateSnap({
        origin,
        snapId,
        location,
        versionRange,
      });
    }

    this.#assertCanInstallSnaps();

    let pendingApproval = this.#createApproval({
      origin,
      snapId,
      type: SNAP_APPROVAL_INSTALL,
    });

    this.messenger.publish(
      'SnapController:snapInstallStarted',
      snapId,
      origin,
      false,
    );

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

      await this.#authorize(snapId, pendingApproval);

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

      return truncated;
    } catch (error) {
      logError(`Error when adding ${snapId}.`, error);

      const errorString =
        error instanceof Error ? error.message : error.toString();

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        type: SNAP_APPROVAL_INSTALL,
        error: errorString,
      });

      this.messenger.publish(
        'SnapController:snapInstallFailed',
        snapId,
        origin,
        false,
        errorString,
      );

      throw error;
    }
  }

  #createApproval({
    origin,
    snapId,
    type,
  }: {
    origin: string;
    snapId: SnapId;
    type: string;
  }): PendingApproval {
    const id = nanoid();
    const promise = this.messenger.call(
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
      this.messenger.call('ApprovalController:updateRequestState', {
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
   * @param options - An options bag.
   * @param options.origin - The origin requesting the snap update.
   * @param options.snapId - The id of the Snap to be updated.
   * @param options.location - The location implementation of the snap.
   * @param options.versionRange - A semver version range in which the maximum version will be chosen.
   * @param options.automaticUpdate - An optional boolean flag to indicate whether this update should be done
   * automatically.
   * @returns The snap metadata if updated, `null` otherwise.
   */
  async #updateSnap({
    origin,
    snapId,
    location,
    versionRange,
    automaticUpdate = false,
  }: {
    origin: string;
    snapId: SnapId;
    location: SnapLocation;
    versionRange: SemVerRange;
    automaticUpdate?: boolean;
  }): Promise<TruncatedSnap> {
    this.#assertCanInstallSnaps();
    this.#assertCanUsePlatform();

    const snap = this.getExpect(snapId);

    const { preinstalled, removable, hidden, hideSnapBranding } = snap;

    if (preinstalled && !automaticUpdate) {
      throw new Error('Preinstalled Snaps cannot be manually updated.');
    }

    let pendingApproval = automaticUpdate
      ? null
      : this.#createApproval({
          origin,
          snapId,
          type: SNAP_APPROVAL_UPDATE,
        });

    try {
      this.messenger.publish(
        'SnapController:snapInstallStarted',
        snapId,
        origin,
        true,
      );

      const oldManifest = snap.manifest;

      const newSnap = await fetchSnap(snapId, location);
      const { sourceCode: sourceCodeFile, manifest: manifestFile } = newSnap;

      const manifest = manifestFile.result;

      const newVersion = manifest.version;
      if (!gtVersion(newVersion, snap.version)) {
        throw rpcErrors.invalidParams(
          `Snap "${snapId}@${snap.version}" is already installed. Couldn't update to a version inside requested "${versionRange}" range.`,
        );
      }

      if (!satisfiesVersionRange(newVersion, versionRange)) {
        throw new Error(
          `Version mismatch. Manifest for "${snapId}" specifies version "${newVersion}" which doesn't satisfy requested version range "${versionRange}".`,
        );
      }

      await this.#assertIsInstallAllowed(snapId, {
        version: newVersion,
        checksum: manifest.source.shasum,
        permissions: manifest.initialPermissions,
        platformVersion: manifest.platformVersion,
      });

      const processedPermissions = processSnapPermissions(
        manifest.initialPermissions,
      );

      this.#validateSnapPermissions(processedPermissions);

      const { newPermissions, unusedPermissions, approvedPermissions } =
        this.#calculatePermissionsChange(snapId, processedPermissions);

      const { newConnections, unusedConnections, approvedConnections } =
        this.#calculateConnectionsChange(
          snapId,
          oldManifest.initialConnections ?? {},
          manifest.initialConnections ?? {},
        );

      let approvedNewPermissions;
      let requestData;

      if (pendingApproval) {
        this.#updateApproval(pendingApproval.id, {
          permissions: newPermissions,
          newVersion: manifest.version,
          newPermissions,
          approvedPermissions,
          unusedPermissions,
          newConnections,
          unusedConnections,
          approvedConnections,
          loading: false,
        });

        const { permissions, ...rest } =
          (await pendingApproval.promise) as PermissionsRequest;

        approvedNewPermissions = permissions;
        requestData = rest;

        pendingApproval = this.#createApproval({
          origin,
          snapId,
          type: SNAP_APPROVAL_RESULT,
        });
      } else {
        assert(automaticUpdate);
        approvedNewPermissions = newPermissions;
      }

      if (this.isRunning(snapId)) {
        await this.stopSnap(snapId, SnapStatusEvents.Stop);
      }

      this.#transition(snapId, SnapStatusEvents.Update);

      this.#set({
        origin,
        id: snapId,
        files: newSnap,
        removable,
        preinstalled,
        hidden,
        hideSnapBranding,
        isUpdate: true,
      });

      this.#updatePermissions({
        snapId,
        unusedPermissions,
        newPermissions: approvedNewPermissions,
        requestData,
      });

      const previousInitialConnections = oldManifest.initialConnections ?? null;
      const newInitialConnections = manifest.initialConnections ?? {};
      this.#handleInitialConnections(
        snapId,
        previousInitialConnections,
        newInitialConnections,
      );

      const rollbackSnapshot = this.#getRollbackSnapshot(snapId);
      if (rollbackSnapshot !== undefined) {
        rollbackSnapshot.permissions.revoked = unusedPermissions;
        rollbackSnapshot.permissions.granted = approvedNewPermissions;
        rollbackSnapshot.permissions.requestData = requestData;
        rollbackSnapshot.previousInitialConnections =
          previousInitialConnections;
        rollbackSnapshot.newInitialConnections = newInitialConnections;
      }

      const sourceCode = sourceCodeFile.toString();

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

      if (pendingApproval) {
        this.#updateApproval(pendingApproval.id, {
          loading: false,
          type: SNAP_APPROVAL_UPDATE,
        });
      }

      return truncatedSnap;
    } catch (error) {
      logError(`Error when updating ${snapId},`, error);

      const errorString =
        error instanceof Error ? error.message : error.toString();

      if (pendingApproval) {
        this.#updateApproval(pendingApproval.id, {
          loading: false,
          error: errorString,
          type: SNAP_APPROVAL_UPDATE,
        });
      }

      this.messenger.publish(
        'SnapController:snapInstallFailed',
        snapId,
        origin,
        true,
        errorString,
      );

      throw error;
    }
  }

  async #resolveAllowlistVersion(
    snapId: SnapId,
    versionRange: SemVerRange,
  ): Promise<SemVerRange> {
    return await this.messenger.call(
      'SnapsRegistry:resolveVersion',
      snapId,
      versionRange,
    );
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

    this.#setupRuntime(snapId);
    const runtime = this.#getRuntimeExpect(snapId);
    if (!runtime.installPromise) {
      log(`Adding snap: ${snapId}`);

      // If fetching and setting the snap succeeds, this property will be set
      // to null in the authorize() method.
      runtime.installPromise = (async () => {
        const fetchedSnap = await fetchSnap(snapId, location);
        const manifest = fetchedSnap.manifest.result;
        if (!satisfiesVersionRange(manifest.version, versionRange)) {
          throw new Error(
            `Version mismatch. Manifest for "${snapId}" specifies version "${manifest.version}" which doesn't satisfy requested version range "${versionRange}".`,
          );
        }

        await this.#assertIsInstallAllowed(snapId, {
          version: manifest.version,
          checksum: manifest.source.shasum,
          permissions: manifest.initialPermissions,
          platformVersion: manifest.platformVersion,
        });

        const preinstalledArgs =
          this.#featureFlags.forcePreinstalledSnaps && isLocalSnapId(snapId)
            ? {
                preinstalled: true,
                hideSnapBranding: true,
                hidden: false,
              }
            : {};

        return this.#set({
          ...args,
          files: fetchedSnap,
          id: snapId,
          ...preinstalledArgs,
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

  async #startSnap(snapData: { snapId: SnapId; sourceCode: string }) {
    const { snapId } = snapData;
    if (this.isRunning(snapId)) {
      throw new Error(`Snap "${snapId}" is already started.`);
    }

    try {
      const runtime = this.#getRuntimeExpect(snapId);
      const result = await this.messenger.call('ExecutionService:executeSnap', {
        ...snapData,
        endowments: await this.#getEndowments(snapId),
      });

      this.#transition(snapId, SnapStatusEvents.Start);
      // We treat the initialization of the snap as the first request, for idle timing purposes.
      runtime.lastRequest = Date.now();
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
        this.messenger.call(
          'PermissionController:hasPermission',
          snapId,
          permissionName,
        )
      ) {
        const endowments = await this.messenger.call(
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
    const {
      id: snapId,
      origin,
      files,
      isUpdate = false,
      removable,
      preinstalled,
      hidden,
      hideSnapBranding,
    } = args;

    const {
      manifest,
      sourceCode: sourceCodeFile,
      svgIcon,
      auxiliaryFiles: rawAuxiliaryFiles,
      localizationFiles,
    } = files;

    assertIsSnapManifest(manifest.result);
    const { version } = manifest.result;

    const sourceCode = sourceCodeFile.toString();

    assert(
      typeof sourceCode === 'string' && sourceCode.length > 0,
      `Invalid source code for snap "${snapId}".`,
    );

    const auxiliaryFiles = rawAuxiliaryFiles.map((file) => {
      assert(typeof file.data.base64 === 'string');
      return {
        path: file.path,
        value: file.data.base64,
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
        origin,
      },
    ];

    const localizedFiles = localizationFiles.map((file) => file.result);

    const snap: Snap = {
      // Restore relevant snap state if it exists
      ...existingSnap,

      // Note that the snap will be unblocked and enabled, regardless of its
      // previous state.
      blocked: false,
      enabled: true,

      removable,
      preinstalled,
      hidden,
      hideSnapBranding,

      id: snapId,
      initialConnections: manifest.result.initialConnections,
      initialPermissions: manifest.result.initialPermissions,
      manifest: manifest.result,
      status: this.#statusMachine.config.initial as StatusStates['value'],
      sourceCode,
      version,
      versionHistory,
      auxiliaryFiles,
      localizationFiles: localizedFiles,
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

    // In case the Snap uses a localized manifest, we need to get the
    // proposed name from the localized manifest.
    const { proposedName } = getLocalizedSnapManifest(
      manifest.result,
      'en',
      localizedFiles,
    );

    this.messenger.call('SubjectMetadataController:addSubjectMetadata', {
      subjectType: SubjectType.Snap,
      name: proposedName,
      origin: snap.id,
      version,
      svgIcon: svgIcon?.toString() ?? null,
    });

    return { ...snap, sourceCode };
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
      `A snap must request at least one of the following permissions: ${handlerPermissions
        .filter((handler) => handler !== null)
        .join(', ')}.`,
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
   * Validate that the platform version specified in the manifest (if any) is
   * compatible with the current platform version.
   *
   * @param snapId - The ID of the Snap.
   * @param platformVersion - The platform version to validate against.
   * @throws If the platform version is greater than the current platform
   * version.
   */
  #validatePlatformVersion(
    snapId: SnapId,
    platformVersion: string | undefined,
  ) {
    if (platformVersion === undefined) {
      return;
    }

    if (gt(platformVersion, getPlatformVersion())) {
      const message = `The Snap "${snapId}" requires platform version "${platformVersion}" which is greater than the current platform version "${getPlatformVersion()}".`;

      if (this.#featureFlags.rejectInvalidPlatformVersion) {
        throw new Error(message);
      }

      logWarning(message);
    }
  }

  /**
   * Initiates a request for the given snap's initial permissions.
   * Must be called in order. See processRequestedSnap.
   *
   * @param snapId - The id of the Snap.
   * @param pendingApproval - Pending approval to update.
   * @returns The snap's approvedPermissions.
   */
  async #authorize(
    snapId: SnapId,
    pendingApproval: PendingApproval,
  ): Promise<void> {
    log(`Authorizing snap: ${snapId}`);
    const snapsState = this.state.snaps;
    const snap = snapsState[snapId];
    const { initialPermissions, initialConnections } = snap;

    try {
      const processedPermissions = processSnapPermissions(initialPermissions);

      this.#validateSnapPermissions(processedPermissions);

      this.#updateApproval(pendingApproval.id, {
        loading: false,
        connections: initialConnections ?? {},
        permissions: processedPermissions,
      });

      const { permissions: approvedPermissions, ...requestData } =
        (await pendingApproval.promise) as PermissionsRequest;

      this.#updatePermissions({
        snapId,
        newPermissions: approvedPermissions,
        requestData,
      });

      if (snap.manifest.initialConnections) {
        this.#handleInitialConnections(
          snapId,
          null,
          snap.manifest.initialConnections,
        );
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
    this.messenger.unsubscribe(
      'ExecutionService:unhandledError',
      this._onUnhandledSnapError,
    );

    this.messenger.unsubscribe(
      'ExecutionService:outboundRequest',
      this._onOutboundRequest,
    );

    this.messenger.unsubscribe(
      'ExecutionService:outboundResponse',
      this._onOutboundResponse,
    );

    this.messenger.clearEventSubscriptions('SnapController:snapInstalled');

    this.messenger.clearEventSubscriptions('SnapController:snapUpdated');
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
  }: SnapRpcHookArgs & { snapId: SnapId }): Promise<unknown> {
    this.#assertCanUsePlatform();

    const snap = this.get(snapId);

    assert(
      snap,
      `The Snap "${snapId}" is not installed. Please install it before invoking it.`,
    );

    assert(
      origin === METAMASK_ORIGIN || isValidUrl(origin),
      "'origin' must be a valid URL or 'metamask'.",
    );

    const request = {
      jsonrpc: '2.0',
      id: nanoid(),
      ...rawRequest,
    };

    assertIsJsonRpcRequest(request);

    const permissionName = handlerEndowments[handlerType];

    assert(
      typeof permissionName === 'string' || permissionName === null,
      "'permissionName' must be either a string or null.",
    );

    const permissions = this.messenger.call(
      'PermissionController:getPermissions',
      snapId,
    );

    // If permissionName is null, the handler does not require a permission.
    if (
      permissionName !== null &&
      (!permissions || !hasProperty(permissions, permissionName))
    ) {
      throw new Error(
        `Snap "${snapId}" is not permitted to use "${permissionName}".`,
      );
    }

    const handlerPermissions = permissionName
      ? (permissions as SubjectPermissions<PermissionConstraint>)[
          permissionName
        ]
      : undefined;

    if (
      permissionName === SnapEndowments.Rpc ||
      permissionName === SnapEndowments.Keyring
    ) {
      assert(handlerPermissions);

      const subject = this.messenger.call(
        'SubjectMetadataController:getSubjectMetadata',
        origin,
      );

      const origins =
        permissionName === SnapEndowments.Rpc
          ? getRpcCaveatOrigins(handlerPermissions)
          : getKeyringCaveatOrigins(handlerPermissions);
      assert(origins);

      if (
        !isOriginAllowed(
          origins,
          subject?.subjectType ?? SubjectType.Website,
          origin,
        )
      ) {
        throw new Error(
          `Snap "${snapId}" is not permitted to handle requests from "${origin}".`,
        );
      }
    }

    if (
      origin !== METAMASK_ORIGIN &&
      CLIENT_ONLY_HANDLERS.includes(handlerType)
    ) {
      throw new Error(`"${handlerType}" can only be invoked by MetaMask.`);
    }

    if (!snap.enabled) {
      throw new Error(`Snap "${snapId}" is disabled.`);
    }

    if (snap.status === SnapStatus.Installing) {
      throw new Error(
        `Snap "${snapId}" is currently being installed. Please try again later.`,
      );
    }

    const timeout = this.#getExecutionTimeout(handlerPermissions);

    const runtime = this.#getRuntimeExpect(snapId);

    if (runtime.stopPromise) {
      await runtime.stopPromise;
    }

    if (!this.isRunning(snapId)) {
      if (!runtime.startPromise) {
        runtime.startPromise = this.startSnap(snapId);
      }

      try {
        await runtime.startPromise;
      } finally {
        runtime.startPromise = null;
      }
    }

    const transformedRequest = this.#transformSnapRpcRequest(
      snapId,
      handlerType,
      request,
    );

    const timer = new Timer(timeout);
    this.#recordSnapRpcRequestStart(snapId, transformedRequest.id, timer);

    const handleRpcRequestPromise = this.messenger.call(
      'ExecutionService:handleRpcRequest',
      snapId,
      { origin, handler: handlerType, request: transformedRequest },
    );

    // This will either get the result or reject due to the timeout.
    try {
      const result = await withTimeout(handleRpcRequestPromise, timer);

      if (result === hasTimedOut) {
        const stopping =
          runtime.stopPromise !== null || !this.isRunning(snapId);
        throw new Error(
          stopping
            ? `${snapId} was stopped and the request was cancelled. This is likely because the Snap crashed.`
            : `${snapId} failed to respond to the request in time.`,
        );
      }

      await this.#assertSnapRpcResponse(snapId, handlerType, result);

      const transformedResult = await this.#transformSnapRpcResponse(
        snapId,
        handlerType,
        transformedRequest,
        result,
      );

      this.#recordSnapRpcRequestFinish(
        snapId,
        transformedRequest.id,
        handlerType,
        origin,
        true,
      );

      return transformedResult;
    } catch (error) {
      // We flag the RPC request as finished early since termination may affect pending requests
      this.#recordSnapRpcRequestFinish(
        snapId,
        transformedRequest.id,
        handlerType,
        origin,
        false,
      );

      const [jsonRpcError, handled] = unwrapError(error);

      const stopping = runtime.stopPromise !== null || !this.isRunning(snapId);

      if (!handled) {
        if (!stopping) {
          logError(
            `"${snapId}" crashed due to an unhandled error:`,
            jsonRpcError,
          );
        }
        await this.stopSnap(snapId, SnapStatusEvents.Crash);
      }

      throw jsonRpcError;
    }
  }

  /**
   * Set the active state of the client. This will trigger the `onActive` or
   * `onInactive` lifecycle hooks for all Snaps.
   *
   * @param active - A boolean indicating whether the client is active or not.
   */
  setClientActive(active: boolean) {
    if (active) {
      this.#callLifecycleHooks(METAMASK_ORIGIN, HandlerType.OnActive);
    } else {
      this.#callLifecycleHooks(METAMASK_ORIGIN, HandlerType.OnInactive);
    }
  }

  /**
   * Determine the execution timeout for a given handler permission.
   *
   * If no permission is specified or the permission itself has no execution timeout defined
   * the constructor argument `maxRequestTime` will be used.
   *
   * @param permission - An optional permission constraint for the handler being called.
   * @returns The execution timeout for the given handler.
   */
  #getExecutionTimeout(permission?: PermissionConstraint): number {
    return getMaxRequestTimeCaveat(permission) ?? this.maxRequestTime;
  }

  /**
   * Create a dynamic interface in the SnapInterfaceController.
   *
   * @param snapId - The snap ID.
   * @param content - The initial interface content.
   * @param contentType - The type of content.
   * @returns An identifier that can be used to identify the interface.
   */
  async #createInterface(
    snapId: SnapId,
    content: ComponentOrElement,
    contentType?: ContentType,
  ): Promise<string> {
    return this.messenger.call(
      'SnapInterfaceController:createInterface',
      snapId,
      content,
      undefined,
      contentType,
    );
  }

  #assertInterfaceExists(snapId: SnapId, id: string) {
    // This will throw if the interface isn't accessible, but we assert nevertheless.
    assert(
      this.messenger.call('SnapInterfaceController:getInterface', snapId, id),
    );
  }

  /**
   * Transform a RPC response if necessary.
   *
   * @param snapId - The snap ID of the snap that produced the result.
   * @param handlerType - The handler type that produced the result.
   * @param request - The request that returned the result.
   * @param result - The response.
   * @returns The transformed result if applicable, otherwise the original result.
   */
  async #transformSnapRpcResponse(
    snapId: SnapId,
    handlerType: HandlerType,
    request: Record<string, unknown>,
    result: unknown,
  ) {
    switch (handlerType) {
      case HandlerType.OnTransaction:
      case HandlerType.OnSignature:
      case HandlerType.OnHomePage:
      case HandlerType.OnSettingsPage: {
        // Since this type has been asserted earlier we can cast
        const castResult = result as Record<string, Json> | null;

        // If a handler returns static content, we turn it into a dynamic UI
        if (castResult && hasProperty(castResult, 'content')) {
          const { content, ...rest } = castResult;
          const id = await this.#createInterface(
            snapId,
            content as ComponentOrElement,
          );

          return { ...rest, id };
        }
        return result;
      }
      case HandlerType.OnAssetsLookup:
        // We can cast since the request and result have already been validated.
        return this.#transformOnAssetsLookupResult(
          snapId,
          request as { params: OnAssetsLookupArguments },
          result as OnAssetsLookupResponse,
        );

      case HandlerType.OnAssetsConversion:
        // We can cast since the request and result have already been validated.
        return this.#transformOnAssetsConversionResult(
          request as {
            params: OnAssetsConversionArguments;
          },
          result as OnAssetsConversionResponse,
        );

      case HandlerType.OnAssetsMarketData:
        // We can cast since the request and result have already been validated.
        return this.#transformOnAssetsMarketDataResult(
          request as { params: OnAssetsMarketDataArguments },
          result as OnAssetsMarketDataResponse,
        );

      default:
        return result;
    }
  }

  /**
   * Transform an RPC response coming from the `onAssetsLookup` handler.
   *
   * This filters out responses that are out of scope for the Snap based on
   * its permissions and the incoming request.
   *
   * @param snapId - The snap ID of the snap that produced the result.
   * @param request - The request that returned the result.
   * @param request.params - The parameters for the request.
   * @param result - The result.
   * @param result.assets - The assets returned by the Snap.
   * @returns The transformed result.
   */
  #transformOnAssetsLookupResult(
    snapId: SnapId,
    { params: requestedParams }: { params: OnAssetsLookupArguments },
    { assets }: OnAssetsLookupResponse,
  ) {
    const permissions = this.messenger.call(
      'PermissionController:getPermissions',
      snapId,
    );
    // We know the permissions are guaranteed to be set here.
    assert(permissions);

    const permission = permissions[SnapEndowments.Assets];
    const scopes = getChainIdsCaveat(permission);
    assert(scopes);

    const { assets: requestedAssets } = requestedParams;

    const filteredAssets = Object.keys(assets).reduce<
      Record<CaipAssetType, AssetMetadata | null>
    >((accumulator, assetType) => {
      const castAssetType = assetType as CaipAssetTypeOrId;
      const isValid =
        scopes.some((scope) => castAssetType.startsWith(scope)) &&
        requestedAssets.includes(castAssetType);
      // Filter out unrequested assets and assets for scopes the Snap hasn't registered for.
      if (isValid) {
        accumulator[castAssetType] = assets[castAssetType];
      }
      return accumulator;
    }, {});
    return { assets: filteredAssets };
  }

  /**
   * Transform an RPC response coming from the `onAssetsConversion` handler.
   *
   * This filters out responses that are out of scope for the Snap based on
   * the incoming request.
   *
   * @param request - The request that returned the result.
   * @param request.params - The parameters for the request.
   * @param result - The result.
   * @param result.conversionRates - The conversion rates returned by the Snap.
   * @returns The transformed result.
   */
  #transformOnAssetsConversionResult(
    { params: requestedParams }: { params: OnAssetsConversionArguments },
    { conversionRates }: OnAssetsConversionResponse,
  ) {
    const { conversions: requestedConversions } = requestedParams;

    const filteredConversionRates = requestedConversions.reduce<
      Map<CaipAssetType, Map<CaipAssetType, AssetConversion>>
    >((accumulator, conversion) => {
      const rate = conversionRates[conversion.from]?.[conversion.to];
      // Only include rates that were actually requested.
      if (rate) {
        if (!accumulator.has(conversion.from)) {
          accumulator.set(conversion.from, new Map());
        }
        accumulator.get(conversion.from).set(conversion.to, rate);
      }
      return accumulator;
    }, new Map());
    // Convert nested Maps into plain objects for return value compatibility.
    const conversionRatesObj = Object.fromEntries(
      Array.from(filteredConversionRates.entries()).map(([fromKey, toMap]) => [
        fromKey,
        Object.fromEntries(toMap.entries()),
      ]),
    );
    return { conversionRates: conversionRatesObj };
  }

  /**
   * Transforms an RPC response coming from the `onAssetsMarketData` handler.
   *
   * This filters out responses that are out of scope for the Snap based on
   * the incoming request.
   *
   * @param request - The request that returned the result.
   * @param request.params - The parameters for the request.
   * @param result - The result.
   * @param result.marketData - The market data returned by the Snap.
   * @returns The transformed result.
   */
  #transformOnAssetsMarketDataResult(
    { params: requestedParams }: { params: OnAssetsMarketDataArguments },
    { marketData }: OnAssetsMarketDataResponse,
  ) {
    const { assets: requestedAssets } = requestedParams;

    const filteredMarketData = requestedAssets.reduce<
      Record<CaipAssetTypeOrId, Record<CaipAssetType, AssetMarketData | null>>
    >((accumulator, assets) => {
      const result = marketData[assets.asset]?.[assets.unit];
      // Only include rates that were actually requested.
      if (result) {
        if (!accumulator[assets.asset]) {
          accumulator[assets.asset] = Object.create(null);
        }
        accumulator[assets.asset][assets.unit] = result;
      }
      return accumulator;
    }, Object.create(null));
    return { marketData: filteredMarketData };
  }

  /**
   * Transforms a JSON-RPC request before sending it to the Snap, if required for a given handler.
   *
   * @param snapId - The Snap ID.
   * @param handlerType - The handler being called.
   * @param request - The JSON-RPC request.
   * @returns The potentially transformed JSON-RPC request.
   */
  #transformSnapRpcRequest(
    snapId: SnapId,
    handlerType: HandlerType,
    request: JsonRpcRequest,
  ) {
    switch (handlerType) {
      // For onUserInput we inject context, so the client doesn't have to worry about keeping it in sync.
      case HandlerType.OnUserInput: {
        assert(request.params && hasProperty(request.params, 'id'));

        const interfaceId = request.params.id as string;
        const { context } = this.messenger.call(
          'SnapInterfaceController:getInterface',
          snapId,
          interfaceId,
        );

        return {
          ...request,
          params: { ...request.params, context },
        };
      }

      default:
        return request;
    }
  }

  /**
   * Assert that the returned result of a Snap RPC call is the expected shape.
   *
   * @param snapId - The snap ID.
   * @param handlerType - The handler type of the RPC Request.
   * @param result - The result of the RPC request.
   */
  async #assertSnapRpcResponse(
    snapId: SnapId,
    handlerType: HandlerType,
    result: unknown,
  ) {
    switch (handlerType) {
      case HandlerType.OnTransaction: {
        assertStruct(result, OnTransactionResponseStruct);

        if (result && hasProperty(result, 'id')) {
          this.#assertInterfaceExists(snapId, result.id as string);
        }

        break;
      }
      case HandlerType.OnSignature: {
        assertStruct(result, OnSignatureResponseStruct);

        if (result && hasProperty(result, 'id')) {
          this.#assertInterfaceExists(snapId, result.id as string);
        }

        break;
      }
      case HandlerType.OnHomePage: {
        assertStruct(result, OnHomePageResponseStruct);

        if (result && hasProperty(result, 'id')) {
          this.#assertInterfaceExists(snapId, result.id as string);
        }

        break;
      }
      case HandlerType.OnSettingsPage: {
        assertStruct(result, OnSettingsPageResponseStruct);

        if (result && hasProperty(result, 'id')) {
          this.#assertInterfaceExists(snapId, result.id as string);
        }

        break;
      }
      case HandlerType.OnNameLookup:
        assertStruct(result, OnNameLookupResponseStruct);
        break;
      case HandlerType.OnAssetsLookup:
        assertStruct(result, OnAssetsLookupResponseStruct);
        break;
      case HandlerType.OnAssetsConversion:
        assertStruct(result, OnAssetsConversionResponseStruct);
        break;
      case HandlerType.OnAssetHistoricalPrice:
        assertStruct(result, OnAssetHistoricalPriceResponseStruct);
        break;
      case HandlerType.OnAssetsMarketData:
        assertStruct(result, OnAssetsMarketDataResponseStruct);
        break;
      default:
        break;
    }
  }

  #recordSnapRpcRequestStart(snapId: SnapId, requestId: unknown, timer: Timer) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.pendingInboundRequests.push({ requestId, timer });
    runtime.lastRequest = null;
  }

  #recordSnapRpcRequestFinish(
    snapId: SnapId,
    requestId: unknown,
    handlerType: HandlerType,
    origin: string,
    success: boolean,
  ) {
    const runtime = this.#getRuntimeExpect(snapId);
    runtime.pendingInboundRequests = runtime.pendingInboundRequests.filter(
      (request) => request.requestId !== requestId,
    );

    if (runtime.pendingInboundRequests.length === 0) {
      runtime.lastRequest = Date.now();
    }

    const snap = this.get(snapId);

    if (isTrackableHandler(handlerType) && !snap?.preinstalled) {
      try {
        this.#trackSnapExport(snapId, handlerType, success, origin);
      } catch (error) {
        logError(
          `Error when calling MetaMetrics hook for snap "${snap?.id}": ${getErrorMessage(
            error,
          )}`,
        );
      }
    }
  }

  /**
   * Retrieves the rollback snapshot of a snap.
   *
   * @param snapId - The snap id.
   * @returns A `RollbackSnapshot` or `undefined` if one doesn't exist.
   */
  #getRollbackSnapshot(snapId: SnapId): RollbackSnapshot | undefined {
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
  #createRollbackSnapshot(snapId: SnapId): RollbackSnapshot {
    assert(
      this.#rollbackSnapshots.get(snapId) === undefined,
      `Snap "${snapId}" rollback snapshot already exists.`,
    );

    this.#rollbackSnapshots.set(snapId, {
      statePatches: [],
      permissions: {},
      newVersion: '',
    });

    const newRollbackSnapshot = this.#rollbackSnapshots.get(snapId);

    assert(
      newRollbackSnapshot !== undefined,
      `Snapshot creation failed for ${snapId}.`,
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
  async #rollbackSnap(snapId: SnapId) {
    const rollbackSnapshot = this.#getRollbackSnapshot(snapId);
    if (!rollbackSnapshot) {
      throw new Error('A snapshot does not exist for this snap.');
    }

    await this.stopSnap(snapId, SnapStatusEvents.Stop);
    // Always set to stopped even if it wasn't running initially
    if (this.get(snapId)?.status !== SnapStatus.Stopped) {
      this.#transition(snapId, SnapStatusEvents.Stop);
    }

    const {
      statePatches,
      permissions,
      previousInitialConnections,
      newInitialConnections,
    } = rollbackSnapshot;

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

    this.#updatePermissions({
      snapId,
      unusedPermissions: permissions.granted,
      newPermissions: permissions.revoked,
      requestData: permissions.requestData,
    });

    // Calling this in reverse order to undo the changes
    this.#handleInitialConnections(
      snapId,
      newInitialConnections ?? null,
      previousInitialConnections ?? {},
    );

    const truncatedSnap = this.getTruncatedExpect(snapId);

    this.messenger.publish(
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
  async #rollbackSnaps(snapIds: SnapId[]) {
    for (const snapId of snapIds) {
      await this.#rollbackSnap(snapId);
    }
  }

  #getRuntime(snapId: SnapId): SnapRuntimeData | undefined {
    return this.#snapsRuntimeData.get(snapId);
  }

  #getRuntimeExpect(snapId: SnapId): SnapRuntimeData {
    const runtime = this.#getRuntime(snapId);
    assert(runtime !== undefined, `Snap "${snapId}" runtime data not found`);
    return runtime;
  }

  #setupRuntime(snapId: SnapId) {
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
      startPromise: null,
      stopPromise: null,
      installPromise: null,
      encryptionKey: null,
      encryptionSalt: null,
      activeReferences: 0,
      pendingInboundRequests: [],
      pendingOutboundRequests: 0,
      interpreter,
      stateMutex: new Mutex(),
      getStateMutex: new Mutex(),
    });
  }

  #calculatePermissionsChange(
    snapId: SnapId,
    desiredPermissionsSet: Record<
      string,
      Pick<PermissionConstraint, 'caveats'>
    >,
  ): {
    newPermissions: Record<string, Pick<PermissionConstraint, 'caveats'>>;
    unusedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
    approvedPermissions: SubjectPermissions<
      ValidPermission<string, Caveat<string, any>>
    >;
  } {
    const oldPermissions =
      this.messenger.call('PermissionController:getPermissions', snapId) ?? {};

    const newPermissions = permissionsDiff(
      desiredPermissionsSet,
      oldPermissions,
    );
    // TODO(ritave): The assumption that these are unused only holds so long as we do not
    //               permit dynamic permission requests.
    const unusedPermissions = permissionsDiff(
      oldPermissions,
      desiredPermissionsSet,
    );

    // It's a Set Intersection of oldPermissions and desiredPermissionsSet
    // oldPermissions ∖ (oldPermissions ∖ desiredPermissionsSet) ⟺ oldPermissions ∩ desiredPermissionsSet
    const approvedPermissions = permissionsDiff(
      oldPermissions,
      unusedPermissions,
    );

    return { newPermissions, unusedPermissions, approvedPermissions };
  }

  #isSubjectConnectedToSnap(snapId: SnapId, origin: string) {
    const subjectPermissions = this.messenger.call(
      'PermissionController:getPermissions',
      origin,
    ) as SubjectPermissions<PermissionConstraint>;

    const existingCaveat = subjectPermissions?.[
      WALLET_SNAP_PERMISSION_KEY
    ]?.caveats?.find((caveat) => caveat.type === SnapCaveatType.SnapIds);

    return Boolean((existingCaveat?.value as Record<string, Json>)?.[snapId]);
  }

  #calculateConnectionsChange(
    snapId: SnapId,
    oldConnectionsSet: Record<string, Json>,
    desiredConnectionsSet: Record<string, Json>,
  ): {
    newConnections: Record<string, Json>;
    unusedConnections: Record<string, Json>;
    approvedConnections: Record<string, Json>;
  } {
    // Filter out any origins that have been revoked since last install/update.
    // That way they will be represented as new.
    const filteredOldConnections = Object.keys(oldConnectionsSet)
      .filter((origin) => this.#isSubjectConnectedToSnap(snapId, origin))
      .reduce<Record<string, Json>>((accumulator, origin) => {
        accumulator[origin] = oldConnectionsSet[origin];
        return accumulator;
      }, {});

    const newConnections = setDiff(
      desiredConnectionsSet,
      filteredOldConnections,
    );

    const unusedConnections = setDiff(
      filteredOldConnections,
      desiredConnectionsSet,
    );

    // It's a Set Intersection of oldConnections and desiredConnectionsSet
    // oldConnections ∖ (oldConnections ∖ desiredConnectionsSet) ⟺ oldConnections ∩ desiredConnectionsSet
    const approvedConnections = setDiff(
      filteredOldConnections,
      unusedConnections,
    );

    return { newConnections, unusedConnections, approvedConnections };
  }

  /**
   * Get the permissions to grant to a Snap following an install, update or
   * rollback.
   *
   * @param snapId - The snap ID.
   * @param newPermissions - The new permissions to be granted.
   * @returns The permissions to grant to the Snap.
   */
  #getPermissionsToGrant(snapId: SnapId, newPermissions: RequestedPermissions) {
    if (Object.keys(newPermissions).includes(SnapEndowments.EthereumProvider)) {
      // This will return the globally selected network if the Snap doesn't have
      // one set.
      const networkClientId = this.messenger.call(
        'SelectedNetworkController:getNetworkClientIdForDomain',
        snapId,
      );

      const { configuration } = this.messenger.call(
        'NetworkController:getNetworkClientById',
        networkClientId,
      );

      const chainId = hexToNumber(configuration.chainId);

      // This needs to be assigned to have proper type inference.
      const modifiedPermissions: RequestedPermissions = {
        ...newPermissions,
        'endowment:caip25': {
          caveats: [
            {
              type: 'authorizedScopes',
              value: {
                requiredScopes: {},
                optionalScopes: {
                  [`eip155:${chainId}`]: {
                    accounts: [],
                  },
                },
                sessionProperties: {},
                isMultichainOrigin: false,
              },
            },
          ],
        },
      };

      return modifiedPermissions;
    }

    return newPermissions;
  }

  /**
   * Update the permissions for a snap following an install, update or rollback.
   *
   * Grants newly requested permissions and revokes unused/revoked permissions.
   *
   * @param args - An options bag.
   * @param args.snapId - The snap ID.
   * @param args.newPermissions - New permissions to be granted.
   * @param args.unusedPermissions - Unused permissions to be revoked.
   * @param args.requestData - Optional request data from an approval.
   */
  #updatePermissions({
    snapId,
    unusedPermissions = {},
    newPermissions = {},
    requestData,
  }: {
    snapId: SnapId;
    newPermissions?:
      | RequestedPermissions
      | Record<string, Pick<PermissionConstraint, 'caveats'>>;
    unusedPermissions?:
      | RequestedPermissions
      | SubjectPermissions<ValidPermission<string, Caveat<string, any>>>;
    requestData?: Record<string, unknown>;
  }) {
    const unusedPermissionsKeys = Object.keys(unusedPermissions);
    if (isNonEmptyArray(unusedPermissionsKeys)) {
      this.messenger.call('PermissionController:revokePermissions', {
        [snapId]: unusedPermissionsKeys,
      });
    }

    if (isNonEmptyArray(Object.keys(newPermissions))) {
      const approvedPermissions = this.#getPermissionsToGrant(
        snapId,
        newPermissions,
      );

      this.messenger.call('PermissionController:grantPermissions', {
        approvedPermissions,
        subject: { origin: snapId },
        requestData,
      });
    }
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
   * @param newVersionRange - The new version range being requested.
   * @returns `true` if validation checks pass and `false` if they do not.
   */
  #isValidUpdate(snapId: SnapId, newVersionRange: SemVerRange): boolean {
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
   * Call a lifecycle hook for all runnable Snaps.
   *
   * @param origin - The origin of the request.
   * @param handler - The lifecycle hook to call. This should be one of the
   * supported lifecycle hooks.
   */
  #callLifecycleHooks(origin: string, handler: HandlerType) {
    const snaps = this.getRunnableSnaps();
    for (const { id } of snaps) {
      const hasLifecycleHooksEndowment = this.messenger.call(
        'PermissionController:hasPermission',
        id,
        SnapEndowments.LifecycleHooks,
      );

      if (!hasLifecycleHooksEndowment) {
        continue;
      }

      this.#callLifecycleHook(origin, id, handler).catch((error) => {
        logError(
          `Error calling lifecycle hook "${handler}" for Snap "${id}": ${getErrorMessage(
            error,
          )}`,
        );
      });
    }
  }

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
  async #callLifecycleHook(
    origin: string,
    snapId: SnapId,
    handler: HandlerType,
  ) {
    const permissionName = handlerEndowments[handler];

    assert(permissionName, 'Lifecycle hook must have an endowment.');

    const hasPermission = this.messenger.call(
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
      origin,
      request: {
        jsonrpc: '2.0',
        method: handler,
      },
    });
  }

  /**
   * Handle the `KeyringController:lock` event.
   *
   * Currently this clears the cached encrypted state (if any) for all Snaps.
   */
  #handleLock() {
    for (const runtime of this.#snapsRuntimeData.values()) {
      runtime.encryptionKey = null;
      runtime.encryptionSalt = null;
      runtime.state = undefined;
    }
  }
}
