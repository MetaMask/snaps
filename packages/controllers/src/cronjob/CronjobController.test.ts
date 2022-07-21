import {
  SnapCaveatType,
  HandlerType,
  deepClone,
  TruncatedSnap,
} from '@metamask/snap-utils';
import {
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getTruncatedSnap,
} from '@metamask/snap-utils/test-utils';
import { Duration, inMilliseconds } from '@metamask/utils';
import { parseExpression } from 'cron-parser';
import { SnapEndowments } from '../snaps';
import {
  getRestrictedCronjobControllerMessenger,
  getRootCronjobControllerMessenger,
} from '../test-utils';
import { CronjobController, DAILY_TIMEOUT } from './CronjobController';

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

describe('CronjobController', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('registers a cronjob', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method) => {
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

    await cronjobController.register(MOCK_SNAP_ID);

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

  it('unregisters a cronjob', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method) => {
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

    await cronjobController.register(MOCK_SNAP_ID);
    await cronjobController.unregister(MOCK_SNAP_ID);

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
      .mockImplementation((method) => {
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

    // Update state manually for test
    // eslint-disable-next-line dot-notation
    cronjobController['update'](() => {
      return {
        jobs: {
          [`${MOCK_SNAP_ID}-0`]: { lastRun: 0 },
        },
      };
    });

    await cronjobController.dailyCheckIn();

    jest.advanceTimersByTime(inMilliseconds(24, Duration.Hour));

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

  it('does not schedule cronjob that is too far in the future', async () => {
    // Ensure that Cronjob will not yet be scheduled if it reaches DAILY_TIMEOUT
    // Make expression so the schedule is on some complex date
    let cronExpression = '59 23 29 2 *'; // At 11:59pm on February 29th
    // But also ensure that it's not very close so the test doesn't fail
    const parsed = parseExpression(cronExpression);
    const next = parsed.next();
    const now = new Date();
    const ms = next.getTime() - now.getTime();
    // So, if the scheduled date is within the range of a daily timeout,
    // jump over to some other far date by redefining cron expression
    if (ms < DAILY_TIMEOUT) {
      cronExpression = '59 23 1 1 *'; // At 11:59pm on January 1st
    }

    const MOCK_TOO_FAR_CRONJOB_PERMISSION = deepClone(MOCK_CRONJOB_PERMISSION);
    MOCK_TOO_FAR_CRONJOB_PERMISSION.caveats[0].value = {
      jobs: [
        {
          expression: cronExpression,
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

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method) => {
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

    await cronjobController.register(MOCK_SNAP_ID);

    expect(callActionMock).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    expect(cronjobController.timers.size).toBe(0);

    cronjobController.destroy();
  });

  it('handles SnapInstalled event', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    jest.spyOn(controllerMessenger, 'call').mockImplementation((method) => {
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
    // eslint-disable-next-line dot-notation
    await cronjobController['_handleEventSnapInstalled'](snapInfo);

    expect(cronjobController.snapIds.size).toBe(2);

    cronjobController.destroy();
  });

  it('handles SnapRemoved event', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    jest.spyOn(controllerMessenger, 'call').mockImplementation((method) => {
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

    await cronjobController.register(MOCK_SNAP_ID);

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      permissionName: '',
      version: '',
    };
    // eslint-disable-next-line dot-notation
    cronjobController['_handleEventSnapRemoved'](snapInfo);

    expect(cronjobController.snapIds.size).toBe(0);

    cronjobController.destroy();
  });

  it('handles SnapUpdated event', async () => {
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

    jest
      .spyOn(controllerMessenger, 'call')
      .mockResolvedValueOnce([getTruncatedSnap()])
      .mockResolvedValueOnce({
        [SnapEndowments.Cronjob]: MOCK_CRONJOB_PERMISSION,
      })
      .mockResolvedValueOnce({
        [SnapEndowments.Cronjob]: MOCK_ANOTHER_CRONJOB_PERMISSION,
      });

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
    });

    await cronjobController.register(MOCK_SNAP_ID);

    expect(cronjobController.snapIds.size).toBe(2);

    expect(cronjobController.timers.size).toBe(2);

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      permissionName: '',
      version: '',
    };
    // eslint-disable-next-line dot-notation
    await cronjobController['_handleEventSnapUpdated'](snapInfo);

    expect(cronjobController.snapIds.size).toBe(1);

    expect(cronjobController.timers.size).toBe(1);

    cronjobController.destroy();
  });

  it('removes all jobs and schedules after controller destroy is called', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const callActionMock = jest
      .spyOn(controllerMessenger, 'call')
      .mockImplementation((method) => {
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

    await cronjobController.register(MOCK_SNAP_ID);

    expect(callActionMock).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    expect(cronjobController.snapIds.size).toBe(2);

    expect(cronjobController.timers.size).toBe(2);

    cronjobController.destroy();

    expect(cronjobController.snapIds.size).toBe(0);

    expect(cronjobController.timers.size).toBe(0);
  });
});
