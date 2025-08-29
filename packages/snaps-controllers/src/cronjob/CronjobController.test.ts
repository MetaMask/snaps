import { SnapEndowments } from '@metamask/snaps-rpc-methods';
import type { TruncatedSnap } from '@metamask/snaps-utils';
import { HandlerType } from '@metamask/snaps-utils';
import { MOCK_ORIGIN, MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { SemVerVersion } from '@metamask/utils';
import { Duration, inMilliseconds } from '@metamask/utils';

import type {
  CronjobControllerState,
  CronjobControllerStateManager,
} from './CronjobController';
import { CronjobController } from './CronjobController';
import { METAMASK_ORIGIN } from '../snaps/constants';
import {
  getRestrictedCronjobControllerMessenger,
  getRootCronjobControllerMessenger,
} from '../test-utils';
import { getCronjobPermission } from '../test-utils/cronjob';

const MOCK_VERSION = '1.0.0' as SemVerVersion;

/**
 * Get a mock state manager for the `CronjobController`.
 *
 * @returns A state manager object with `get` and `set` methods.
 */
function getMockStateManager(): CronjobControllerStateManager {
  let state: CronjobControllerState | undefined;

  return {
    getInitialState: () => state,
    set: (newState) => {
      state = newState;
    },
  };
}

describe('CronjobController', () => {
  const originalProcessNextTick = process.nextTick;

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2022-01-01T00:00Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('registers a cronjob with an expression', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({
            expression: '* * * * *',
          }),
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: 'metamask',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('registers a cronjob with a duration', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({
            duration: 'PT1M',
          }),
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
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

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);
    cronjobController.unregister(MOCK_SNAP_ID);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(controllerMessenger.call).not.toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('immediately executes cronjobs that are past the scheduled execution date', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    // @ts-expect-error: `update` is protected.
    cronjobController.update(() => {
      return {
        events: {
          [`cronjob-${MOCK_SNAP_ID}-0`]: {
            id: `cronjob-${MOCK_SNAP_ID}-0`,
            snapId: MOCK_SNAP_ID,
            date: new Date('2022-01-01T00:00Z').toISOString(),
            scheduledAt: new Date('2022-01-01T00:00Z').toISOString(),
            schedule: 'PT25H',
            recurring: true,
            request: {
              method: 'exampleMethod',
              params: ['p1'],
            },
          },
        },
      };
    });

    jest.advanceTimersByTime(inMilliseconds(24, Duration.Hour));

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('immediately executes cronjobs that are past the scheduled execution date and reschedules the cronjob', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const handleRequest = jest.fn().mockResolvedValue(undefined);
    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      handleRequest,
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
      state: {
        events: {
          [`cronjob-${MOCK_SNAP_ID}-0`]: {
            id: `cronjob-${MOCK_SNAP_ID}-0`,
            snapId: MOCK_SNAP_ID,
            date: new Date('2022-01-01T00:00Z').toISOString(),
            scheduledAt: new Date('2022-01-01T00:00Z').toISOString(),
            schedule: 'PT25H',
            recurring: true,
            request: {
              method: 'exampleMethod',
              params: ['p1'],
            },
          },
        },
      },
    });

    cronjobController.init();

    await new Promise((resolve) => originalProcessNextTick(resolve));
    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    expect(handleRequest).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(inMilliseconds(26, Duration.Hour));

    await new Promise((resolve) => originalProcessNextTick(resolve));
    expect(handleRequest).toHaveBeenCalledTimes(2);

    cronjobController.destroy();
  });

  it('does not schedule cronjob that is too far in the future', () => {
    const expression = '59 23 29 2 *'; // At 11:59pm on February 29th

    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({ expression }),
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);
    jest.runOnlyPendingTimers();

    expect(controllerMessenger.call).toHaveBeenCalledTimes(1);
    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    expect(controllerMessenger.call).not.toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('schedules jobs that were not scheduled due to the daily timeout', () => {
    const expression = '0 0 4 * *'; // At 12:00am on the 4th of every month.

    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({ expression }),
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));
    expect(controllerMessenger.call).toHaveBeenCalledTimes(1);
    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));
    expect(controllerMessenger.call).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));
    expect(controllerMessenger.call).toHaveBeenCalledTimes(2);
    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('does not schedule events for a Snap without a permission caveat', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: {
            date: 1664187844588,
            id: 'izn0WGUO8cvq_jqvLQuQP',
            invoker: MOCK_ORIGIN,
            parentCapability: SnapEndowments.Cronjob,
            caveats: null,
          },
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);
    expect(cronjobController.state.events).toStrictEqual({});

    cronjobController.destroy();
  });

  it('reschedules any un-expired events that are in state upon initialization', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
      state: {
        events: {
          foo: {
            id: 'foo',
            recurring: false,
            date: '2022-01-01T01:00Z',
            schedule: '2022-01-01T01:00Z',
            scheduledAt: new Date().toISOString(),
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'handleEvent',
              params: ['p1'],
            },
          },
        },
      },
    });

    cronjobController.init();

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      },
    );

    expect(cronjobController.state.events).toStrictEqual({});

    cronjobController.destroy();
  });

  it('handles the `snapInstalled` event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
      state: {
        events: {
          [`cronjob-${MOCK_SNAP_ID}-0`]: {
            id: `cronjob-${MOCK_SNAP_ID}-0`,
            recurring: true,
            date: '2022-01-01T00:01:00.000Z',
            schedule: '* * * * *',
            scheduledAt: '2022-01-01T00:00:00.000Z',
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'exampleMethodTwo',
              params: ['p1'],
            },
          },
        },
      },
    });

    cronjobController.init();

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      version: MOCK_VERSION,
    };

    rootMessenger.publish(
      'SnapController:snapInstalled',
      snapInfo,
      MOCK_ORIGIN,
      false,
    );

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    );

    expect(controllerMessenger.call).toHaveBeenCalledTimes(2);

    cronjobController.destroy();
  });

  it('handles the `snapEnabled` event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({
            expression: '0 0 * * *',
          }),
        };
      },
    );

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
      state: {
        events: {
          foo: {
            id: 'foo',
            recurring: false,
            date: '2022-01-01T01:00Z',
            schedule: '2022-01-01T01:00Z',
            scheduledAt: new Date().toISOString(),
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'handleEvent',
              params: ['p1'],
            },
          },
          bar: {
            id: 'bar',
            recurring: false,
            date: '2021-01-01T01:00Z',
            schedule: '2021-01-01T01:00Z',
            scheduledAt: new Date().toISOString(),
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'handleEvent',
              params: ['p1'],
            },
          },
        },
      },
    });

    cronjobController.init();

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      version: MOCK_VERSION,
    };

    rootMessenger.publish('SnapController:snapEnabled', snapInfo);

    expect(cronjobController.state.events).toStrictEqual({
      [`cronjob-${MOCK_SNAP_ID}-0`]: {
        id: `cronjob-${MOCK_SNAP_ID}-0`,
        recurring: true,
        date: '2022-01-02T00:00:00.000Z',
        schedule: '0 0 * * *',
        scheduledAt: expect.any(String),
        snapId: MOCK_SNAP_ID,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
      foo: {
        id: 'foo',
        recurring: false,
        date: '2022-01-01T01:00Z',
        schedule: '2022-01-01T01:00Z',
        scheduledAt: new Date().toISOString(),
        snapId: MOCK_SNAP_ID,
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      },
    });

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));

    expect(controllerMessenger.call).toHaveBeenCalledTimes(3);
    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: 'metamask',
        handler: HandlerType.OnCronjob,
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      },
    );

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      3,
      'SnapController:handleRequest',
      {
        snapId: MOCK_SNAP_ID,
        origin: METAMASK_ORIGIN,
        handler: HandlerType.OnCronjob,
        request: {
          method: 'exampleMethod',
          params: ['p1'],
        },
      },
    );

    cronjobController.destroy();
  });

  it('handles the `snapUninstalled` event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      version: MOCK_VERSION,
    };

    cronjobController.schedule({
      snapId: MOCK_SNAP_ID,
      schedule: '2022-01-01T01:00Z',
      request: {
        method: 'handleEvent',
        params: ['p1'],
      },
    });

    rootMessenger.publish('SnapController:snapUninstalled', snapInfo);
    expect(cronjobController.state.events).toStrictEqual({});

    cronjobController.destroy();
  });

  it('handles the `snapDisabled` event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      version: MOCK_VERSION,
    };

    cronjobController.schedule({
      snapId: MOCK_SNAP_ID,
      schedule: '2022-01-01T01:00Z',
      request: {
        method: 'handleEvent',
        params: ['p1'],
      },
    });

    rootMessenger.publish('SnapController:snapDisabled', snapInfo);
    expect(cronjobController.state.events).toStrictEqual({});

    cronjobController.destroy();
  });

  it('handles the `snapUpdated` event', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
      state: {
        events: {
          [`cronjob-${MOCK_SNAP_ID}-0`]: {
            id: `cronjob-${MOCK_SNAP_ID}-0`,
            recurring: true,
            date: new Date('2022-01-01T00:00Z').toISOString(),
            schedule: 'PT25H',
            scheduledAt: new Date('2022-01-01T00:00Z').toISOString(),
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'exampleMethod',
              params: ['p1'],
            },
          },
          foo: {
            id: 'foo',
            recurring: false,
            date: '2022-01-01T01:00Z',
            schedule: '2022-01-01T01:00Z',
            scheduledAt: new Date().toISOString(),
            snapId: MOCK_SNAP_ID,
            request: {
              method: 'handleEvent',
              params: ['p1'],
            },
          },
        },
      },
    });

    cronjobController.init();

    const snapInfo: TruncatedSnap = {
      blocked: false,
      enabled: true,
      id: MOCK_SNAP_ID,
      initialPermissions: {},
      version: MOCK_VERSION,
    };

    rootMessenger.publish(
      'SnapController:snapUpdated',
      snapInfo,
      snapInfo.version,
      MOCK_ORIGIN,
      false,
    );

    expect(cronjobController.state.events).toStrictEqual({
      [`cronjob-${MOCK_SNAP_ID}-0`]: {
        id: `cronjob-${MOCK_SNAP_ID}-0`,
        recurring: true,
        date: '2022-01-01T00:01:00.000Z',
        schedule: '* * * * *',
        scheduledAt: expect.any(String),
        snapId: MOCK_SNAP_ID,
        request: {
          method: 'exampleMethodOne',
          params: ['p1'],
        },
      },
    });

    cronjobController.destroy();
  });

  it('removes all events when the controller is destroyed', () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    cronjobController.register(MOCK_SNAP_ID);

    cronjobController.destroy();

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));

    expect(controllerMessenger.call).toHaveBeenCalledTimes(1);
    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'PermissionController:getPermissions',
      MOCK_SNAP_ID,
    );
  });

  it('logs errors caught during cronjob execution', async () => {
    const rootMessenger = getRootCronjobControllerMessenger();
    const controllerMessenger =
      getRestrictedCronjobControllerMessenger(rootMessenger);

    rootMessenger.registerActionHandler(
      'PermissionController:getPermissions',
      () => {
        return {
          [SnapEndowments.Cronjob]: getCronjobPermission({
            expression: '* * * * *',
          }),
        };
      },
    );

    jest.spyOn(console, 'error').mockImplementation();

    const cronjobController = new CronjobController({
      messenger: controllerMessenger,
      stateManager: getMockStateManager(),
    });

    cronjobController.init();

    const error = new Error('Test error.');
    rootMessenger.registerActionHandler(
      'SnapController:handleRequest',
      async () => {
        throw error;
      },
    );

    cronjobController.register(MOCK_SNAP_ID);

    jest.advanceTimersByTime(inMilliseconds(1, Duration.Minute));
    await new Promise((resolve) => originalProcessNextTick(resolve));

    expect(console.error).toHaveBeenCalledWith(
      `An error occurred while executing an event for Snap "${MOCK_SNAP_ID}":`,
      error,
    );

    cronjobController.destroy();
  });

  describe('CronjobController:schedule', () => {
    it('schedules a background event', () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
      });

      cronjobController.init();

      const event = {
        snapId: MOCK_SNAP_ID,
        schedule: '2022-01-01T01:00Z',
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      };

      const id = rootMessenger.call('CronjobController:schedule', event);
      expect(cronjobController.state.events).toStrictEqual({
        [id]: {
          id,
          recurring: false,
          date: '2022-01-01T01:00:00Z',
          scheduledAt: expect.any(String),
          ...event,
        },
      });

      jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));

      expect(controllerMessenger.call).toHaveBeenCalledWith(
        'SnapController:handleRequest',
        {
          snapId: MOCK_SNAP_ID,
          origin: METAMASK_ORIGIN,
          handler: HandlerType.OnCronjob,
          request: {
            method: 'handleEvent',
            params: ['p1'],
          },
        },
      );

      expect(cronjobController.state.events).toStrictEqual({});

      cronjobController.destroy();
    });

    it('throws when scheduling a background event if the date is in the past', () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
      });

      cronjobController.init();

      const event = {
        snapId: MOCK_SNAP_ID,
        schedule: '2021-01-01T01:00Z',
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      };

      expect(() =>
        rootMessenger.call('CronjobController:schedule', event),
      ).toThrow('Cannot schedule an event in the past.');

      expect(cronjobController.state.events).toStrictEqual({});

      cronjobController.destroy();
    });
  });

  describe('CronjobController:cancel', () => {
    it('cancels a background event', () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
      });

      cronjobController.init();

      const event = {
        snapId: MOCK_SNAP_ID,
        schedule: '2022-01-01T01:00Z',
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      };

      const id = rootMessenger.call('CronjobController:schedule', event);
      expect(cronjobController.state.events).toStrictEqual({
        [id]: {
          id,
          recurring: false,
          date: '2022-01-01T01:00:00Z',
          scheduledAt: expect.any(String),
          ...event,
        },
      });

      rootMessenger.call('CronjobController:cancel', MOCK_SNAP_ID, id);
      expect(cronjobController.state.events).toStrictEqual({});

      jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));
      expect(rootMessenger.call).toHaveBeenCalledTimes(2);

      cronjobController.destroy();
    });

    it('throws when cancelling an event scheduled by another origin', () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
      });

      cronjobController.init();

      const event = {
        snapId: MOCK_SNAP_ID,
        schedule: '2022-01-01T01:00Z',
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      };

      const id = rootMessenger.call('CronjobController:schedule', event);
      expect(cronjobController.state.events).toStrictEqual({
        [id]: {
          id,
          recurring: false,
          date: '2022-01-01T01:00:00Z',
          scheduledAt: expect.any(String),
          ...event,
        },
      });

      expect(() =>
        rootMessenger.call('CronjobController:cancel', 'foo', id),
      ).toThrow('Only the origin that scheduled this event can cancel it.');

      cronjobController.destroy();
    });
  });

  describe('CronjobController:get', () => {
    it("returns a list of a Snap's background events", () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
      });

      cronjobController.init();

      const event = {
        snapId: MOCK_SNAP_ID,
        schedule: '2025-05-21T13:25:21.500Z',
        request: {
          method: 'handleEvent',
          params: ['p1'],
        },
      };

      const id = cronjobController.schedule(event);

      const events = rootMessenger.call('CronjobController:get', MOCK_SNAP_ID);
      expect(events).toStrictEqual([
        {
          id,
          snapId: MOCK_SNAP_ID,
          date: '2025-05-21T13:25:21Z',
          recurring: false,
          request: {
            method: 'handleEvent',
            params: ['p1'],
          },
          schedule: '2025-05-21T13:25:21.500Z',
          scheduledAt: expect.any(String),
        },
      ]);

      cronjobController.destroy();
    });
  });

  describe('CronjobController:init', () => {
    it('initializes the controller', () => {
      const rootMessenger = getRootCronjobControllerMessenger();
      const controllerMessenger =
        getRestrictedCronjobControllerMessenger(rootMessenger);

      const cronjobController = new CronjobController({
        messenger: controllerMessenger,
        stateManager: getMockStateManager(),
        state: {
          events: {
            [`cronjob-${MOCK_SNAP_ID}-0`]: {
              id: `cronjob-${MOCK_SNAP_ID}-0`,
              snapId: MOCK_SNAP_ID,
              date: new Date('2022-01-01T00:00Z').toISOString(),
              scheduledAt: new Date('2022-01-01T00:00Z').toISOString(),
              schedule: 'PT25H',
              recurring: true,
              request: {
                method: 'exampleMethod',
                params: ['p1'],
              },
            },
          },
        },
      });

      controllerMessenger.call('CronjobController:init');

      jest.advanceTimersByTime(inMilliseconds(1, Duration.Day));

      expect(controllerMessenger.call).toHaveBeenCalledWith(
        'SnapController:handleRequest',
        {
          snapId: MOCK_SNAP_ID,
          origin: METAMASK_ORIGIN,
          handler: HandlerType.OnCronjob,
          request: {
            method: 'exampleMethod',
            params: ['p1'],
          },
        },
      );

      cronjobController.destroy();
    });
  });
});
