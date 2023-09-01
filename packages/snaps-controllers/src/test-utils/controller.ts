import type { ApprovalRequest } from '@metamask/approval-controller';
import type {
  PermissionConstraint,
  SubjectPermissions,
  ValidPermission,
  Caveat,
  SubjectMetadata,
} from '@metamask/permission-controller';
import { SubjectType } from '@metamask/permission-controller';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import type { ValidatedSnapId } from '@metamask/snaps-utils';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MockControllerMessenger,
  getPersistedSnapObject,
  getTruncatedSnap,
  MOCK_LOCAL_SNAP_ID,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import type { Json } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';

import type {
  CronjobControllerActions,
  CronjobControllerEvents,
} from '../cronjob';
import type {
  AllowedActions,
  AllowedEvents,
  PersistedSnapControllerState,
  SnapControllerActions,
  SnapControllerEvents,
  SnapsRegistryActions,
  SnapsRegistryEvents,
} from '../snaps';
import { SnapController, SnapEndowments } from '../snaps';
import { MOCK_CRONJOB_PERMISSION } from './cronjob';
import { getNodeEES, getNodeEESMessenger } from './execution-environment';
import { MockSnapsRegistry } from './registry';

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

  async addRequest(request: { requestData?: Record<string, Json> }) {
    const promise = new Promise((resolve, reject) => {
      this.#approval = {
        promise: { resolve, reject },
        request,
      };
    });

    return promise;
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
        this.#approval.promise.reject(ethErrors.provider.userRejectedRequest());
      }
    }
  }
}

export const approvalControllerMock = new MockApprovalController();

export const snapConfirmPermissionKey = 'snap_confirm';

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

export const MOCK_DAPPS_RPC_ORIGINS_PERMISSION: PermissionConstraint = {
  caveats: [
    { type: SnapCaveatType.RpcOrigin, value: { snaps: false, dapps: true } },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: SnapEndowments.Rpc,
};

export const MOCK_SNAP_CONFIRM_PERMISSION: PermissionConstraint = {
  caveats: null,
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_SNAP_ID,
  parentCapability: snapConfirmPermissionKey,
};

export const MOCK_WALLET_SNAP_PERMISSION: PermissionConstraint = {
  caveats: [
    {
      type: SnapCaveatType.SnapIds,
      value: {
        [MOCK_SNAP_ID]: {},
        [MOCK_LOCAL_SNAP_ID]: {},
        foo: {},
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
  [snapConfirmPermissionKey]: MOCK_SNAP_CONFIRM_PERMISSION,
};

export const getControllerMessenger = (registry = new MockSnapsRegistry()) => {
  const messenger = new MockControllerMessenger<
    SnapControllerActions | AllowedActions,
    SnapControllerEvents | AllowedEvents
  >();

  messenger.registerActionHandler(
    'PermissionController:hasPermission',
    (permission) => {
      return permission !== SnapEndowments.LongRunning;
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

  messenger.registerActionHandler('ExecutionService:executeSnap', asyncNoOp);
  messenger.registerActionHandler(
    'ExecutionService:handleRpcRequest',
    asyncNoOp,
  );
  messenger.registerActionHandler('ExecutionService:terminateSnap', asyncNoOp);
  messenger.registerActionHandler(
    'ExecutionService:terminateAllSnaps',
    asyncNoOp,
  );

  messenger.registerActionHandler(
    'SnapsRegistry:get',
    registry.get.bind(registry),
  );
  messenger.registerActionHandler(
    'SnapsRegistry:getMetadata',
    registry.getMetadata.bind(registry),
  );

  messenger.registerActionHandler(
    'SnapsRegistry:update',
    registry.update.bind(registry),
  );

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getSnapControllerMessenger = (
  messenger: ReturnType<
    typeof getControllerMessenger
  > = getControllerMessenger(),
) => {
  const snapControllerMessenger = messenger.getRestricted<
    'SnapController',
    SnapControllerActions['type'] | AllowedActions['type'],
    SnapControllerEvents['type'] | AllowedEvents['type']
  >({
    name: 'SnapController',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:outboundRequest',
      'ExecutionService:outboundResponse',
      'SnapController:snapAdded',
      'SnapController:snapBlocked',
      'SnapController:snapInstalled',
      'SnapController:snapUnblocked',
      'SnapController:snapUpdated',
      'SnapController:snapRemoved',
      'SnapController:stateChange',
      'SnapController:snapRolledback',
    ],
    allowedActions: [
      'ApprovalController:addRequest',
      'ApprovalController:updateRequestState',
      'ExecutionService:executeSnap',
      'ExecutionService:terminateAllSnaps',
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
      'SnapController:get',
      'SnapController:handleRequest',
      'SnapController:getSnapState',
      'SnapController:has',
      'SnapController:updateSnapState',
      'SnapController:clearSnapState',
      'SnapController:updateBlockedSnaps',
      'SnapController:enable',
      'SnapController:disable',
      'SnapController:remove',
      'SnapController:getAll',
      'SnapController:getPermitted',
      'SnapController:install',
      'SnapController:removeSnapError',
      'SnapController:incrementActiveReferences',
      'SnapController:decrementActiveReferences',
      'SnapController:getRegistryMetadata',
      'SubjectMetadataController:getSubjectMetadata',
      'SnapsRegistry:get',
      'SnapsRegistry:getMetadata',
      'SnapsRegistry:update',
      'SnapController:disconnectOrigin',
      'SnapController:revokeDynamicPermissions',
    ],
  });

  jest.spyOn(snapControllerMessenger, 'call');

  return snapControllerMessenger;
};

export type SnapControllerConstructorParams = ConstructorParameters<
  typeof SnapController
>[0];

export type PartialSnapControllerConstructorParams = Partial<
  Omit<ConstructorParameters<typeof SnapController>[0], 'state'> & {
    state: Partial<SnapControllerConstructorParams['state']>;
  }
>;

export const getSnapControllerOptions = (
  opts?: PartialSnapControllerConstructorParams,
) => {
  const options = {
    environmentEndowmentPermissions: [],
    closeAllConnections: jest.fn(),
    messenger: getSnapControllerMessenger(),
    featureFlags: { dappsCanUpdateSnaps: true },
    state: undefined,
    fetchFunction: jest.fn(),
    ...opts,
  } as SnapControllerConstructorParams;

  options.state = {
    snaps: {},
    snapErrors: {},
    snapStates: {},
    ...options.state,
  };
  return options;
};

export type GetSnapControllerWithEESOptionsParam = Omit<
  PartialSnapControllerConstructorParams,
  'messenger'
> & { rootMessenger?: ReturnType<typeof getControllerMessenger> };

export const getSnapControllerWithEESOptions = ({
  rootMessenger = getControllerMessenger(),
  ...options
}: GetSnapControllerWithEESOptionsParam = {}) => {
  const snapControllerMessenger = getSnapControllerMessenger(rootMessenger);

  return {
    featureFlags: { dappsCanUpdateSnaps: true },
    environmentEndowmentPermissions: [],
    closeAllConnections: jest.fn(),
    messenger: snapControllerMessenger,
    rootMessenger,
    fetchFunction: jest.fn(),
    ...options,
  } as SnapControllerConstructorParams & {
    rootMessenger: ReturnType<typeof getControllerMessenger>;
  };
};

export const getSnapController = (options = getSnapControllerOptions()) => {
  return new SnapController(options);
};

export const getSnapControllerWithEES = (
  options = getSnapControllerWithEESOptions(),
  service?: ReturnType<typeof getNodeEES>,
) => {
  const _service =
    service ?? getNodeEES(getNodeEESMessenger(options.rootMessenger));

  const controller = new SnapController(options);
  return [controller, _service] as const;
};

export const getPersistedSnapsState = (
  ...snaps: PersistedSnapControllerState['snaps'][ValidatedSnapId][]
): PersistedSnapControllerState['snaps'] => {
  return (snaps.length > 0 ? snaps : [getPersistedSnapObject()]).reduce<
    PersistedSnapControllerState['snaps']
  >((snapsState, snapObject) => {
    snapsState[snapObject.id] = snapObject;
    return snapsState;
  }, {});
};

// Mock controller messenger for Cronjob Controller
export const getRootCronjobControllerMessenger = () => {
  const messenger = new MockControllerMessenger<
    CronjobControllerActions | AllowedActions,
    CronjobControllerEvents | AllowedEvents
  >();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedCronjobControllerMessenger = (
  messenger: ReturnType<
    typeof getRootCronjobControllerMessenger
  > = getRootCronjobControllerMessenger(),
  mocked = true,
) => {
  const cronjobControllerMessenger = messenger.getRestricted<
    'CronjobController',
    CronjobControllerActions['type'] | AllowedActions['type'],
    CronjobControllerEvents['type'] | AllowedEvents['type']
  >({
    name: 'CronjobController',
    allowedEvents: [
      'SnapController:snapInstalled',
      'SnapController:snapUpdated',
      'SnapController:snapRemoved',
    ],
    allowedActions: [
      'PermissionController:hasPermission',
      'PermissionController:getPermissions',
      'SnapController:getAll',
      'SnapController:handleRequest',
    ],
  });

  if (mocked) {
    messenger.registerActionHandler(
      'PermissionController:hasPermission',
      (permission) => {
        return permission !== SnapEndowments.LongRunning;
      },
    );

    messenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION };
      },
    );

    messenger.registerActionHandler('SnapController:getAll', () => {
      return [getTruncatedSnap()];
    });

    messenger.registerActionHandler('SnapController:handleRequest', asyncNoOp);
  }

  return cronjobControllerMessenger;
};

// Mock controller messenger for registry
export const getRootSnapsRegistryControllerMessenger = () => {
  const messenger = new MockControllerMessenger<
    SnapsRegistryActions,
    SnapsRegistryEvents
  >();

  jest.spyOn(messenger, 'call');

  return messenger;
};

export const getRestrictedSnapsRegistryControllerMessenger = (
  messenger: ReturnType<
    typeof getRootSnapsRegistryControllerMessenger
  > = getRootSnapsRegistryControllerMessenger(),
) => {
  const controllerMessenger = messenger.getRestricted<
    'SnapsRegistry',
    SnapsRegistryActions['type'],
    SnapsRegistryEvents['type']
  >({
    name: 'SnapsRegistry',
    allowedEvents: [],
    allowedActions: [
      'SnapsRegistry:get',
      'SnapsRegistry:getMetadata',
      'SnapsRegistry:update',
    ],
  });

  return controllerMessenger;
};
