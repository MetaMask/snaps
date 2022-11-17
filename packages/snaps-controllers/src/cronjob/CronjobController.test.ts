import {
  SnapCaveatType,
  HandlerType,
  deepClone,
  TruncatedSnap,
} from '@metamask/snaps-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import { Duration, inMilliseconds } from '@metamask/utils';

import { SnapEndowments } from '../snaps';
import {
  getRestrictedCronjobControllerMessenger,
  getRootCronjobControllerMessenger,
} from '../test-utils';
import { CronjobController } from './CronjobController';

const MOCK_CRONJOB_PERMISSION = {
  caveats: [
    {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: {
              minute: '*',
              hour: '*',
              dayOfMonth: '*',
              month: '*',
              dayOfWeek: '*',
            },
            request: {
              method: 'exampleMethodOne',
              params: ['p1'],
            },
          },
          {
            expression: '* * * * *',
            request: {
              method: 'exampleMethodTwo',
              params: ['p1'],
            },
          },
        ],
      },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: SnapEndowments.Cronjob,
};

const MOCK_CRONJOB_SINGLE_JOB_PERMISSION = {
  caveats: [
    {
      type: SnapCaveatType.SnapCronjob,
      value: {
        jobs: [
          {
            expression: '59 6 * * *',
            request: {
              method: 'exampleMethod',
              params: ['p1'],
            },
          },
        ],
      },
    },
  ],
  date: 1664187844588,
  id: 'izn0WGUO8cvq_jqvLQuQP',
  invoker: MOCK_ORIGIN,
  parentCapability: SnapEndowments.Cronjob,
};

describe('CronjobController', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('registers a cronjob', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method, ..._params: unknown[]) => {
        if (method === 'SnapController:getAll') {
          return [getTruncatedSnap()];
        } else if (method === 'PermissionController:getPermissions') {
          return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
        }
        return false;
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);

    expect(callActionMock).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(callActionMock).toHaveBeenNthCalledWith(
      4,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('unregisters a cronjob', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method, ..._params: unknown[]) => {
        if (method === 'SnapController:getAll') {
          return [getTruncatedSnap()];
        } else if (method === 'PermissionController:getPermissions') {
          return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
        }
        return false;
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);
    cronjobController.unregister(MOCK_SNAP_ID);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(callActionMock).not.toHaveBeenNthCalledWith(
      4,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('executes cronjobs that were missed during daily check in', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method, ..._params: unknown[]) => {
        if (method === 'SnapController:getAll') {
          return [getTruncatedSnap()];
        } else if (method === 'PermissionController:getPermissions') {
          return {
            [SnapEndowments.Cronjob]: MOCK_CRONJOB_SINGLE_JOB_PERMISSION,
          } as any;
        }
        return false;
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    // Update state manually for test
    // @ts-expect-error Accessing private property
    cronjobController.update(() => {
      return {
        jobs: {
          [`${MOCK_SNAP_ID}-0`]: { lastRun: 0 },
        },
      };
    });

    await cronjobController.dailyCheckIn();

    jest.advanceTimersByTime(inMilliseconds(24, Duration.Hour));

    expect(callActionMock).toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('does not schedule cronjob that is too far in the future', () => {
    const cronExpression = '59 23 29 2 *'; // At 11:59pm on February 29th

    const MOCK_TOO_FAR_CRONJOB_PERMISSION = deepClone(
      MOCK_CRONJOB_SINGLE_JOB_PERMISSION,
    );
    MOCK_TOO_FAR_CRONJOB_PERMISSION.caveats[0].value = {
      jobs: [
        {
          expression: cronExpression,
          request: {
            method: 'exampleMethod',
            params: ['p1'],
          },
        },
      ],
    };
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method, ..._params: unknown[]) => {
        if (method === 'SnapController:getAll') {
          return [getTruncatedSnap()];
        } else if (method === 'PermissionController:getPermissions') {
          return {
            [SnapEndowments.Cronjob]: MOCK_TOO_FAR_CRONJOB_PERMISSION,
          } as any;
        }
        return false;
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);

    expect(callActionMock).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    jest.runOnlyPendingTimers();

    expect(callActionMock).not.toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('handles SnapInstalled event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest.spyOn(controllerMessenger, 'call');

    callActionMock.mockImplementation((method, ..._params: unknown[]) => {
      if (method === 'SnapController:getAll') {
        return [getTruncatedSnap()];
      } else if (method === 'PermissionController:getPermissions') {
        return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
      }
      return false;
    });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      permissionName: '',
      version: '',
    };
    // @ts-expect-error Accessing private property
    cronjobController._handleEventSnapInstalled(snapInfo);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(callActionMock).toHaveBeenNthCalledWith(
      4,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('handles SnapRemoved event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest.spyOn(controllerMessenger, 'call');

    callActionMock.mockImplementation((method, ..._params: unknown[]) => {
      if (method === 'SnapController:getAll') {
        return [getTruncatedSnap()];
      } else if (method === 'PermissionController:getPermissions') {
        return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
      }
      return false;
    });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      permissionName: '',
      version: '',
    };

    // @ts-expect-error Accessing private property
    cronjobController._handleEventSnapRemoved(snapInfo);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(callActionMock).not.toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('handles SnapUpdated event', () => {
    const MOCK_ANOTHER_CRONJOB_PERMISSION = deepClone(MOCK_CRONJOB_PERMISSION);
    MOCK_ANOTHER_CRONJOB_PERMISSION.caveats[0].value = {
      jobs: [
        {
          expression: '*/15 * * * *',
          request: {
            method: 'exampleMethodOne',
            params: ['p1'],
          },
        },
      ],
    };

    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest.spyOn(controllerMessenger, 'call');

    callActionMock.mockImplementation((method, ..._params: unknown[]) => {
      if (method === 'SnapController:getAll') {
        return [getTruncatedSnap()];
      } else if (method === 'PermissionController:getPermissions') {
        return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
      }
      return false;
    });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      permissionName: '',
      version: '',
    };

    // @ts-expect-error Accessing private property
    cronjobController._handleEventSnapUpdated(snapInfo);

    jest.advanceTimersByTime(inMilliseconds(15, Duration.Minute));

    expect(callActionMock).toHaveBeenNthCalledWith(
      5,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('removes all jobs and schedules after controller destroy is called', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method, ..._params: unknown[]) => {
        if (method === 'SnapController:getAll') {
          return [getTruncatedSnap()];
        } else if (method === 'PermissionController:getPermissions') {
          return { [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION } as any;
        }
        return false;
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    cronjobController.register(MOCK_SNAP_ID);

    expect(callActionMock).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    cronjobController.destroy();

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(callActionMock).not.toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: '',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );
  });
});
