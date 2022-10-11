import { ControllerMessenger } from '@metamask/controllers';
import {
  AllowedActions,
  AllowedEvents,
  CheckSnapBlockListArg,
  SnapController,
  SnapControllerActions,
  SnapControllerEvents,
  SnapEndowments,
} from '../snaps';
import { getNodeEES, getNodeEESMessenger } from './execution-environment';

export const getControllerMessenger = () =>
  new ControllerMessenger<
    SnapControllerActions | AllowedActions,
    SnapControllerEvents | AllowedEvents
  >();

export const getSnapControllerMessenger = (
  messenger: ReturnType<
    typeof getControllerMessenger
  > = getControllerMessenger(),
  mocked = true,
) => {
  const m = messenger.getRestricted<
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
    ],
    allowedActions: [
      'ApprovalController:addRequest',
      'ExecutionService:executeSnap',
      'ExecutionService:terminateAllSnaps',
      'ExecutionService:terminateSnap',
      'ExecutionService:handleRpcRequest',
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:hasPermissions',
      'PermissionController:getPermissions',
      'PermissionController:grantPermissions',
      'PermissionController:revokeAllPermissions',
      'SnapController:add',
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
    ],
  });

  if (mocked) {
    jest.spyOn(m, 'call').mockImplementation((method, ...args) => {
      // Return false for long-running by default, and true for everything else.
      if (
        method === 'PermissionController:hasPermission' &&
        args[1] === SnapEndowments.LongRunning
      ) {
        return false;
      } else if (method === 'ApprovalController:addRequest') {
        return (args[0] as any).requestData;
      }
      return true;
    });
  }
  return m;
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
    getAppKey: jest
      .fn()
      .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`),
    messenger: getSnapControllerMessenger(),
    featureFlags: { dappsCanUpdateSnaps: true },
    checkBlockList: jest
      .fn()
      .mockImplementation(async (snaps: CheckSnapBlockListArg) => {
        return Object.keys(snaps).reduce(
          (acc, snapId) => ({ ...acc, [snapId]: { blocked: false } }),
          {},
        );
      }),
    state: undefined,
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

export const getSnapControllerWithEESOptions = (
  opts: GetSnapControllerWithEESOptionsParam = {},
) => {
  const { rootMessenger = getControllerMessenger() } = opts;
  const snapControllerMessenger = getSnapControllerMessenger(
    rootMessenger,
    false,
  );
  const originalCall = snapControllerMessenger.call.bind(
    snapControllerMessenger,
  );
  jest
    .spyOn(snapControllerMessenger, 'call')
    .mockImplementation((method, ...args) => {
      // Mock long running permission, call actual implementation for everything else
      if (
        method === 'PermissionController:hasPermission' &&
        args[1] === SnapEndowments.LongRunning
      ) {
        return false;
      }
      return originalCall(method, ...args);
    });
  return {
    environmentEndowmentPermissions: [],
    closeAllConnections: jest.fn(),
    getAppKey: jest
      .fn()
      .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`),
    messenger: snapControllerMessenger,
    ...opts,
    rootMessenger,
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
