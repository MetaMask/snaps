import {
  ActionConstraint,
  ControllerMessenger,
  EventConstraint,
} from '@metamask/controllers';
import {
  getPersistedSnapObject,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';

import {
  CronjobControllerActions,
  CronjobControllerEvents,
} from '../cronjob/CronjobController';
import {
  AllowedActions,
  AllowedEvents,
  CheckSnapBlockListArg,
  PersistedSnapControllerState,
  SnapController,
  SnapControllerActions,
  SnapControllerEvents,
  SnapEndowments,
} from '../snaps';
import { MOCK_CRONJOB_PERMISSION } from './cronjob';
import { getNodeEES, getNodeEESMessenger } from './execution-environment';

// These types are extracted from `@metamask/controllers`. Ideally they would
// be exported from there, but they are not.
type ActionHandler<Action, ActionType> = (
  ...args: ExtractActionParameters<Action, ActionType>
) => ExtractActionResponse<Action, ActionType>;

type ExtractActionParameters<Action, T> = Action extends {
  type: T;
  handler: (...args: infer H) => any;
}
  ? H
  : never;

type ExtractActionResponse<Action, T> = Action extends {
  type: T;
  handler: (...args: any) => infer H;
}
  ? H
  : never;

/**
 * A controller messenger, that allows overwriting the action handlers, without
 * the need to call `unregisterActionHandler` first.
 */
class MockControllerMessenger<
  Actions extends ActionConstraint,
  Events extends EventConstraint,
> extends ControllerMessenger<Actions, Events> {
  /**
   * Registers an action handler for the given action type. If an action handler
   * already exists for the given action type, it will be overwritten.
   *
   * @param actionType - The action type to register the handler for.
   * @param handler - The action handler to register.
   */
  registerActionHandler<T extends Actions['type']>(
    actionType: T,
    handler: ActionHandler<Actions, T>,
  ) {
    super.unregisterActionHandler(actionType);
    super.registerActionHandler(actionType, handler);
  }
}

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
    jest
      .spyOn(snapControllerMessenger, 'call')
      .mockImplementation((method, ...args): any => {
        // Return false for long-running by default, and true for everything else.
        if (
          method === 'PermissionController:hasPermission' &&
          args[1] === SnapEndowments.LongRunning
        ) {
          return false;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as { requestData: unknown }).requestData;
        }
        return true;
      });
  }

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
    getAppKey: jest
      .fn()
      .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`),
    messenger: getSnapControllerMessenger(),
    featureFlags: { dappsCanUpdateSnaps: true },
    checkBlockList: jest
      .fn()
      .mockImplementation(async (snaps: CheckSnapBlockListArg) =>
        Promise.resolve(
          Object.keys(snaps).reduce(
            (acc, snapId) => ({ ...acc, [snapId]: { blocked: false } }),
            {},
          ),
        ),
      ),
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
      return (originalCall as any)(method, ...args);
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

export const getPersistedSnapsState = (
  ...snaps: PersistedSnapControllerState['snaps'][string][]
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

    messenger.registerActionHandler('SnapController:handleRequest', async () =>
      Promise.resolve(),
    );
  }

  return cronjobControllerMessenger;
};
