import type { ApprovalRequest } from '@metamask/approval-controller';
import {
  decryptWithKey,
  encryptWithKey,
  exportKey,
  generateSalt,
  importKey,
  isVaultUpdated,
  keyFromPassword,
} from '@metamask/browser-passworder';
import type {
  MessengerActions,
  MessengerEvents,
  MockAnyNamespace,
} from '@metamask/messenger';
import { Messenger } from '@metamask/messenger';
import type {
  Caveat,
  PermissionConstraint,
  SubjectMetadata,
  SubjectPermissions,
  ValidPermission,
} from '@metamask/permission-controller';
import { SubjectType } from '@metamask/permission-controller';
import { providerErrors } from '@metamask/rpc-errors';
import {
  SnapEndowments,
  WALLET_SNAP_PERMISSION_KEY,
} from '@metamask/snaps-rpc-methods';
import { ContentType, type SnapId } from '@metamask/snaps-sdk';
import { Text } from '@metamask/snaps-sdk/jsx';
import type { PersistedSnap, Snap } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  getPersistedSnapObject,
  getSnapObject,
  MOCK_LOCAL_SNAP_ID,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  MockControllerMessenger,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import type {
  InitialStorageData,
  StorageServiceActions,
  StorageServiceEvents,
} from '@metamask/storage-service';
import {
  InMemoryStorageAdapter,
  StorageService,
} from '@metamask/storage-service';
import type { Json } from '@metamask/utils';

import { MOCK_CRONJOB_PERMISSION } from './cronjob';
import { getNodeEES, getNodeEESMessenger } from './execution-environment';
import { MockSnapsRegistry } from './registry';
import type { CronjobControllerMessenger } from '../cronjob/CronjobController';
import type { SnapInsightsControllerMessenger } from '../insights';
import type {
  SnapInterfaceControllerMessenger,
  StoredInterface,
} from '../interface/SnapInterfaceController';
import type { MultichainRoutingServiceMessenger } from '../multichain/MultichainRoutingService';
import type { ExecutionService, ExecutionServiceMessenger } from '../services';
import type { SnapRegistryControllerMessenger } from '../snaps';
import { SnapController } from '../snaps';
import type {
  PersistedSnapControllerState,
  SnapControllerMessenger,
  SnapControllerStateChangeEvent,
} from '../snaps/SnapController';
import type { KeyDerivationOptions } from '../types';
import type { WebSocketServiceMessenger } from '../websocket';

const asyncNoOp = async () => Promise.resolve();

/**
 * A controller messenger, that allows overwriting the action handlers, without
 * the need to call `unregisterActionHandler` first.
 */

export class MockApprovalController {
  #approval?: {
    request: Partial<ApprovalRequest<Record<string, Json>>>;
    promise: {
      resolve: (value?: unknown) => void;
      reject: (value?: unknown) => void;
    };
  };

  async addRequest(request: {
    id?: string;
    origin?: string;
    requestData?: Record<string, Json>;
  }) {
    const promise = new Promise((resolve, reject) => {
      this.#approval = {
        promise: { resolve, reject },
        request,
      };
    });

    return promise;
  }

  hasRequest(
    opts: { id?: string; origin?: string; type?: string } = {},
  ): boolean {
    return this.#approval?.request.id === opts.id;
  }

  async acceptRequest(_id: string, value: unknown) {
    if (this.#approval) {
      this.#approval.promise.resolve(value);
      return await Promise.resolve({ value });
    }

    return await Promise.reject(new Error('No request to approve.'));
  }

  updateRequestStateAndApprove({
    requestState,
  }: {
    requestState: Record<string, Json>;
  }) {
    if (this.#approval) {
      if (requestState.loading === false && !requestState.error) {
        this.#approval.promise.resolve({
          permissions: requestState.permissions,
          ...this.#approval.request.requestData,
        });
      }
    }
  }

  updateRequestStateAndReject({
    requestState,
  }: {
    requestState: Record<string, Json>;
  }) {
    if (this.#approval) {
      if (requestState.loading === false && !requestState.error) {
        this.#approval.promise.reject(providerErrors.userRejectedRequest());
      }
    }
  }
}

export const approvalControllerMock = new MockApprovalController();

export const snapDialogPermissionKey = 'snap_dialog';

export const MOCK_INTERFACE_ID = 'QovlAsV2Z3xLP5hsrVMsz';

export const MOCK_ACCOUNT_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

export const MOCK_SNAP_SUBJECT_METADATA: SubjectMetadata = {
  origin: MOCK_SNAP_ID,
  subjectType: SubjectType.Snap,
  name: 'foo',
  extensionId: 'bar',
  iconUrl: 'baz',
};

export const MOCK_DAPP_SUBJECT_METADATA: SubjectMetadata = {
  origin: MOCK_ORIGIN,
  subjectType: SubjectType.Website,
  name: 'foo',
  extensionId: 'bar',
  iconUrl: 'baz',
};

export const MOCK_RPC_ORIGINS_PERMISSION: PermissionConstraint = {
  caveats: [
    { type: SnapCaveatType.RpcOrigin, value: { snaps: true, dapps: false } },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Rpc,
};

export const MOCK_LIFECYCLE_HOOKS_PERMISSION: PermissionConstraint = {
  caveats: null,
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.LifecycleHooks,
};

export const MOCK_KEYRING_ORIGINS_PERMISSION: PermissionConstraint = {
  caveats: [
    { type: SnapCaveatType.KeyringOrigin, value: { allowedOrigins: [] } },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Keyring,
};

export const MOCK_DAPPS_RPC_ORIGINS_PERMISSION: PermissionConstraint = {
  caveats: [
    { type: SnapCaveatType.RpcOrigin, value: { snaps: false, dapps: true } },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Rpc,
};

export const MOCK_ALLOWED_RPC_ORIGINS_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.RpcOrigin,
      value: { allowedOrigins: ['https://metamask.io'] },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Rpc,
};

export const MOCK_SNAP_DIALOG_PERMISSION: PermissionConstraint = {
  caveats: null,
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: snapDialogPermissionKey,
};

export const MOCK_WALLET_SNAP_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.SnapIds,
      value: {
        [MOCK_SNAP_ID]: {},
        [MOCK_LOCAL_SNAP_ID]: {},
        [`${MOCK_SNAP_ID}1`]: {},
        [`${MOCK_SNAP_ID}2`]: {},
        [`${MOCK_SNAP_ID}3`]: {},
      },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: WALLET_SNAP_PERMISSION_KEY,
};

export const MOCK_ORIGIN_PERMISSIONS: Record<string, PermissionConstraint> = {
  [WALLET_SNAP_PERMISSION_KEY]: MOCK_WALLET_SNAP_PERMISSION,
};

export const MOCK_SNAP_PERMISSIONS: Record<string, PermissionConstraint> = {
  [SnapEndowments.Rpc]: MOCK_RPC_ORIGINS_PERMISSION,
  [snapDialogPermissionKey]: MOCK_SNAP_DIALOG_PERMISSION,
};

export const MOCK_INSIGHTS_PERMISSIONS: Record<string, PermissionConstraint> = {
  [SnapEndowments.TransactionInsight]: {
    caveats: [
      {
        type: SnapCaveatType.TransactionOrigin,
        value: true,
      },
    ],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: MOCK_SNAP_ID,
    parentCapability: SnapEndowments.TransactionInsight,
  },
  [SnapEndowments.SignatureInsight]: {
    caveats: [
      {
        type: SnapCaveatType.SignatureOrigin,
        value: true,
      },
    ],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: MOCK_SNAP_ID,
    parentCapability: SnapEndowments.SignatureInsight,
  },
};

export const MOCK_INSIGHTS_PERMISSIONS_NO_ORIGINS: Record<
  string,
  PermissionConstraint
> = {
  [SnapEndowments.TransactionInsight]: {
    caveats: [
      {
        type: SnapCaveatType.TransactionOrigin,
        value: false,
      },
    ],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: MOCK_SNAP_ID,
    parentCapability: SnapEndowments.TransactionInsight,
  },
  [SnapEndowments.SignatureInsight]: {
    caveats: [
      {
        type: SnapCaveatType.SignatureOrigin,
        value: false,
      },
    ],
    date: 1664187844588,
    id: 'izn0WGUO8cvq_jqvLQuQP',
    invoker: MOCK_SNAP_ID,
    parentCapability: SnapEndowments.SignatureInsight,
  },
};

/**
 * The type of the messenger populated with all external actions and events
 * required by the controller under test.
 */
export type RootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<
    | SnapControllerMessenger
    | SnapRegistryControllerMessenger
    | ExecutionServiceMessenger
  >,
  MessengerEvents<
    | SnapControllerMessenger
    | SnapRegistryControllerMessenger
    | ExecutionServiceMessenger
  >
>;

export const getRootMessenger = () => {
  const messenger: RootMessenger = new MockControllerMessenger();

  messenger.registerActionHandler(
    'PermissionController:hasPermission',
    (_id, permission) => {
      return permission !== SnapEndowments.LifecycleHooks;
    },
  );

  messenger.registerActionHandler('PermissionController:hasPermissions', () => {
    return true;
  });

  messenger.registerActionHandler(
    'ApprovalController:addRequest',
    approvalControllerMock.addRequest.bind(approvalControllerMock),
  );

  messenger.registerActionHandler(
    'ApprovalController:updateRequestState',
    approvalControllerMock.updateRequestStateAndApprove.bind(
      approvalControllerMock,
    ),
  );

  messenger.registerActionHandler(
    'PermissionController:getEndowments',
    async () => {
      return Promise.resolve(['ethereum']);
    },
  );

  messenger.registerActionHandler(
    'PermissionController:grantPermissions',
    () => ({}),
  );

  messenger.registerActionHandler(
    'PermissionController:revokePermissions',
    () => ({}),
  );

  messenger.registerActionHandler(
    'PermissionController:revokeAllPermissions',
    () => ({}),
  );

  messenger.registerActionHandler(
    'PermissionController:revokePermissionForAllSubjects',
    () => ({}),
  );

  messenger.registerActionHandler(
    'PermissionController:getPermissions',
    (
      origin,
    ): SubjectPermissions<
      ValidPermission<string, Caveat<string, Json> | Caveat<string, any>>
    > => {
      if (origin === MOCK_SNAP_ID) {
        return MOCK_SNAP_PERMISSIONS;
      }
      return MOCK_ORIGIN_PERMISSIONS;
    },
  );

  messenger.registerActionHandler(
    'PermissionController:getSubjectNames',
    () => [MOCK_ORIGIN],
  );

  messenger.registerActionHandler(
    'PermissionController:updateCaveat',
    () => undefined,
  );

  messenger.registerActionHandler(
    'SubjectMetadataController:getSubjectMetadata',
    () => MOCK_SNAP_SUBJECT_METADATA,
  );

  messenger.registerActionHandler(
    'SubjectMetadataController:addSubjectMetadata',
    () => undefined,
  );

  messenger.registerActionHandler(
    'ExecutionService:executeSnap',
    async () => 'OK',
  );
  messenger.registerActionHandler(
    'ExecutionService:handleRpcRequest',
    asyncNoOp,
  );
  messenger.registerActionHandler('ExecutionService:terminateSnap', asyncNoOp);

  // eslint-disable-next-line no-new
  new MockSnapsRegistry(messenger);

  messenger.registerActionHandler(
    'SnapInterfaceController:createInterface',
    () => MOCK_INTERFACE_ID,
  );

  messenger.registerActionHandler(
    'SnapInterfaceController:getInterface',
    (snapId, id): StoredInterface => {
      if (id !== MOCK_INTERFACE_ID) {
        throw new Error(`Interface with id '${id}' not found.`);
      }

      return {
        snapId,
        content: <Text>console.log('hello world');</Text>,
        contentType: ContentType.Dialog,
        state: {},
        context: null,
        displayed: false,
      };
    },
  );

  messenger.registerActionHandler(
    'SnapInterfaceController:setInterfaceDisplayed',
    () => undefined,
  );

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getSnapControllerMessenger = (
  messenger: RootMessenger = getRootMessenger(),
) => {
  const snapControllerMessenger: SnapControllerMessenger = new Messenger({
    namespace: 'SnapController',
    parent: messenger,
  });

  messenger.delegate({
    actions: [
      'ApprovalController:addRequest',
      'ApprovalController:updateRequestState',
      'ExecutionService:executeSnap',
      'ExecutionService:terminateSnap',
      'ExecutionService:handleRpcRequest',
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:hasPermissions',
      'PermissionController:getPermissions',
      'PermissionController:grantPermissions',
      'PermissionController:revokePermissions',
      'PermissionController:revokeAllPermissions',
      'PermissionController:revokePermissionForAllSubjects',
      'PermissionController:updateCaveat',
      'PermissionController:getSubjectNames',
      'SubjectMetadataController:getSubjectMetadata',
      'SubjectMetadataController:addSubjectMetadata',
      'SnapRegistryController:get',
      'SnapRegistryController:getMetadata',
      'SnapRegistryController:requestUpdate',
      'SnapRegistryController:resolveVersion',
      'SnapInterfaceController:createInterface',
      'SnapInterfaceController:setInterfaceDisplayed',
      'SnapInterfaceController:getInterface',
      'StorageService:setItem',
      'StorageService:getItem',
      'StorageService:removeItem',
      'StorageService:clear',
    ],
    events: [
      'ExecutionService:unhandledError',
      'ExecutionService:outboundRequest',
      'ExecutionService:outboundResponse',
      'KeyringController:lock',
      'SnapRegistryController:stateChange',
    ],
    messenger: snapControllerMessenger,
  });

  jest.spyOn(snapControllerMessenger, 'call');
  jest.spyOn(snapControllerMessenger, 'publish');

  return snapControllerMessenger;
};

export type SnapControllerConstructorParams = ConstructorParameters<
  typeof SnapController
>[0];

export type SnapControllerStateWithStorageService = Omit<
  PersistedSnapControllerState,
  'snaps'
> & {
  snaps: Record<SnapId, PersistedSnap>;
};

export type SnapControllerConstructorParamsWithStorage = Omit<
  SnapControllerConstructorParams,
  'state'
> & {
  state: SnapControllerStateWithStorageService;
};

export type PartialSnapControllerConstructorParamsWithStorage = Partial<
  Omit<SnapControllerConstructorParamsWithStorage, 'state'> & {
    state?: Partial<SnapControllerStateWithStorageService>;
  }
>;

export const DEFAULT_ENCRYPTION_KEY_DERIVATION_OPTIONS = {
  algorithm: 'PBKDF2' as const,
  params: {
    iterations: 600_000,
  },
};

export const getSnapControllerEncryptor = () => {
  return {
    encryptWithKey,
    decryptWithKey,
    keyFromPassword: async (
      password: string,
      salt: string,
      exportable: boolean,
      opts?: KeyDerivationOptions,
    ) =>
      keyFromPassword(
        password,
        salt,
        exportable,
        opts ?? DEFAULT_ENCRYPTION_KEY_DERIVATION_OPTIONS,
      ),
    importKey,
    exportKey,
    generateSalt,
    isVaultUpdated: (vault: string) =>
      isVaultUpdated(vault, DEFAULT_ENCRYPTION_KEY_DERIVATION_OPTIONS),
  };
};

export type GetSnapControllerOptionsParam = Omit<
  PartialSnapControllerConstructorParamsWithStorage,
  'messenger'
> & { rootMessenger?: ReturnType<typeof getRootMessenger> };

export const getSnapControllerOptions = ({
  rootMessenger = getRootMessenger(),
  ...opts
}: GetSnapControllerOptionsParam = {}) => {
  const snapControllerMessenger = getSnapControllerMessenger(rootMessenger);

  const options = {
    environmentEndowmentPermissions: [],
    messenger: snapControllerMessenger,
    rootMessenger,
    featureFlags: {
      dappsCanUpdateSnaps: true,
      rejectInvalidPlatformVersion: true,
    },
    state: undefined,
    fetchFunction: jest.fn(),
    getMnemonicSeed: async () =>
      Promise.resolve(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES),
    clientCryptography: {},
    encryptor: getSnapControllerEncryptor(),
    trackEvent: jest.fn(),
    ensureOnboardingComplete: jest.fn().mockResolvedValue(undefined),
    ...opts,
  } as SnapControllerConstructorParamsWithStorage & {
    rootMessenger: ReturnType<typeof getRootMessenger>;
  };

  options.state = {
    snaps: {},
    snapStates: {},
    unencryptedSnapStates: {},
    isReady: false,
    ...opts?.state,
  };

  return options;
};

export const extractSourceCodeFromSnapsState = (
  snaps: Record<SnapId, PersistedSnap>,
): {
  snaps: Record<SnapId, Snap>;
  snapsData: Record<SnapId, { sourceCode: string }>;
} => {
  return Object.entries(snaps).reduce<{
    snaps: Record<SnapId, Snap>;
    snapsData: Record<SnapId, { sourceCode: string }>;
  }>(
    (acc, [snapId, snap]) => {
      const { sourceCode, ...rest } = snap;
      acc.snaps[snapId as SnapId] = rest;
      acc.snapsData[snapId as SnapId] = { sourceCode };
      return acc;
    },
    { snaps: {}, snapsData: {} },
  );
};

export const getStorageService = (
  messenger: ReturnType<typeof getRootMessenger>,
  initialData?: InitialStorageData,
) => {
  const storageServiceMessenger = new Messenger<
    'StorageService',
    StorageServiceActions,
    StorageServiceEvents,
    any
  >({
    namespace: 'StorageService',
    parent: messenger,
  });

  return new StorageService({
    messenger: storageServiceMessenger,
    storage: new InMemoryStorageAdapter(initialData),
  });
};

export const getSnapController = async (
  options = getSnapControllerOptions(),
  init = true,
) => {
  const { rootMessenger, ...controllerOptions } = options;

  const { snaps, snapsData } = extractSourceCodeFromSnapsState(
    controllerOptions.state?.snaps ?? {},
  );

  getStorageService(rootMessenger, {
    SnapController: snapsData,
  });

  const controller = new SnapController({
    ...controllerOptions,
    state: {
      ...controllerOptions.state,
      snaps,
    },
  });

  if (init) {
    await controller.init();
  }

  return controller;
};

export const getSnapControllerWithEES = async (
  options = getSnapControllerOptions(),
  service?: ExecutionService,
  init = true,
) => {
  const _service =
    service ?? getNodeEES(getNodeEESMessenger(options.rootMessenger));

  const { snaps, snapsData } = extractSourceCodeFromSnapsState(
    options.state?.snaps ?? {},
  );

  getStorageService(options.rootMessenger, {
    SnapController: snapsData,
  });

  const controller = new SnapController({
    ...options,
    state: {
      ...options.state,
      snaps,
    },
  });

  if (init) {
    await controller.init();
  }

  return [controller, _service] as const;
};

export const getPersistedSnapsState = (
  ...snaps: SnapControllerStateWithStorageService['snaps'][SnapId][]
): SnapControllerStateWithStorageService['snaps'] => {
  return (snaps.length > 0 ? snaps : [getPersistedSnapObject()]).reduce<
    SnapControllerStateWithStorageService['snaps']
  >((snapsState, snapObject) => {
    snapsState[snapObject.id] = snapObject;
    return snapsState;
  }, {});
};

type CronjobControllerRootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<CronjobControllerMessenger>,
  MessengerEvents<CronjobControllerMessenger>
>;

// Mock controller messenger for Cronjob Controller
export const getRootCronjobControllerMessenger = () => {
  const messenger: CronjobControllerRootMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedCronjobControllerMessenger = (
  messenger: CronjobControllerRootMessenger = getRootCronjobControllerMessenger(),
  mocked = true,
) => {
  const cronjobControllerMessenger: CronjobControllerMessenger = new Messenger({
    namespace: 'CronjobController',
    parent: messenger,
  });

  messenger.delegate({
    actions: [
      'PermissionController:getPermissions',
      'SnapController:handleRequest',
    ],
    events: [
      'SnapController:snapInstalled',
      'SnapController:snapUpdated',
      'SnapController:snapUninstalled',
      'SnapController:snapEnabled',
      'SnapController:snapDisabled',
    ],
    messenger: cronjobControllerMessenger,
  });

  if (mocked) {
    messenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION };
      },
    );

    messenger.registerActionHandler('SnapController:handleRequest', asyncNoOp);
  }

  jest.spyOn(cronjobControllerMessenger, 'call');

  return cronjobControllerMessenger;
};

type SnapRegistryControllerRootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<SnapRegistryControllerMessenger>,
  MessengerEvents<SnapRegistryControllerMessenger>
>;

export const getRootSnapRegistryControllerMessenger = () => {
  const messenger: SnapRegistryControllerRootMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedSnapRegistryControllerMessenger = (
  rootMessenger: ReturnType<
    typeof getRootSnapRegistryControllerMessenger
  > = getRootSnapRegistryControllerMessenger(),
) => {
  const messenger: SnapRegistryControllerMessenger = new Messenger({
    namespace: 'SnapRegistryController',
    parent: rootMessenger,
  });

  return messenger;
};

/**
 * The type of the messenger populated with all external actions and events
 * required by the controller under test.
 */
type SnapInterfaceControllerRootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<SnapInterfaceControllerMessenger>,
  MessengerEvents<SnapInterfaceControllerMessenger>
>;

// Mock controller messenger for Interface Controller
export const getRootSnapInterfaceControllerMessenger = () => {
  const messenger: SnapInterfaceControllerRootMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedSnapInterfaceControllerMessenger = (
  messenger: ReturnType<
    typeof getRootSnapInterfaceControllerMessenger
  > = getRootSnapInterfaceControllerMessenger(),
  mocked = true,
) => {
  const snapInterfaceControllerMessenger: SnapInterfaceControllerMessenger =
    new Messenger({ namespace: 'SnapInterfaceController', parent: messenger });

  messenger.delegate({
    actions: [
      'PhishingController:testOrigin',
      'ApprovalController:hasRequest',
      'ApprovalController:acceptRequest',
      'MultichainAssetsController:getState',
      'AccountsController:getAccountByAddress',
      'SnapController:getSnap',
      'AccountsController:getSelectedMultichainAccount',
      'AccountsController:listMultichainAccounts',
      'PermissionController:hasPermission',
    ],
    events: ['NotificationServicesController:notificationsListUpdated'],
    messenger: snapInterfaceControllerMessenger,
  });

  if (mocked) {
    messenger.registerActionHandler('PhishingController:testOrigin', () => ({
      result: false,
      type: 'all',
    }));

    messenger.registerActionHandler(
      'MultichainAssetsController:getState',
      () => ({
        assetsMetadata: {
          // @ts-expect-error partial mock
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
            name: 'Solana',
            symbol: 'SOL',
          },
        },
        accountsAssets: {
          [MOCK_ACCOUNT_ID]: [],
        },
      }),
    );

    messenger.registerActionHandler(
      'AccountsController:getAccountByAddress',
      // @ts-expect-error partial mock
      (address: string) => ({
        address,
        id: MOCK_ACCOUNT_ID,
        scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
      }),
    );

    messenger.registerActionHandler(
      'AccountsController:getSelectedMultichainAccount',
      // @ts-expect-error partial mock
      () => ({
        address: '0x1234567890123456789012345678901234567890',
        id: MOCK_ACCOUNT_ID,
        scopes: ['eip155:0'],
      }),
    );

    messenger.registerActionHandler(
      'AccountsController:listMultichainAccounts',
      () => [
        // @ts-expect-error partial mock
        {
          id: MOCK_ACCOUNT_ID,
          address: '0x1234567890123456789012345678901234567890',
          scopes: ['eip155:0'],
        },
      ],
    );

    messenger.registerActionHandler(
      'SnapController:getSnap',
      (snapId: string) => {
        return getSnapObject({ id: snapId as SnapId });
      },
    );
  }

  jest.spyOn(snapInterfaceControllerMessenger, 'call');

  return snapInterfaceControllerMessenger;
};

type RootSnapInsightsControllerMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<SnapInsightsControllerMessenger>,
  MessengerEvents<SnapInsightsControllerMessenger>
>;

// Mock controller messenger for Insight Controller
export const getRootSnapInsightsControllerMessenger = () => {
  const messenger: RootSnapInsightsControllerMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedSnapInsightsControllerMessenger = (
  messenger: RootSnapInsightsControllerMessenger = getRootSnapInsightsControllerMessenger(),
) => {
  const controllerMessenger: SnapInsightsControllerMessenger = new Messenger({
    namespace: 'SnapInsightsController',
    parent: messenger,
  });

  messenger.delegate({
    actions: [
      'PermissionController:getPermissions',
      'SnapController:getRunnableSnaps',
      'SnapController:handleRequest',
      'SnapInterfaceController:deleteInterface',
    ],
    events: [
      'TransactionController:unapprovedTransactionAdded',
      'TransactionController:transactionStatusUpdated',
      'SignatureController:stateChange',
    ],
    messenger: controllerMessenger,
  });

  jest.spyOn(controllerMessenger, 'call');

  return controllerMessenger;
};

/**
 * Wait for the state change event to be emitted by the messenger.
 *
 * @param messenger - The messenger to listen to.
 * @returns A promise that resolves when the state change event is emitted.
 */
export async function waitForStateChange(
  messenger: Messenger<'SnapController', any, SnapControllerStateChangeEvent>,
) {
  return new Promise<void>((resolve) => {
    messenger.subscribe('SnapController:stateChange', () => {
      resolve();
    });
  });
}

type MultichainRoutingServiceRootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<MultichainRoutingServiceMessenger>
>;

// Mock controller messenger for Multichain Router
export const getMultichainRoutingServiceRootMessenger = () => {
  const messenger: MultichainRoutingServiceRootMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedMultichainRoutingServiceMessenger = (
  messenger: MultichainRoutingServiceRootMessenger = getMultichainRoutingServiceRootMessenger(),
) => {
  const controllerMessenger: MultichainRoutingServiceMessenger = new Messenger({
    namespace: 'MultichainRoutingService',
    parent: messenger,
  });

  messenger.delegate({
    actions: [
      'PermissionController:getPermissions',
      'SnapController:getRunnableSnaps',
      'SnapController:handleRequest',
      'AccountsController:listMultichainAccounts',
    ],
    messenger: controllerMessenger,
  });

  jest.spyOn(controllerMessenger, 'call');

  return controllerMessenger;
};

type WebSocketServiceRootMessenger = Messenger<
  MockAnyNamespace,
  MessengerActions<WebSocketServiceMessenger>,
  MessengerEvents<WebSocketServiceMessenger>
>;

export const getRootWebSocketServiceMessenger = () => {
  const messenger: WebSocketServiceRootMessenger =
    new MockControllerMessenger();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedWebSocketServiceMessenger = (
  messenger: ReturnType<
    typeof getRootWebSocketServiceMessenger
  > = getRootWebSocketServiceMessenger(),
) => {
  const controllerMessenger: WebSocketServiceMessenger = new Messenger({
    namespace: 'WebSocketService',
    parent: messenger,
  });

  messenger.delegate({
    actions: ['SnapController:handleRequest'],
    events: [
      'SnapController:snapInstalled',
      'SnapController:snapUpdated',
      'SnapController:snapUninstalled',
    ],
    messenger: controllerMessenger,
  });

  jest.spyOn(controllerMessenger, 'call');

  return controllerMessenger;
};
