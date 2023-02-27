import { getPersistentState } from '@metamask/base-controller';
import {
  Caveat,
  SubjectPermissions,
  ValidPermission,
} from '@metamask/permission-controller';
import { WALLET_SNAP_PERMISSION_KEY } from '@metamask/rpc-methods';
import {
  DEFAULT_ENDOWMENTS,
  getSnapChecksum,
  HandlerType,
  SnapCaveatType,
  SnapPermissions,
  SnapStatus,
  VirtualFile,
  DEFAULT_REQUESTED_SNAP_VERSION,
} from '@metamask/snaps-utils';
import {
  DEFAULT_SNAP_BUNDLE,
  DEFAULT_SNAP_ICON,
  getMockSnapData,
  getPersistedSnapObject,
  getSnapFiles,
  getSnapManifest,
  getSnapObject,
  getTruncatedSnap,
  MOCK_LOCAL_SNAP_ID,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { AssertionError, SemVerVersion, SemVerRange } from '@metamask/utils';
import { Crypto } from '@peculiar/webcrypto';
import { ethErrors } from 'eth-rpc-errors';
import fetchMock from 'jest-fetch-mock';
import { createAsyncMiddleware, JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';
import { Duplex } from 'stream';

import { NodeThreadExecutionService, setupMultiplex } from '../services';
import {
  ExecutionEnvironmentStub,
  getControllerMessenger,
  getNodeEESMessenger,
  getPersistedSnapsState,
  getSnapController,
  getSnapControllerMessenger,
  getSnapControllerOptions,
  getSnapControllerWithEES,
  getSnapControllerWithEESOptions,
  MOCK_BLOCK_NUMBER,
  MOCK_DAPP_SUBJECT_METADATA,
  MOCK_DAPPS_RPC_ORIGINS_PERMISSION,
  MOCK_NAMESPACES,
  MOCK_RPC_ORIGINS_PERMISSION,
  MOCK_SNAP_SUBJECT_METADATA,
  PERSISTED_MOCK_KEYRING_SNAP,
  sleep,
  loopbackDetect,
  LoopbackLocation,
  MockSnapsRegistry,
  MOCK_WALLET_SNAP_PERMISSION,
  MOCK_SNAP_PERMISSIONS,
  MOCK_ORIGIN_PERMISSIONS,
} from '../test-utils';
import { delay } from '../utils';
import { handlerEndowments, SnapEndowments } from './endowments';
import { SnapsRegistryStatus } from './registry';
import { SnapControllerState, SNAP_APPROVAL_UPDATE } from './SnapController';

const { subtle } = new Crypto();
Object.defineProperty(window, 'crypto', {
  value: {
    ...window.crypto,
    subtle,
    getRandomValues: jest.fn().mockReturnValue(new Uint32Array(32)),
  },
});

fetchMock.enableMocks();

describe('SnapController', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/require-await
    fetchMock.mockImplementation(async () => {
      throw new AssertionError({ message: 'Unmocked access to internet.' });
    });
  });

  it('creates a snap controller and execution service', async () => {
    const [snapController, service] = getSnapControllerWithEES();
    expect(service).toBeDefined();
    expect(snapController).toBeDefined();
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('creates a worker and snap controller, adds a snap, and update its state', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    const state = 'foo';

    await snapController.startSnap(snap.id);
    await snapController.updateSnapState(snap.id, state);
    const snapState = await snapController.getSnapState(snap.id);
    expect(snapState).toStrictEqual(state);

    expect(
      // @ts-expect-error Accessing private property
      snapController.snapsRuntimeData.get(MOCK_SNAP_ID).state,
    ).toStrictEqual(state);
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC api with a NodeThreadExecutionService', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    await snapController.startSnap(snap.id);

    const result = await snapController.handleRequest({
      snapId: snap.id,
      origin: MOCK_ORIGIN,
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });

    expect(result).toBe('test1');
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC API', async () => {
    const rootMessenger = getControllerMessenger();
    const executionEnvironmentStub = new ExecutionEnvironmentStub(
      getNodeEESMessenger(rootMessenger),
    ) as unknown as NodeThreadExecutionService;

    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        rootMessenger,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
      executionEnvironmentStub,
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    await snapController.startSnap(snap.id);

    const result = await snapController.handleRequest({
      snapId: snap.id,
      origin: MOCK_ORIGIN,
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });

    expect(result).toBe('test1');
    snapController.destroy();
  });

  it('passes endowments to a snap when executing it', async () => {
    const rootMessenger = getControllerMessenger();
    const messenger = getSnapControllerMessenger(rootMessenger);
    const snapController = getSnapController(
      getSnapControllerOptions({
        environmentEndowmentPermissions: ['endowment:foo'],
        messenger,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:getEndowments',
      async () => {
        return Promise.resolve(['fooEndowment']);
      },
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    await snapController.startSnap(snap.id);

    expect(messenger.call).toHaveBeenCalledTimes(4);
    expect(messenger.call).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      'endowment:foo',
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      2,
      'PermissionController:getEndowments',
      MOCK_SNAP_ID,
      'endowment:foo',
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      3,
      'ExecutionService:executeSnap',
      {
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        endowments: [...DEFAULT_ENDOWMENTS, 'fooEndowment'],
      },
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      4,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      SnapEndowments.LongRunning,
    );
    snapController.destroy();
  });

  it('errors if attempting to start a snap that was already started', async () => {
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    await snapController.startSnap(MOCK_SNAP_ID);
    await expect(snapController.startSnap(MOCK_SNAP_ID)).rejects.toThrow(
      `Snap "${MOCK_SNAP_ID}" is already started.`,
    );

    expect(messenger.call).toHaveBeenCalledTimes(2);
    expect(messenger.call).toHaveBeenNthCalledWith(
      1,
      'ExecutionService:executeSnap',
      {
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        endowments: [...DEFAULT_ENDOWMENTS],
      },
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      2,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      SnapEndowments.LongRunning,
    );
  });

  it('can rehydrate state', async () => {
    const firstSnapController = getSnapController(
      getSnapControllerOptions({
        state: {
          snaps: getPersistedSnapsState(
            getPersistedSnapObject({
              version: '0.0.1',
              sourceCode: DEFAULT_SNAP_BUNDLE,
              id: 'npm:foo',
              status: SnapStatus.Installing,
            }),
          ),
        },
      }),
    );

    // persist the state somewhere
    const persistedState = getPersistentState<SnapControllerState>(
      firstSnapController.state,
      firstSnapController.metadata,
    );

    // create a new controller
    const secondSnapController = getSnapController(
      getSnapControllerOptions({
        state: persistedState,
      }),
    );

    expect(secondSnapController.isRunning('npm:foo')).toBe(false);
    await secondSnapController.startSnap('npm:foo');

    expect(secondSnapController.state.snaps['npm:foo']).toBeDefined();
    expect(secondSnapController.isRunning('npm:foo')).toBe(true);
    firstSnapController.destroy();
    secondSnapController.destroy();
  });

  it(`adds errors to the controller's state`, () => {
    const rootMessenger = getControllerMessenger();
    const executionEnvironmentStub = new ExecutionEnvironmentStub(
      getNodeEESMessenger(rootMessenger),
    ) as unknown as NodeThreadExecutionService;

    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({ rootMessenger }),
      executionEnvironmentStub,
    );

    snapController.addSnapError({
      code: 1,
      data: {},
      message: 'error happened',
    });

    const arrayOfErrors = Object.entries(snapController.state.snapErrors);

    expect(arrayOfErrors.length > 0).toBe(true);

    snapController.removeSnapError(arrayOfErrors[0][0]);

    expect(Object.entries(snapController.state.snapErrors)).toHaveLength(0);

    snapController.addSnapError({
      code: 1,
      data: {},
      message: 'error happened',
    });

    snapController.addSnapError({
      code: 2,
      data: {},
      message: 'error 2',
    });

    snapController.removeSnapError(
      Object.entries(snapController.state.snapErrors)[0][0],
    );

    expect(Object.entries(snapController.state.snapErrors)).toHaveLength(1);
    expect(Object.entries(snapController.state.snapErrors)[0][1]).toStrictEqual(
      expect.objectContaining({
        code: 2,
        data: {},
        message: 'error 2',
      }),
    );
    snapController.destroy();
  });

  it('handles an error event on the controller messenger', async () => {
    const options = getSnapControllerWithEESOptions({
      state: {
        snaps: getPersistedSnapsState(),
      },
    });
    const { rootMessenger } = options;
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    await snapController.startSnap(snap.id);

    // defer
    setTimeout(() => {
      rootMessenger.publish('ExecutionService:unhandledError', snap.id, {
        message: 'foo',
        code: 123,
      });
    }, 1);

    await new Promise((resolve) => {
      rootMessenger.subscribe('SnapController:stateChange', (state) => {
        const crashedSnap = state.snaps[snap.id];
        expect(crashedSnap.status).toStrictEqual(SnapStatus.Crashed);
        resolve(undefined);
        snapController.destroy();
      });
    });
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC API and then get stopped from idling too long', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 10,
        maxIdleTime: 50,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    await snapController.startSnap(snap.id);

    await snapController.handleRequest({
      snapId: snap.id,
      origin: 'foo.com',
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });

    await delay(100);

    expect(snapController.isRunning(snap.id)).toBe(false);
    snapController.destroy();

    await service.terminateAllSnaps();
  });

  it('terminates a snap even if connection to worker has failed', async () => {
    const rootMessenger = getControllerMessenger();
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        rootMessenger,
        idleTimeCheckInterval: 10,
        maxIdleTime: 50,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      (_origin, permission) => {
        return permission === SnapEndowments.Rpc;
      },
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);
    await snapController.startSnap(snap.id);

    // @ts-expect-error `maxRequestTime` is a private property.
    snapController.maxRequestTime = 50;

    // @ts-expect-error `command` is a private property.
    service.command = async () => sleep(100);

    await expect(
      snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow(/request timed out/u);

    expect(snapController.state.snaps[snap.id].status).toBe('crashed');
    snapController.destroy();

    await service.terminateAllSnaps();
  });

  it(`reads a snap's status after adding it`, async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('stopped');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap, stops it, and starts it again on-demand', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('stopped');

    const results = await snapController.handleRequest({
      snapId: snap.id,
      origin: 'foo.com',
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });
    expect(results).toBe('test1');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('installs a Snap via installSnaps', async () => {
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        detectSnapLocation: loopbackDetect(),
      }),
    );

    jest.spyOn(messenger, 'publish');

    const eventSubscriptionPromise = Promise.all([
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapAdded', (snap) => {
          expect(snap).toStrictEqual(
            getSnapObject({ status: SnapStatus.Installing }),
          );
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapInstalled', (truncatedSnap) => {
          expect(truncatedSnap).toStrictEqual(getTruncatedSnap());
          resolve();
        });
      }),
    ]);

    const expectedSnapObject = getTruncatedSnap();
    const permissions = {
      ...getSnapManifest().initialPermissions,
      [SnapEndowments.Rpc]: {
        caveats: [{ type: 'rpcOrigin', value: { dapps: false, snaps: true } }],
      },
    };

    expect(
      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [MOCK_SNAP_ID]: expectedSnapObject,
    });

    expect(messenger.call).toHaveBeenCalledTimes(5);
    expect(messenger.call).toHaveBeenNthCalledWith(
      1,
      'PermissionController:getPermissions',
      MOCK_ORIGIN,
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      2,
      'ApprovalController:addRequest',
      expect.objectContaining({
        requestData: {
          metadata: {
            origin: MOCK_SNAP_ID,
            dappOrigin: MOCK_ORIGIN,
            id: expect.any(String),
          },
          permissions,
          snapId: MOCK_SNAP_ID,
        },
      }),
      true,
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      3,
      'PermissionController:grantPermissions',
      expect.any(Object),
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      4,
      'ExecutionService:executeSnap',
      expect.any(Object),
    );

    expect(messenger.call).toHaveBeenNthCalledWith(
      5,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      SnapEndowments.LongRunning,
    );

    await eventSubscriptionPromise;
  });

  it('supports non-snap permissions', async () => {
    const messenger = getSnapControllerMessenger();
    const initialPermissions: SnapPermissions = {
      // @ts-expect-error Current type only expects snap permissions
      // eslint-disable-next-line @typescript-eslint/naming-convention
      eth_accounts: {
        requiredMethods: [],
      },
    };

    const { manifest } = getSnapFiles({
      manifest: getSnapManifest({
        initialPermissions,
      }),
    });

    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        detectSnapLocation: loopbackDetect({
          manifest: manifest.result,
        }),
      }),
    );

    const expectedSnapObject = getTruncatedSnap({ initialPermissions });

    expect(
      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [MOCK_SNAP_ID]: expectedSnapObject,
    });
  });

  it('throws an error on invalid semver range during installSnaps', async () => {
    const controller = getSnapController();

    await expect(
      controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: 'foo' },
      }),
    ).rejects.toThrow(
      'The "version" field must be a valid SemVer version range if specified. Received: "foo".',
    );
  });

  it('throws an error if snap is not on allowlist and allowlisting is required', async () => {
    const controller = getSnapController(
      getSnapControllerOptions({
        featureFlags: { requireAllowlist: true },
        detectSnapLocation: loopbackDetect(),
      }),
    );

    await expect(
      controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: DEFAULT_REQUESTED_SNAP_VERSION },
      }),
    ).rejects.toThrow(
      'Cannot install version "1.0.0" of snap "npm:@metamask/example-snap": The snap is not on the allow list.',
    );
  });

  it('reuses an already installed Snap if it satisfies the requested SemVer range', async () => {
    const messenger = getSnapControllerMessenger();
    const controller = getSnapController(
      getSnapControllerOptions({
        messenger,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const authorizeSpy = jest.spyOn(controller as any, 'authorize');
    const messengerCallMock = jest.spyOn(messenger, 'call');

    await controller.installSnaps(MOCK_ORIGIN, {
      [MOCK_SNAP_ID]: { version: '>0.9.0 <1.1.0' },
    });

    const newSnap = controller.get(MOCK_SNAP_ID);

    expect(newSnap).toStrictEqual(getSnapObject());
    expect(authorizeSpy).not.toHaveBeenCalled();
    expect(messengerCallMock).toHaveBeenCalledTimes(1);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:getPermissions',
      MOCK_ORIGIN,
    );
  });

  it('fails to install snap if user rejects installation', async () => {
    const messenger = getSnapControllerMessenger();
    const controller = getSnapController(
      getSnapControllerOptions({
        messenger,
        detectSnapLocation: loopbackDetect(),
      }),
    );

    const permission = {
      [WALLET_SNAP_PERMISSION_KEY]: MOCK_WALLET_SNAP_PERMISSION,
    };

    jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => permission)
      .mockImplementationOnce(() => {
        throw ethErrors.provider.userRejectedRequest();
      })
      .mockImplementationOnce(() => true)
      .mockImplementationOnce(() => false)
      .mockImplementationOnce(() => [MOCK_ORIGIN])
      .mockImplementationOnce(() => permission);

    await expect(
      controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).rejects.toThrow('User rejected the request.');

    expect(controller.get(MOCK_SNAP_ID)).toBeUndefined();
  });

  it('removes a snap that errors during installation after being added', async () => {
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        detectSnapLocation: loopbackDetect(),
      }),
    );

    const messengerCallMock = jest.spyOn(messenger, 'call');

    jest
      .spyOn(snapController as any, 'authorize')
      .mockImplementationOnce(() => {
        throw new Error('foo');
      });

    const eventSubscriptionPromise = Promise.all([
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapAdded', (snap) => {
          expect(snap).toStrictEqual(
            getSnapObject({ status: SnapStatus.Installing }),
          );
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapRemoved', (truncatedSnap) => {
          expect(truncatedSnap).toStrictEqual(getTruncatedSnap());
          resolve();
        });
      }),
    ]);

    await expect(
      snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).rejects.toThrow('foo');

    expect(messengerCallMock).toHaveBeenCalledTimes(6);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:getPermissions',
      MOCK_ORIGIN,
    );

    await eventSubscriptionPromise;
  });

  it('adds a snap, disable/enables it, and still gets a response from an RPC method', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxRequestTime: 2000,
        maxIdleTime: 2000,
        state: {
          snaps: getPersistedSnapsState(
            getPersistedSnapObject({ status: SnapStatus.Installing }),
          ),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    await expect(
      snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow(
      `Snap "${MOCK_SNAP_ID}" is currently being installed. Please try again later.`,
    );

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    await snapController.stopSnap(snap.id);

    await snapController.disableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('stopped');

    await expect(snapController.startSnap(snap.id)).rejects.toThrow(
      `Snap "${MOCK_SNAP_ID}" is disabled.`,
    );

    await expect(
      snapController.handleRequest({
        snapId: snap.id,
        origin: MOCK_ORIGIN,
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow(`Snap "${MOCK_SNAP_ID}" is disabled.`);

    expect(snapController.state.snaps[snap.id].status).toBe('stopped');
    expect(snapController.state.snaps[snap.id].enabled).toBe(false);

    snapController.enableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].enabled).toBe(true);

    expect(snapController.state.snaps[snap.id].status).toBe('stopped');

    const result = await snapController.handleRequest({
      snapId: snap.id,
      origin: MOCK_ORIGIN,
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });

    expect(result).toBe('test1');
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('times out an RPC request that takes too long', async () => {
    const rootMessenger = getControllerMessenger();
    const options = getSnapControllerWithEESOptions({
      rootMessenger,
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      // Note that we are using the default maxRequestTime
      state: {
        snaps: getPersistedSnapsState(),
      },
    });

    const [snapController, service] = getSnapControllerWithEES(options);
    const snap = snapController.getExpect(MOCK_SNAP_ID);

    rootMessenger.registerActionHandler(
      'ExecutionService:handleRpcRequest',
      async () => await sleep(100),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      (_origin, permission) => {
        return permission === SnapEndowments.Rpc;
      },
    );

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    // We set the maxRequestTime to a low enough value for it to time out
    // @ts-expect-error - `maxRequestTime` is a private property.
    snapController.maxRequestTime = 50;

    await expect(
      snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow(/request timed out/u);
    expect(snapController.state.snaps[snap.id].status).toBe('crashed');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not timeout while waiting for response from MetaMask', async () => {
    const sourceCode = `
    module.exports.onRpcRequest = () => ethereum.request({ method: 'eth_blockNumber', params: [] });
    `;

    const options = getSnapControllerWithEESOptions({
      environmentEndowmentPermissions: [SnapEndowments.EthereumProvider],
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      state: {
        snaps: getPersistedSnapsState(
          getPersistedSnapObject({
            sourceCode,
            manifest: getSnapManifest({
              shasum: getSnapChecksum(getSnapFiles({ sourceCode })),
            }),
          }),
        ),
      },
    });

    const [snapController, service] = getSnapControllerWithEES(options);
    const snap = snapController.getExpect(MOCK_SNAP_ID);

    jest
      // Cast because we are mocking a private property
      .spyOn(service, 'setupSnapProvider' as any)
      .mockImplementation((_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream as Duplex, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        const middleware = createAsyncMiddleware(async (req, res, _next) => {
          if (req.method === 'metamask_getProviderState') {
            res.result = {
              isUnlocked: false,
              accounts: [],
              chainId: '0x1',
              networkVersion: '1',
            };
          } else if (req.method === 'eth_blockNumber') {
            await sleep(100);
            res.result = MOCK_BLOCK_NUMBER;
          }
        });
        engine.push(middleware);
        const providerStream = createEngineStream({ engine });
        pump(stream, providerStream, stream);
      });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    // Max request time should be shorter than eth_blockNumber takes to respond
    // @ts-expect-error - `maxRequestTime` is a private property.
    snapController.maxRequestTime = 50;

    expect(
      await snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).toBe(MOCK_BLOCK_NUMBER);

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not timeout while waiting for response from MetaMask when snap does multiple calls', async () => {
    const sourceCode = `
    const fetch = async () => parseInt(await ethereum.request({ method: 'eth_blockNumber', params: [] }), 16);
    module.exports.onRpcRequest = async () => (await fetch()) + (await fetch());
    `;

    const options = getSnapControllerWithEESOptions({
      environmentEndowmentPermissions: [SnapEndowments.EthereumProvider],
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      state: {
        snaps: getPersistedSnapsState(
          getPersistedSnapObject({
            sourceCode,
            manifest: getSnapManifest({
              shasum: getSnapChecksum(getSnapFiles({ sourceCode })),
            }),
          }),
        ),
      },
    });

    const { rootMessenger } = options;
    const [snapController, service] = getSnapControllerWithEES(options);
    const snap = snapController.getExpect(MOCK_SNAP_ID);

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      () => true,
    );

    jest
      // Cast because we are mocking a private property
      .spyOn(service, 'setupSnapProvider' as any)
      .mockImplementation((_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream as Duplex, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        const middleware = createAsyncMiddleware(async (req, res, _next) => {
          if (req.method === 'metamask_getProviderState') {
            res.result = {
              isUnlocked: false,
              accounts: [],
              chainId: '0x1',
              networkVersion: '1',
            };
          } else if (req.method === 'eth_blockNumber') {
            await sleep(100);
            res.result = MOCK_BLOCK_NUMBER;
          }
        });
        engine.push(middleware);
        const providerStream = createEngineStream({ engine });
        pump(stream, providerStream, stream);
      });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    // Max request time should be shorter than eth_blockNumber takes to respond
    // @ts-expect-error - `maxRequestTime` is a private property.
    snapController.maxRequestTime = 50;

    expect(
      await snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).toBe(21896426);

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not time out snaps that are permitted to be long-running', async () => {
    const rootMessenger = getControllerMessenger();
    const options = getSnapControllerWithEESOptions({
      rootMessenger,
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      // Note that we are using the default maxRequestTime
      state: {
        snaps: getPersistedSnapsState(),
      },
    });

    rootMessenger.registerActionHandler(
      'ExecutionService:handleRpcRequest',
      async () => await sleep(100),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      () => true,
    );

    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    // We set the maxRequestTime to a low enough value for it to time out if it
    // weren't a long-running snap.
    // @ts-expect-error - `maxRequestTime` is a private property.
    snapController.maxRequestTime = 50;

    const handlerPromise = snapController.handleRequest({
      snapId: snap.id,
      origin: 'foo.com',
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      },
    });

    const timeoutPromise = sleep(200);

    expect(
      // Race the promises to check that handlerPromise does not time out
      await Promise.race([handlerPromise, timeoutPromise]),
    ).toBe('test1');
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('times out on stuck starting snap', async () => {
    const rootMessenger = getControllerMessenger();
    const messenger = getSnapControllerMessenger(rootMessenger);
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        maxRequestTime: 50,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    rootMessenger.registerActionHandler(
      'ExecutionService:executeSnap',
      async () => await sleep(100),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      () => false,
    );

    await expect(snapController.startSnap(snap.id)).rejects.toThrow(
      /request timed out/u,
    );

    snapController.destroy();
  });

  it('does not kill snaps with open sessions', async () => {
    const sourceCode = `
      module.exports.onRpcRequest = () => 'foo bar';
    `;

    const rootMessenger = getControllerMessenger();
    const options = getSnapControllerWithEESOptions({
      rootMessenger,
      idleTimeCheckInterval: 10,
      maxIdleTime: 50,
      state: {
        snaps: getPersistedSnapsState(
          getPersistedSnapObject({
            sourceCode,
            manifest: getSnapManifest({
              shasum: getSnapChecksum(getSnapFiles({ sourceCode })),
            }),
          }),
        ),
      },
    });
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      () => true,
    );

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    rootMessenger.call(
      'SnapController:incrementActiveReferences',
      MOCK_SNAP_ID,
    );

    expect(
      await snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).toBe('foo bar');

    await sleep(100);

    // Should still be running after idle timeout
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    options.rootMessenger.call(
      'SnapController:decrementActiveReferences',
      MOCK_SNAP_ID,
    );

    await sleep(100);

    // Should be terminated by idle timeout now
    expect(snapController.state.snaps[snap.id].status).toBe('stopped');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it(`shouldn't time out a long running snap on start up`, async () => {
    const rootMessenger = getControllerMessenger();
    const messenger = getSnapControllerMessenger(rootMessenger);
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
        maxRequestTime: 50,
        state: {
          snaps: getPersistedSnapsState(),
        },
      }),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      () => true,
    );

    rootMessenger.registerActionHandler(
      'ExecutionService:executeSnap',
      async () => await sleep(300),
    );

    const snap = snapController.getExpect(MOCK_SNAP_ID);

    const startPromise = snapController.startSnap(snap.id);
    const timeoutPromise = sleep(50).then(() => true);

    expect(
      // Race the promises to check that startPromise does not time out
      await Promise.race([startPromise, timeoutPromise]),
    ).toBe(true);

    snapController.destroy();
  });

  it('removes a snap that is stopped without errors', async () => {
    const rootMessenger = getControllerMessenger();
    const options = getSnapControllerWithEESOptions({
      rootMessenger,
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      maxRequestTime: 300,
      state: {
        snaps: getPersistedSnapsState(),
      },
    });

    const [snapController, service] = getSnapControllerWithEES(
      options,
      new ExecutionEnvironmentStub(
        getNodeEESMessenger(options.rootMessenger),
      ) as unknown as NodeThreadExecutionService,
    );
    const snap = snapController.getExpect(MOCK_SNAP_ID);

    rootMessenger.registerActionHandler(
      'ExecutionService:handleRpcRequest',
      async () => await sleep(30000),
    );

    rootMessenger.registerActionHandler(
      'PermissionController:hasPermission',
      (_origin, permission) => {
        return permission === SnapEndowments.Rpc;
      },
    );

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toBe('running');

    await expect(
      snapController.handleRequest({
        snapId: snap.id,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'test',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow(/request timed out/u);
    expect(snapController.state.snaps[snap.id].status).toBe('crashed');

    await snapController.removeSnap(snap.id);

    expect(snapController.state.snaps[snap.id]).toBeUndefined();

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  describe('handleRequest', () => {
    it.each(Object.keys(handlerEndowments) as HandlerType[])(
      'throws if the snap does not have permission for the handler',
      async (handler) => {
        const rootMessenger = getControllerMessenger();
        const messenger = getSnapControllerMessenger(rootMessenger);
        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(),
            },
          }),
        );

        rootMessenger.registerActionHandler(
          'PermissionController:hasPermission',
          () => false,
        );

        const snap = snapController.getExpect(MOCK_SNAP_ID);
        await expect(
          snapController.handleRequest({
            snapId: snap.id,
            origin: 'foo.com',
            handler,
            request: { jsonrpc: '2.0', method: 'test' },
          }),
        ).rejects.toThrow(
          `Snap "${snap.id}" is not permitted to use "${handlerEndowments[handler]}".`,
        );

        snapController.destroy();
      },
    );

    it('throws if the snap does not have permission to handle JSON-RPC requests from dapps', async () => {
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({
          // Permission to receive JSON-RPC requests from other Snaps.
          [SnapEndowments.Rpc]: MOCK_RPC_ORIGINS_PERMISSION,
        }),
      );

      rootMessenger.registerActionHandler(
        'SubjectMetadataController:getSubjectMetadata',
        () => MOCK_DAPP_SUBJECT_METADATA,
      );

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await expect(
        snapController.handleRequest({
          snapId: snap.id,
          origin: MOCK_ORIGIN,
          handler: HandlerType.OnRpcRequest,
          request: { jsonrpc: '2.0', method: 'test' },
        }),
      ).rejects.toThrow(
        `Snap "${snap.id}" is not permitted to handle JSON-RPC requests from "${MOCK_ORIGIN}".`,
      );

      snapController.destroy();
    });

    it('throws if the snap does not have permission to handle JSON-RPC requests from snaps', async () => {
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({
          // Permission to receive JSON-RPC requests from dapps.
          [SnapEndowments.Rpc]: MOCK_DAPPS_RPC_ORIGINS_PERMISSION,
        }),
      );

      rootMessenger.registerActionHandler(
        'SubjectMetadataController:getSubjectMetadata',
        () => MOCK_SNAP_SUBJECT_METADATA,
      );

      const snap = snapController.getExpect(MOCK_SNAP_ID);
      await expect(
        snapController.handleRequest({
          snapId: snap.id,
          origin: MOCK_SNAP_ID,
          handler: HandlerType.OnRpcRequest,
          request: { jsonrpc: '2.0', method: 'test' },
        }),
      ).rejects.toThrow(
        `Snap "${snap.id}" is not permitted to handle JSON-RPC requests from "${MOCK_SNAP_ID}".`,
      );

      snapController.destroy();
    });
  });

  describe('getRpcRequestHandler', () => {
    it('handlers populate the "jsonrpc" property if missing', async () => {
      const rootMessenger = getControllerMessenger();
      const options = getSnapControllerWithEESOptions({
        rootMessenger,
        state: {
          snaps: getPersistedSnapsState(),
        },
      });
      const [snapController, service] = getSnapControllerWithEES(options);

      rootMessenger.registerActionHandler(
        'PermissionController:hasPermission',
        (_origin, permission) => {
          return permission === SnapEndowments.Rpc;
        },
      );

      await snapController.handleRequest({
        snapId: MOCK_SNAP_ID,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'bar',
          params: {},
          id: 1,
        },
      });

      expect(rootMessenger.call).toHaveBeenCalledTimes(7);
      expect(rootMessenger.call).toHaveBeenCalledWith(
        'ExecutionService:handleRpcRequest',
        MOCK_SNAP_ID,
        {
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            id: 1,
            method: 'bar',
            jsonrpc: '2.0',
            params: {},
          },
        },
      );
      await service.terminateAllSnaps();
    });

    it('handlers throw if the request has an invalid "jsonrpc" property', async () => {
      const fakeSnap = getPersistedSnapObject({ status: SnapStatus.Running });
      const snapId = fakeSnap.id;
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: {
              [snapId]: fakeSnap,
            },
          },
        }),
      );
      await expect(
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: 'kaplar',
            method: 'bar',
            id: 1,
          },
        }),
      ).rejects.toThrow(
        ethErrors.rpc.invalidRequest({
          message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
          data: 'kaplar',
        }),
      );
    });

    it('handlers will throw if there are too many pending requests before a snap has started', async () => {
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const fakeSnap = getPersistedSnapObject({ status: SnapStatus.Stopped });
      const snapId = fakeSnap.id;
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [snapId]: fakeSnap,
            },
          },
        }),
      );

      let resolveExecutePromise: any;
      const deferredExecutePromise = new Promise((res) => {
        resolveExecutePromise = res;
      });

      rootMessenger.registerActionHandler(
        'ExecutionService:executeSnap',
        async () => deferredExecutePromise,
      );

      // Fill up the request queue
      const finishPromise = Promise.all([
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 1,
          },
        }),
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 2,
          },
        }),
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 3,
          },
        }),
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 4,
          },
        }),
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 5,
          },
        }),
      ]);

      await expect(
        snapController.handleRequest({
          snapId,
          origin: 'foo.com',
          handler: HandlerType.OnRpcRequest,
          request: {
            jsonrpc: '2.0',
            method: 'bar',
            params: {},
            id: 6,
          },
        }),
      ).rejects.toThrow(
        'Exceeds maximum number of requests waiting to be resolved, please try again.',
      );

      // Before processing the pending requests,
      // we need an rpc message handler function to be returned
      jest
        .spyOn(messenger, 'call')
        .mockImplementation((method, ..._args: unknown[]) => {
          if (method === 'ExecutionService:executeSnap') {
            return deferredExecutePromise;
          } else if (method === 'ExecutionService:handleRpcRequest') {
            return Promise.resolve(undefined);
          }
          return true;
        });

      // Resolve the promise that the pending requests are waiting for and wait for them to finish
      resolveExecutePromise();
      await finishPromise;
    });
  });

  describe('installSnaps', () => {
    it('returns existing non-local snaps without reinstalling them', async () => {
      const messenger = getSnapControllerMessenger();
      const snapObject = getPersistedSnapObject();
      const truncatedSnap = getTruncatedSnap();

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_SNAP_ID]: snapObject,
            },
          },
        }),
      );

      const authorizeSpy = jest.spyOn(snapController as any, 'authorize');
      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });
      expect(result).toStrictEqual({ [MOCK_SNAP_ID]: truncatedSnap });
      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );
      expect(authorizeSpy).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (already stopped)', async () => {
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapObject = getPersistedSnapObject({
        id: MOCK_LOCAL_SNAP_ID,
      });
      const truncatedSnap = getTruncatedSnap({
        id: MOCK_LOCAL_SNAP_ID,
      });

      const location = new LoopbackLocation({
        manifest: snapObject.manifest,
        shouldAlwaysReload: true,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_LOCAL_SNAP_ID]: snapObject,
            },
          },
          detectSnapLocation: loopbackDetect(location),
        }),
      );

      const permissions = {
        ...getSnapManifest().initialPermissions,
        [SnapEndowments.Rpc]: {
          caveats: [
            { type: 'rpcOrigin', value: { dapps: false, snaps: true } },
          ],
        },
      };

      const stopSnapSpy = jest.spyOn(snapController, 'stopSnap');

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });

      expect(result).toStrictEqual({ [MOCK_LOCAL_SNAP_ID]: truncatedSnap });

      expect(messenger.call).toHaveBeenCalledTimes(5);
      expect(messenger.call).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: permissions,
          subject: { origin: MOCK_LOCAL_SNAP_ID },
          requestData: {
            metadata: {
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
              origin: MOCK_LOCAL_SNAP_ID,
            },
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        },
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(location.manifest).toHaveBeenCalledTimes(1);

      expect(stopSnapSpy).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (running)', async () => {
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const version = '0.0.1';
      const newVersion = '0.0.2';

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({ version }),
      });
      const { manifest: newManifest } = getSnapFiles({
        manifest: getSnapManifest({ version: newVersion }),
      });
      const truncatedSnap = getTruncatedSnap({
        version: newVersion,
        id: MOCK_LOCAL_SNAP_ID,
      });

      const location = new LoopbackLocation({ shouldAlwaysReload: true });
      location.manifest
        .mockImplementationOnce(async () => Promise.resolve(manifest))
        .mockImplementationOnce(async () => Promise.resolve(newManifest));

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: loopbackDetect(location),
        }),
      );

      const permissions = {
        ...getSnapManifest().initialPermissions,
        [SnapEndowments.Rpc]: {
          caveats: [
            { type: 'rpcOrigin', value: { dapps: false, snaps: true } },
          ],
        },
      };

      const stopSnapSpy = jest.spyOn(snapController, 'stopSnap');

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });
      expect(snapController.isRunning(MOCK_LOCAL_SNAP_ID)).toBe(true);

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });
      expect(result).toStrictEqual({
        [MOCK_LOCAL_SNAP_ID]: truncatedSnap,
      });

      expect(messenger.call).toHaveBeenCalledTimes(11);
      expect(messenger.call).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: permissions,
          subject: { origin: MOCK_LOCAL_SNAP_ID },
          requestData: {
            metadata: {
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
              origin: MOCK_LOCAL_SNAP_ID,
            },
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        },
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.anything(),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        6,
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        7,
        'ExecutionService:terminateSnap',
        MOCK_LOCAL_SNAP_ID,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        8,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        9,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: permissions,
          subject: { origin: MOCK_LOCAL_SNAP_ID },
          requestData: {
            metadata: {
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
              origin: MOCK_LOCAL_SNAP_ID,
            },
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        },
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        10,
        'ExecutionService:executeSnap',
        expect.objectContaining({ snapId: MOCK_LOCAL_SNAP_ID }),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        11,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('authorizes permissions needed for snaps', async () => {
      const manifest = getSnapManifest();
      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: loopbackDetect({ manifest }),
        }),
      );

      const truncatedSnap = getTruncatedSnap({
        initialPermissions: manifest.initialPermissions,
      });

      const permissions = {
        ...getSnapManifest().initialPermissions,
        [SnapEndowments.Rpc]: {
          caveats: [
            { type: 'rpcOrigin', value: { dapps: false, snaps: true } },
          ],
        },
      };

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: truncatedSnap,
      });
      expect(messenger.call).toHaveBeenCalledTimes(5);
      expect(messenger.call).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions,
            snapId: MOCK_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: permissions,
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
              origin: MOCK_SNAP_ID,
            },
            snapId: MOCK_SNAP_ID,
          },
        },
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );
    });

    it('throws an error if a forbidden permission is requested', async () => {
      const initialPermissions = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'endowment:long-running': {},
      };

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          initialPermissions,
        }),
      });

      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: loopbackDetect({
            manifest: manifest.result,
          }),
          // eslint-disable-next-line @typescript-eslint/naming-convention
          excludedPermissions: { 'endowment:long-running': 'foobar' },
        }),
      );

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [MOCK_SNAP_ID]: {},
        }),
      ).rejects.toThrow('One or more permissions are not allowed:\nfoobar');
    });

    it('displays a warning if endowment:long-running is used', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          maxRequestTime: 50,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      rootMessenger.registerActionHandler(
        'PermissionController:hasPermission',
        () => true,
      );

      rootMessenger.registerActionHandler(
        'ExecutionService:executeSnap',
        async () => await sleep(300),
      );

      const snap = snapController.getExpect(MOCK_SNAP_ID);

      await snapController.startSnap(snap.id);

      snapController.destroy();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'endowment:long-running will soon be deprecated. For more information please see https://github.com/MetaMask/snaps-monorepo/issues/945.',
      );
    });

    it('maps permission caveats to the proper format', async () => {
      const initialPermissions = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        snap_getBip32Entropy: [
          { path: ['m', "44'", "60'"], curve: 'secp256k1' as const },
        ],
      };

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          initialPermissions,
        }),
      });

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: loopbackDetect({
            manifest: manifest.result,
          }),
        }),
      );

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      expect(messenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              snap_getBip32Entropy: {
                caveats: [
                  {
                    type: SnapCaveatType.PermittedDerivationPaths,
                    value: [{ path: ['m', "44'", "60'"], curve: 'secp256k1' }],
                  },
                ],
              },
            },
            snapId: MOCK_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_getBip32Entropy: {
              caveats: [
                {
                  type: SnapCaveatType.PermittedDerivationPaths,
                  value: [{ path: ['m', "44'", "60'"], curve: 'secp256k1' }],
                },
              ],
            },
          },
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            snapId: MOCK_SNAP_ID,
          },
        },
      );
    });

    it('maps endowment permission caveats to the proper format', async () => {
      const keyringSnap = PERSISTED_MOCK_KEYRING_SNAP;
      const { manifest } = keyringSnap;

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: loopbackDetect({
            manifest,
            files: [
              new VirtualFile({
                value: keyringSnap.sourceCode,
                path: manifest.source.location.npm.filePath,
              }),
              new VirtualFile({
                value: DEFAULT_SNAP_ICON,
                path: manifest.source.location.npm.iconPath,
              }),
            ],
          }),
        }),
      );

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      const caveat = {
        type: SnapCaveatType.SnapKeyring,
        value: { namespaces: MOCK_NAMESPACES },
      };

      expect(messenger.call).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: {
              [SnapEndowments.Keyring]: {
                caveats: [caveat],
              },
            },
            snapId: MOCK_SNAP_ID,
          },
        }),
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: {
            [SnapEndowments.Keyring]: {
              caveats: [caveat],
            },
          },
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            snapId: MOCK_SNAP_ID,
          },
        },
      );
    });

    it('maps permission caveats to the proper format when updating snaps', async () => {
      const initialPermissions = {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        snap_getBip32Entropy: [
          { path: ['m', "44'", "60'"], curve: 'secp256k1' as const },
        ],
      };
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
          initialPermissions,
        }),
      });

      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });

      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({}),
      );

      await snapController.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            snap_getBip32Entropy: {
              caveats: [
                {
                  type: SnapCaveatType.PermittedDerivationPaths,
                  value: [{ path: ['m', "44'", "60'"], curve: 'secp256k1' }],
                },
              ],
            },
          },
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            approvedPermissions: {},
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            newPermissions: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              snap_getBip32Entropy: {
                caveats: [
                  {
                    type: SnapCaveatType.PermittedDerivationPaths,
                    value: [{ path: ['m', "44'", "60'"], curve: 'secp256k1' }],
                  },
                ],
              },
            },
            newVersion: '1.1.0',
            snapId: MOCK_SNAP_ID,
            unusedPermissions: {},
          },
        },
      );
    });

    it('returns an error on invalid snap id', async () => {
      const snapId = 'foo';
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [snapId]: {},
        }),
      ).rejects.toThrow(
        `Invalid snap ID: Expected the value to satisfy a union of \`intersection | string\`, but received: "foo".`,
      );
    });

    it('returns an error if an origin does not have the permission to install a snap', async () => {
      const rootMessenger = getControllerMessenger();

      rootMessenger.registerActionHandler(
        'PermissionController:getPermissions',
        () => ({}),
      );

      const controller = getSnapController(
        getSnapControllerOptions({
          messenger: getSnapControllerMessenger(rootMessenger),
        }),
      );

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [MOCK_SNAP_ID]: {},
        }),
      ).rejects.toThrow(
        `Not authorized to install snap "${MOCK_SNAP_ID}". Request the permission for the snap before attempting to install it.`,
      );
    });

    it('updates a snap', async () => {
      const newVersion = '1.0.2';
      const newVersionRange = '>=1.0.1';

      const rootMessenger = getControllerMessenger();
      const messenger = getSnapControllerMessenger(rootMessenger);

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: newVersion,
        }),
      });

      const detectLocationMock = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: getSnapManifest(),
            }),
        )
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: manifest.result,
            }),
        );

      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: detectLocationMock,
        }),
      );

      await controller.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await controller.stopSnap(MOCK_SNAP_ID);

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: newVersionRange },
      });

      expect(messenger.call).toHaveBeenCalledTimes(11);
      expect(messenger.call).toHaveBeenNthCalledWith(
        7,
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        8,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        9,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
          id: expect.any(String),
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            permissions: {},
            snapId: MOCK_SNAP_ID,
            newVersion,
            newPermissions: {},
            approvedPermissions: MOCK_SNAP_PERMISSIONS,
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        10,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(messenger.call).toHaveBeenNthCalledWith(
        11,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(detectLocationMock).toHaveBeenCalledTimes(2);
      expect(detectLocationMock).toHaveBeenNthCalledWith(
        2,
        MOCK_SNAP_ID,
        expect.objectContaining({ versionRange: newVersionRange }),
      );

      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: getTruncatedSnap({
          version: newVersion,
        }),
      });
    });

    it("returns an error when didn't update", async () => {
      // Scenario: a newer version is installed compared to requested version range
      const newVersion = '0.9.0';
      const newVersionRange = '^0.9.0';

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: newVersion,
        }),
      });
      const detect = loopbackDetect({
        manifest: manifest.result,
      });
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation: detect,
        }),
      );

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [MOCK_SNAP_ID]: { version: newVersionRange },
        }),
      ).rejects.toThrow(
        `Snap "${MOCK_SNAP_ID}@1.0.0" is already installed. Couldn't update to a version inside requested "${newVersionRange}" range.`,
      );

      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );
      expect(detect).toHaveBeenCalledTimes(1);
      expect(detect).toHaveBeenCalledWith(
        MOCK_SNAP_ID,
        expect.objectContaining({ versionRange: newVersionRange }),
      );
    });

    it('returns an error when a throw happens inside an update', async () => {
      // Scenario: fetch fails
      const newVersionRange = '^1.0.1';

      const messenger = getSnapControllerMessenger();
      const location = new LoopbackLocation();
      location.manifest.mockImplementationOnce(async () =>
        Promise.reject(new Error('foo')),
      );
      const detect = loopbackDetect(location);
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation: detect,
        }),
      );

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [MOCK_SNAP_ID]: { version: newVersionRange },
        }),
      ).rejects.toThrow('foo');

      expect(messenger.call).toHaveBeenCalledTimes(1);
      expect(messenger.call).toHaveBeenCalledWith(
        'PermissionController:getPermissions',
        MOCK_ORIGIN,
      );
      expect(detect).toHaveBeenCalledTimes(1);
      expect(detect).toHaveBeenCalledWith(
        MOCK_SNAP_ID,
        expect.objectContaining({ versionRange: newVersionRange }),
      );
    });

    it('rolls back any updates and installs made during a failure scenario', async () => {
      const snapId1 = 'npm:@metamask/example-snap1';
      const snapId2 = 'npm:@metamask/example-snap2';
      const snapId3 = 'npm:@metamask/example-snap3';
      const oldVersion = '1.0.0';
      const newVersion = '1.0.1';

      const manifest = getSnapManifest();
      const detect = jest
        .fn()
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: getSnapFiles({
                manifest: getSnapManifest({
                  version: newVersion,
                }),
              }).manifest.result,
            }),
        )
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: getSnapFiles({
                manifest: getSnapManifest({
                  version: newVersion,
                }),
                sourceCode: 'foo',
              }).manifest.result,
              files: [
                new VirtualFile({
                  value: 'foo',
                  path: manifest.source.location.npm.filePath,
                }),
                new VirtualFile({
                  value: DEFAULT_SNAP_ICON,
                  path: manifest.source.location.npm.iconPath,
                }),
              ],
            }),
        );

      const [controller, service] = getSnapControllerWithEES(
        getSnapControllerWithEESOptions({ detectSnapLocation: detect }),
      );

      await controller.installSnaps(MOCK_ORIGIN, { [snapId1]: {} });
      await controller.installSnaps(MOCK_ORIGIN, { [snapId2]: {} });
      await controller.stopSnap(snapId1);
      await controller.stopSnap(snapId2);

      expect(controller.get(snapId1)).toBeDefined();
      expect(controller.get(snapId2)).toBeDefined();

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [snapId3]: {},
          [snapId1]: { version: newVersion },
          [snapId2]: { version: newVersion },
        }),
      ).rejects.toThrow(`Snap ${snapId2} crashed with updated source code.`);

      expect(detect).toHaveBeenCalledTimes(5);

      expect(controller.get(snapId3)).toBeUndefined();
      expect(controller.get(snapId1)?.manifest.version).toBe(oldVersion);
      expect(controller.get(snapId2)?.manifest.version).toBe(oldVersion);

      controller.destroy();
      await service.terminateAllSnaps();
    });

    it('will not create snapshots for already installed snaps that have invalid requested ranges', async () => {
      const snapId1 = 'npm:@metamask/example-snap1';
      const snapId2 = 'npm:@metamask/example-snap2';
      const snapId3 = 'npm:@metamask/example-snap3';
      const oldVersion = '1.0.0';
      const newVersion = '1.0.1';
      const olderVersion = '0.9.0';

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: olderVersion,
        }),
      });
      const detect = jest
        .fn()
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: manifest.result,
            }),
        );

      const options = getSnapControllerWithEESOptions({
        detectSnapLocation: detect,
      });
      const { messenger } = options;
      const [controller, service] = getSnapControllerWithEES(options);

      const listener = jest.fn();
      messenger.subscribe('SnapController:snapRolledback' as any, listener);

      await controller.installSnaps(MOCK_ORIGIN, { [snapId1]: {} });
      await controller.installSnaps(MOCK_ORIGIN, { [snapId2]: {} });
      await controller.stopSnap(snapId1);
      await controller.stopSnap(snapId2);

      expect(controller.get(snapId1)).toBeDefined();
      expect(controller.get(snapId2)).toBeDefined();

      await expect(
        controller.installSnaps(MOCK_ORIGIN, {
          [snapId3]: {},
          [snapId1]: { version: olderVersion },
          [snapId2]: { version: newVersion },
        }),
      ).rejects.toThrow(
        `Snap "${snapId1}@${oldVersion}" is already installed. Couldn't update to a version inside requested "${olderVersion}" range.`,
      );

      expect(detect).toHaveBeenCalledTimes(4);

      expect(controller.get(snapId3)).toBeUndefined();
      expect(controller.get(snapId1)?.manifest.version).toBe(oldVersion);
      expect(controller.get(snapId2)?.manifest.version).toBe(oldVersion);
      expect(listener).toHaveBeenCalledTimes(0);

      controller.destroy();
      await service.terminateAllSnaps();
    });

    it('handles unnormalized paths correctly', async () => {
      const { manifest, sourceCode, svgIcon } = getSnapFiles({
        manifest: getSnapManifest({
          filePath: './bundle.js',
          iconPath: 'icon.svg',
        }),
        sourceCode: new VirtualFile({
          value: DEFAULT_SNAP_BUNDLE,
          path: 'bundle.js',
        }),
        svgIcon: new VirtualFile({
          value: DEFAULT_SNAP_ICON,
          path: 'icon.svg',
        }),
      });
      const controller = getSnapController(
        getSnapControllerOptions({
          detectSnapLocation: loopbackDetect({
            manifest,
            files: [sourceCode, svgIcon as VirtualFile],
          }),
        }),
      );

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });
      expect((result[MOCK_SNAP_ID] as any).error).toBeUndefined();
    });
  });

  describe('updateSnap', () => {
    it('throws an error for non installed snap', async () => {
      const detectSnapLocation = loopbackDetect();
      await expect(async () =>
        getSnapController().updateSnap(
          MOCK_ORIGIN,
          MOCK_LOCAL_SNAP_ID,
          detectSnapLocation(),
        ),
      ).rejects.toThrow(`Snap "${MOCK_LOCAL_SNAP_ID}" not found.`);
    });

    it('throws an error if the specified SemVer range is invalid', async () => {
      const detectSnapLocation = loopbackDetect();
      const controller = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      await expect(
        controller.updateSnap(
          MOCK_ORIGIN,
          MOCK_SNAP_ID,
          detectSnapLocation(),
          'this is not a version' as SemVerRange,
        ),
      ).rejects.toThrow(
        'Received invalid snap version range: "this is not a version".',
      );
    });

    it('throws an error if the new version of the snap is blocked', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });
      const registry = new MockSnapsRegistry();
      const controller = getSnapController(
        getSnapControllerOptions({
          registry,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );

      registry.get.mockResolvedValueOnce({
        [MOCK_SNAP_ID]: { status: SnapsRegistryStatus.Blocked },
      });

      await expect(
        controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID, detectSnapLocation()),
      ).rejects.toThrow('Cannot install version "1.1.0" of snap');
    });

    it('does not update on older snap version downloaded', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '0.9.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      const snap = controller.getExpect(MOCK_SNAP_ID);

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toBeNull();
      expect(newSnap?.version).toStrictEqual(snap.version);
      expect(onSnapUpdated).not.toHaveBeenCalled();
      expect(onSnapAdded).not.toHaveBeenCalled();
    });

    it('updates a snap', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = jest
        .fn()
        .mockImplementationOnce(() => new LoopbackLocation())
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: manifest.result,
            }),
        );
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation,
        }),
      );
      const callActionSpy = jest.spyOn(messenger, 'call');
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      await controller.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await controller.stopSnap(MOCK_SNAP_ID);

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      const newSnapTruncated = controller.getTruncated(MOCK_SNAP_ID);

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toStrictEqual(newSnapTruncated);
      expect(newSnap?.version).toBe('1.1.0');
      expect(newSnap?.versionHistory).toStrictEqual([
        {
          origin: MOCK_ORIGIN,
          version: '1.0.0',
          date: expect.any(Number),
        },
        {
          origin: MOCK_ORIGIN,
          version: '1.1.0',
          date: expect.any(Number),
        },
      ]);
      expect(callActionSpy).toHaveBeenCalledTimes(10);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        7,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        8,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
          id: expect.any(String),
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            permissions: {},
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: {},
            approvedPermissions: MOCK_SNAP_PERMISSIONS,
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        9,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        10,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(onSnapUpdated).toHaveBeenCalledTimes(1);
      expect(onSnapAdded).toHaveBeenCalledTimes(1);
    });

    it('can update crashed snap', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = jest.fn().mockImplementation(
        () =>
          new LoopbackLocation({
            manifest: manifest.result,
          }),
      );
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({ status: SnapStatus.Crashed }),
            ),
          },
          detectSnapLocation,
        }),
      );

      const result = await controller.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      const newSnapTruncated = controller.getTruncated(MOCK_SNAP_ID);

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toStrictEqual(newSnapTruncated);
      expect(newSnap?.version).toBe('1.1.0');
      expect(newSnap?.versionHistory).toStrictEqual([
        {
          origin: MOCK_ORIGIN,
          version: '1.0.0',
          date: expect.any(Number),
        },
        {
          origin: MOCK_ORIGIN,
          version: '1.1.0',
          date: expect.any(Number),
        },
      ]);
      expect(newSnap?.status).toBe(SnapStatus.Running);
    });

    it('stops and restarts a running snap during an update', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );
      const callActionSpy = jest.spyOn(messenger, 'call');

      await controller.startSnap(MOCK_SNAP_ID);

      const stopSnapSpy = jest.spyOn(controller as any, 'stopSnap');

      await controller.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      const isRunning = controller.isRunning(MOCK_SNAP_ID);

      expect(callActionSpy).toHaveBeenCalledTimes(7);

      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'ExecutionService:executeSnap',
        expect.objectContaining({ snapId: MOCK_SNAP_ID }),
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
          id: expect.any(String),
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            permissions: {},
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: {},
            approvedPermissions: MOCK_SNAP_PERMISSIONS,
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        5,
        'ExecutionService:terminateSnap',
        MOCK_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        7,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );
      expect(isRunning).toBe(true);
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('returns null on update request denied', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerVersion,
        }),
      });
      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );
      const callActionSpy = jest.spyOn(messenger, 'call');
      const permissions = {
        ...getSnapManifest().initialPermissions,
        [SnapEndowments.Rpc]: {
          caveats: [
            { type: 'rpcOrigin', value: { dapps: false, snaps: true } },
          ],
        },
      };

      callActionSpy.mockImplementation((method, ..._args: unknown[]) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        } else if (method === 'ApprovalController:addRequest') {
          throw ethErrors.provider.userRejectedRequest();
        }
        return false;
      });

      await expect(
        controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID, detectSnapLocation()),
      ).rejects.toThrow('User rejected the request.');

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(newSnap?.version).toBe('1.0.0');
      expect(callActionSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
          id: expect.any(String),
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            permissions,
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: permissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
      );
    });

    it('requests approval for new and already approved permissions and revoke unused permissions', async () => {
      const messenger = getSnapControllerMessenger();

      /* eslint-disable @typescript-eslint/naming-convention */
      const initialPermissions = {
        snap_confirm: {},
        snap_manageState: {},
      };

      const approvedPermissions: SubjectPermissions<
        ValidPermission<string, Caveat<string, any>>
      > = {
        snap_confirm: {
          caveats: null,
          parentCapability: 'snap_confirm',
          id: '1',
          date: 1,
          invoker: MOCK_SNAP_ID,
        },
        snap_manageState: {
          caveats: null,
          parentCapability: 'snap_manageState',
          id: '2',
          date: 1,
          invoker: MOCK_SNAP_ID,
        },
      };

      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          initialPermissions,
        }),
      });

      const { manifest: manifest2 } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.1.0' as SemVerRange,
          initialPermissions: {
            snap_confirm: {},
            'endowment:network-access': {},
          },
        }),
      });

      const callActionSpy = jest.spyOn(messenger, 'call');

      const detect = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: manifest.result,
            }),
        )
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: manifest2.result,
            }),
        );

      const controller = getSnapController(
        getSnapControllerOptions({ messenger, detectSnapLocation: detect }),
      );

      callActionSpy.mockImplementation((method, ...args): any => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as { requestData: unknown }).requestData;
        } else if (method === 'PermissionController:getPermissions') {
          if (args[0] === MOCK_ORIGIN) {
            return MOCK_ORIGIN_PERMISSIONS;
          }
          return approvedPermissions;
        } else if (
          method === 'PermissionController:revokePermissions' ||
          method === 'PermissionController:grantPermissions'
        ) {
          return undefined;
        }
        return false;
      });

      await controller.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await controller.stopSnap(MOCK_SNAP_ID);

      await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID, detect());

      expect(callActionSpy).toHaveBeenCalledTimes(12);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        7,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        8,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
          id: expect.any(String),
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            permissions: { 'endowment:network-access': {} },
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: { 'endowment:network-access': {} },
            approvedPermissions: {
              snap_confirm: approvedPermissions.snap_confirm,
            },
            unusedPermissions: {
              snap_manageState: approvedPermissions.snap_manageState,
            },
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        9,
        'PermissionController:revokePermissions',
        { [MOCK_SNAP_ID]: ['snap_manageState'] },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        10,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: { 'endowment:network-access': {} },
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: { 'endowment:network-access': {} },
            approvedPermissions: {
              snap_confirm: approvedPermissions.snap_confirm,
            },
            unusedPermissions: {
              snap_manageState: approvedPermissions.snap_manageState,
            },
          },
        },
      );
      /* eslint-enable @typescript-eslint/naming-convention */

      expect(callActionSpy).toHaveBeenNthCalledWith(
        11,
        'ExecutionService:executeSnap',
        expect.anything(),
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        12,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );
    });

    it('assigns the same id to the approval request and the request metadata', async () => {
      expect.assertions(2);

      const messenger = getSnapControllerMessenger();

      /* eslint-disable @typescript-eslint/naming-convention */
      const initialPermissions = {
        snap_confirm: {},
        snap_manageState: {},
      };
      const approvedPermissions: SubjectPermissions<
        ValidPermission<string, Caveat<string, any>>
      > = {
        snap_confirm: {
          caveats: null,
          parentCapability: 'snap_confirm',
          id: '1',
          date: 1,
          invoker: MOCK_SNAP_ID,
        },
        snap_manageState: {
          caveats: null,
          parentCapability: 'snap_manageState',
          id: '2',
          date: 1,
          invoker: MOCK_SNAP_ID,
        },
      };

      const detect = jest
        .fn()
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: getSnapFiles({
                manifest: getSnapManifest({ initialPermissions }),
              }).manifest.result,
            }),
        )
        .mockImplementationOnce(
          () =>
            new LoopbackLocation({
              manifest: getSnapFiles({
                manifest: getSnapManifest({
                  version: '1.1.0' as SemVerRange,
                  initialPermissions: {
                    snap_confirm: {},
                    'endowment:network-access': {},
                  },
                }),
              }).manifest.result,
            }),
        );
      const callActionSpy = jest.spyOn(messenger, 'call');
      /* eslint-enable @typescript-eslint/naming-convention */

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          detectSnapLocation: detect,
        }),
      );

      callActionSpy.mockImplementation((method, ...args: unknown[]): any => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          const request = args[0] as { id: any; requestData: any };

          // eslint-disable-next-line jest/no-conditional-expect
          expect(request.id).toBe(request.requestData.metadata.id);
          return request.requestData;
        } else if (method === 'PermissionController:getPermissions') {
          if (args[0] === MOCK_ORIGIN) {
            return MOCK_ORIGIN_PERMISSIONS;
          }
          return approvedPermissions;
        } else if (
          method === 'PermissionController:revokePermissions' ||
          method === 'PermissionController:grantPermissions'
        ) {
          return undefined;
        }
        return undefined;
      });

      await snapController.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await snapController.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID, detect());
    });

    it('handles unnormalized paths correctly', async () => {
      const { manifest } = getSnapFiles({
        manifest: getSnapManifest({
          version: '1.2.0' as SemVerVersion,
          filePath: './dist/bundle.js',
          iconPath: './images/icon.svg',
        }),
      });
      const detectSnapLocation = loopbackDetect({
        manifest: manifest.result,
      });
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
          detectSnapLocation,
        }),
      );

      await controller.updateSnap(
        MOCK_ORIGIN,
        MOCK_SNAP_ID,
        detectSnapLocation(),
      );

      const newSnap = controller.get(MOCK_SNAP_ID);
      expect(newSnap?.version).toBe('1.2.0');
    });
  });

  describe('removeSnap', () => {
    it('will remove the "wallet_snap" permission from a subject that no longer has any permitted snaps', async () => {
      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      const permissions = {
        [WALLET_SNAP_PERMISSION_KEY]: {
          ...MOCK_WALLET_SNAP_PERMISSION,
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: {
                [MOCK_SNAP_ID]: {},
              },
            },
          ],
        },
      };

      const callActionSpy = jest.spyOn(messenger, 'call');
      callActionSpy.mockImplementation((method, ..._args): any => {
        if (method === 'PermissionController:getSubjectNames') {
          return [MOCK_ORIGIN];
        } else if (method === 'PermissionController:getPermissions') {
          return permissions;
        }
        return undefined;
      });

      await snapController.removeSnap(MOCK_SNAP_ID);
      expect(callActionSpy).toHaveBeenCalledTimes(4);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:revokePermissions',
        {
          [MOCK_ORIGIN]: [WALLET_SNAP_PERMISSION_KEY],
        },
      );
    });

    it('will update the "wallet_snap" permission from a subject that has one or more permitted snaps', async () => {
      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject(),
              getPersistedSnapObject({ id: `${MOCK_SNAP_ID}2` }),
            ),
          },
        }),
      );

      const permissions = {
        [WALLET_SNAP_PERMISSION_KEY]: {
          ...MOCK_WALLET_SNAP_PERMISSION,
          caveats: [
            {
              type: SnapCaveatType.SnapIds,
              value: {
                [MOCK_SNAP_ID]: {},
                [`${MOCK_SNAP_ID}2`]: {},
              },
            },
          ],
        },
      };

      const callActionSpy = jest.spyOn(messenger, 'call');
      callActionSpy.mockImplementation((method, ..._args): any => {
        if (method === 'PermissionController:getSubjectNames') {
          return [MOCK_ORIGIN];
        } else if (method === 'PermissionController:getPermissions') {
          return permissions;
        }
        return undefined;
      });

      await snapController.removeSnap(MOCK_SNAP_ID);
      expect(callActionSpy).toHaveBeenCalledTimes(4);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:updateCaveat',
        MOCK_ORIGIN,
        WALLET_SNAP_PERMISSION_KEY,
        SnapCaveatType.SnapIds,
        { [`${MOCK_SNAP_ID}2`]: {} },
      );
    });
  });

  describe('enableSnap', () => {
    it('enables a disabled snap', () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({ enabled: false }),
            ),
          },
        }),
      );

      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(false);

      snapController.enableSnap(MOCK_SNAP_ID);
      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(true);
    });

    it('throws an error if the specified snap does not exist', () => {
      const snapController = getSnapController();
      expect(() => snapController.enableSnap(MOCK_SNAP_ID)).toThrow(
        `Snap "${MOCK_SNAP_ID}" not found.`,
      );
    });

    it('throws an error if the specified snap is blocked', () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({ enabled: false, blocked: true }),
            ),
          },
        }),
      );

      expect(() => snapController.enableSnap(MOCK_SNAP_ID)).toThrow(
        `Snap "${MOCK_SNAP_ID}" is blocked and cannot be enabled.`,
      );
    });
  });

  describe('disableSnap', () => {
    it('disables a snap', async () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(true);

      await snapController.disableSnap(MOCK_SNAP_ID);
      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(false);
    });

    it('stops a running snap when disabling it', async () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(true);

      await snapController.startSnap(MOCK_SNAP_ID);
      expect(snapController.isRunning(MOCK_SNAP_ID)).toBe(true);

      await snapController.disableSnap(MOCK_SNAP_ID);
      expect(snapController.get(MOCK_SNAP_ID)?.enabled).toBe(false);
      expect(snapController.isRunning(MOCK_SNAP_ID)).toBe(false);
    });

    it('throws an error if the specified snap does not exist', async () => {
      const snapController = getSnapController();
      await expect(snapController.disableSnap(MOCK_SNAP_ID)).rejects.toThrow(
        `Snap "${MOCK_SNAP_ID}" not found.`,
      );
    });
  });

  describe('updateBlockedSnaps', () => {
    it('blocks snaps as expected', async () => {
      const messenger = getSnapControllerMessenger();
      const publishMock = jest.spyOn(messenger, 'publish');

      const registry = new MockSnapsRegistry();

      const mockSnapA = getMockSnapData({
        id: 'npm:exampleA',
        origin: 'foo.com',
      });

      const mockSnapB = getMockSnapData({
        id: 'npm:exampleB',
        origin: 'bar.io',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          registry,
          state: {
            snaps: getPersistedSnapsState(
              mockSnapA.stateObject,
              mockSnapB.stateObject,
            ),
          },
        }),
      );

      const explanation = 'foo';
      const infoUrl = 'foobar.com';
      // Block snap A, ignore B.
      registry.get.mockResolvedValueOnce({
        [mockSnapA.id]: {
          status: SnapsRegistryStatus.Blocked,
          reason: { explanation, infoUrl },
        },
      });
      await snapController.updateBlockedSnaps();

      // Ensure that CheckSnapBlockListArg is correct
      expect(registry.get).toHaveBeenCalledWith({
        [mockSnapA.id]: {
          version: mockSnapA.manifest.version,
          checksum: mockSnapA.manifest.source.shasum,
        },
        [mockSnapB.id]: {
          version: mockSnapB.manifest.version,
          checksum: mockSnapB.manifest.source.shasum,
        },
      });

      // A is blocked and disabled
      expect(snapController.get(mockSnapA.id)?.blocked).toBe(true);
      expect(snapController.get(mockSnapA.id)?.enabled).toBe(false);

      // B is unblocked and enabled
      expect(snapController.get(mockSnapB.id)?.blocked).toBe(false);
      expect(snapController.get(mockSnapB.id)?.enabled).toBe(true);

      expect(publishMock).toHaveBeenLastCalledWith(
        'SnapController:snapBlocked',
        mockSnapA.id,
        {
          infoUrl,
          explanation,
        },
      );
    });

    it('stops running snaps when they are blocked', async () => {
      const registry = new MockSnapsRegistry();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          registry,
          state: {
            snaps: getPersistedSnapsState(mockSnap.stateObject),
          },
        }),
      );

      await snapController.startSnap(mockSnap.id);

      // Block the snap
      registry.get.mockResolvedValueOnce({
        [mockSnap.id]: { status: SnapsRegistryStatus.Blocked },
      });
      await snapController.updateBlockedSnaps();

      // The snap is blocked, disabled, and stopped
      expect(snapController.get(mockSnap.id)?.blocked).toBe(true);
      expect(snapController.get(mockSnap.id)?.enabled).toBe(false);
      expect(snapController.isRunning(mockSnap.id)).toBe(false);
    });

    it('unblocks snaps as expected', async () => {
      const messenger = getSnapControllerMessenger();
      const publishMock = jest.spyOn(messenger, 'publish');

      const registry = new MockSnapsRegistry();

      const mockSnapA = getMockSnapData({
        id: 'npm:exampleA',
        origin: 'foo.com',
        blocked: true,
        enabled: false,
      });

      const mockSnapB = getMockSnapData({
        id: 'npm:exampleB',
        origin: 'bar.io',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          registry,
          state: {
            snaps: getPersistedSnapsState(
              mockSnapA.stateObject,
              mockSnapB.stateObject,
            ),
          },
        }),
      );

      // A is blocked and disabled
      expect(snapController.get(mockSnapA.id)?.blocked).toBe(true);
      expect(snapController.get(mockSnapA.id)?.enabled).toBe(false);

      // B is unblocked and enabled
      expect(snapController.get(mockSnapB.id)?.blocked).toBe(false);
      expect(snapController.get(mockSnapB.id)?.enabled).toBe(true);

      // Indicate that both snaps A and B are unblocked, and update blocked
      // states.
      registry.get.mockResolvedValueOnce({
        [mockSnapA.id]: { status: SnapsRegistryStatus.Unverified },
        [mockSnapB.id]: { status: SnapsRegistryStatus.Unverified },
      });
      await snapController.updateBlockedSnaps();

      // A is unblocked, but still disabled
      expect(snapController.get(mockSnapA.id)?.blocked).toBe(false);
      expect(snapController.get(mockSnapA.id)?.enabled).toBe(false);

      // B remains unblocked and enabled
      expect(snapController.get(mockSnapB.id)?.blocked).toBe(false);
      expect(snapController.get(mockSnapB.id)?.enabled).toBe(true);

      expect(publishMock).toHaveBeenLastCalledWith(
        'SnapController:snapUnblocked',
        mockSnapA.id,
      );
    });

    it('updating blocked snaps does not throw if a snap is removed while fetching the blocklist', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const registry = new MockSnapsRegistry();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          registry,
          state: {
            snaps: getPersistedSnapsState(mockSnap.stateObject),
          },
        }),
      );

      // Block the snap
      let resolveBlockListPromise: any;
      registry.get.mockReturnValueOnce(
        new Promise<unknown>((resolve) => (resolveBlockListPromise = resolve)),
      );

      const updateBlockList = snapController.updateBlockedSnaps();

      // Remove the snap while waiting for the blocklist
      await snapController.removeSnap(mockSnap.id);

      // Resolve the blocklist and wait for the call to complete
      resolveBlockListPromise({
        [mockSnap.id]: { status: SnapsRegistryStatus.Blocked },
      });
      await updateBlockList;

      // The snap was removed, no errors were thrown
      expect(snapController.has(mockSnap.id)).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs but does not throw unexpected errors while blocking', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const registry = new MockSnapsRegistry();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          registry,
          state: {
            snaps: getPersistedSnapsState(mockSnap.stateObject),
          },
        }),
      );

      await snapController.startSnap(mockSnap.id);

      jest.spyOn(snapController, 'stopSnap').mockImplementationOnce(() => {
        throw new Error('foo');
      });

      // Block the snap
      registry.get.mockResolvedValueOnce({
        [mockSnap.id]: { status: SnapsRegistryStatus.Blocked },
      });
      await snapController.updateBlockedSnaps();

      // A is blocked and disabled
      expect(snapController.get(mockSnap.id)?.blocked).toBe(true);
      expect(snapController.get(mockSnap.id)?.enabled).toBe(false);

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Encountered error when stopping blocked snap "${mockSnap.id}".`,
        new Error('foo'),
      );
    });
  });

  describe('getRegistryMetadata', () => {
    it('returns the metadata for a verified snap', async () => {
      const registry = new MockSnapsRegistry();
      registry.getMetadata.mockReturnValue({
        name: 'Mock Snap',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          registry,
        }),
      );

      expect(
        await snapController.getRegistryMetadata(MOCK_SNAP_ID),
      ).toStrictEqual({
        name: 'Mock Snap',
      });
    });

    it('returns null for a non-verified snap', async () => {
      const registry = new MockSnapsRegistry();
      const snapController = getSnapController(
        getSnapControllerOptions({
          registry,
        }),
      );

      expect(await snapController.getRegistryMetadata(MOCK_SNAP_ID)).toBeNull();
    });
  });

  describe('SnapController actions', () => {
    describe('SnapController:get', () => {
      it('gets a snap', () => {
        const messenger = getSnapControllerMessenger();

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(),
            },
          }),
        );

        const getSpy = jest.spyOn(snapController, 'get');
        const result = messenger.call('SnapController:get', MOCK_SNAP_ID);

        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(result).toMatchObject(getSnapObject());
      });
    });

    describe('SnapController:handleRequest', () => {
      it('handles a snap RPC request', async () => {
        const messenger = getSnapControllerMessenger();

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(),
            },
          }),
        );

        const handleRpcRequestSpy = jest
          .spyOn(snapController, 'handleRequest')
          .mockResolvedValueOnce(true);

        expect(
          await messenger.call('SnapController:handleRequest', {
            snapId: MOCK_SNAP_ID,
            handler: HandlerType.OnRpcRequest,
            origin: 'foo',
            request: {},
          }),
        ).toBe(true);
        expect(handleRpcRequestSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('handles a transaction insight request', async () => {
      const messenger = getSnapControllerMessenger();

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      const handleRpcRequestSpy = jest
        .spyOn(snapController, 'handleRequest')
        .mockResolvedValueOnce(true);

      expect(
        await messenger.call('SnapController:handleRequest', {
          snapId: MOCK_SNAP_ID,
          handler: HandlerType.OnTransaction,
          origin: 'foo',
          request: {},
        }),
      ).toBe(true);
      expect(handleRpcRequestSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SnapController:getSnapState', () => {
    it(`gets the snap's state`, async () => {
      const messenger = getSnapControllerMessenger();

      const state = 'foo';

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
            snapStates: {
              [MOCK_SNAP_ID]: state,
            },
          },
        }),
      );

      const getSnapStateSpy = jest.spyOn(snapController, 'getSnapState');
      const result = await messenger.call(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
      );

      expect(getSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(state);
    });
  });

  describe('SnapController:has', () => {
    it('checks if a snap exists in state', () => {
      const messenger = getSnapControllerMessenger();

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({
                version: '0.0.1',
                sourceCode: DEFAULT_SNAP_BUNDLE,
                id: 'npm:fooSnap',
                manifest: getSnapManifest(),
                enabled: true,
                status: SnapStatus.Installing,
              }),
            ),
          },
        }),
      );

      const hasSpy = jest.spyOn(snapController, 'has');
      const result = messenger.call('SnapController:has', 'npm:fooSnap');

      expect(hasSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  });

  describe('SnapController:updateSnapState', () => {
    it(`updates the snap's state`, async () => {
      const messenger = getSnapControllerMessenger();

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: getPersistedSnapsState(),
          },
        }),
      );

      const updateSnapStateSpy = jest.spyOn(snapController, 'updateSnapState');
      const state = 'bar';
      await messenger.call(
        'SnapController:updateSnapState',
        MOCK_SNAP_ID,
        state,
      );

      expect(updateSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(
        // @ts-expect-error Accessing private property
        snapController.snapsRuntimeData.get(MOCK_SNAP_ID).state,
      ).toStrictEqual(state);
    });
  });

  describe('SnapController:clearSnapState', () => {
    it('clears the state of a snap', async () => {
      const messenger = getSnapControllerMessenger();

      getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snapStates: { [MOCK_SNAP_ID]: 'foo' },
            snaps: getPersistedSnapsState(
              getPersistedSnapObject({
                status: SnapStatus.Installing,
              }),
            ),
          },
        }),
      );

      messenger.call('SnapController:clearSnapState', MOCK_SNAP_ID);
      const clearedState = await messenger.call(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
      );
      expect(clearedState).toBeNull();
    });
  });

  describe('SnapController:updateBlockedSnaps', () => {
    it('calls SnapController.updateBlockedSnaps()', async () => {
      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
        }),
      );

      const updateBlockedSnapsSpy = jest
        .spyOn(snapController, 'updateBlockedSnaps')
        .mockImplementation();

      await messenger.call('SnapController:updateBlockedSnaps');
      expect(updateBlockedSnapsSpy).toHaveBeenCalledTimes(1);
    });

    describe('SnapController:enable', () => {
      it('calls SnapController.enableSnap()', () => {
        const messenger = getSnapControllerMessenger();
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: false,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(mockSnap.stateObject),
            },
          }),
        );

        messenger.call('SnapController:enable', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id].enabled).toBe(true);
      });
    });

    describe('SnapController:disable', () => {
      it('calls SnapController.disableSnap()', async () => {
        const messenger = getSnapControllerMessenger();
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: true,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(mockSnap.stateObject),
            },
          }),
        );

        await messenger.call('SnapController:disable', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id].enabled).toBe(false);
      });
    });

    describe('SnapController:remove', () => {
      it('calls SnapController.removeSnap()', async () => {
        const messenger = getSnapControllerMessenger();
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: true,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(mockSnap.stateObject),
            },
          }),
        );

        await messenger.call('SnapController:remove', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id]).toBeUndefined();
      });
    });

    describe('SnapController:getPermitted', () => {
      it('calls SnapController.getPermittedSnaps()', async () => {
        const rootMessenger = getControllerMessenger();
        const messenger = getSnapControllerMessenger(rootMessenger);
        const mockSnap = getMockSnapData({
          id: MOCK_SNAP_ID,
          origin: MOCK_ORIGIN,
        });

        getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(mockSnap.stateObject),
            },
          }),
        );

        const result = await messenger.call(
          'SnapController:getPermitted',
          mockSnap.origin,
        );
        expect(result).toStrictEqual({
          [MOCK_SNAP_ID]: getTruncatedSnap(),
        });
      });
    });

    describe('SnapController:getAllSnaps', () => {
      it('calls SnapController.getAllSnaps()', () => {
        const messenger = getSnapControllerMessenger();
        const mockSnap = getMockSnapData({
          id: MOCK_SNAP_ID,
          origin: MOCK_ORIGIN,
        });

        getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: getPersistedSnapsState(mockSnap.stateObject),
            },
          }),
        );

        const result = messenger.call('SnapController:getAll');
        expect(result).toStrictEqual([getTruncatedSnap()]);
      });
    });

    describe('SnapController:install', () => {
      it('calls SnapController.installSnaps()', async () => {
        const messenger = getSnapControllerMessenger();
        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
          }),
        );

        const installSnapsSpy = jest
          .spyOn(snapController, 'installSnaps')
          .mockImplementation();

        const snaps = { [MOCK_SNAP_ID]: {} };
        await messenger.call('SnapController:install', 'foo', snaps);
        expect(installSnapsSpy).toHaveBeenCalledTimes(1);
        expect(installSnapsSpy).toHaveBeenCalledWith('foo', snaps);
      });
    });

    describe('SnapController:removeSnapError', () => {
      it('calls SnapController.removeSnapError()', () => {
        const messenger = getSnapControllerMessenger();
        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snapErrors: {
                foo: { internalID: 'foo', message: 'bar', code: -1 },
              },
            },
          }),
        );

        messenger.call('SnapController:removeSnapError', 'foo');
        expect(snapController.state.snapErrors.foo).toBeUndefined();
      });
    });

    describe('SnapController:getRegistryMetadata', () => {
      it('calls SnapController.getRegistryMetadata()', async () => {
        const messenger = getSnapControllerMessenger();
        const registry = new MockSnapsRegistry();

        registry.getMetadata.mockReturnValue({
          name: 'Mock Snap',
        });

        getSnapController(
          getSnapControllerOptions({
            messenger,
            registry,
          }),
        );

        expect(
          await messenger.call(
            'SnapController:getRegistryMetadata',
            MOCK_SNAP_ID,
          ),
        ).toStrictEqual({
          name: 'Mock Snap',
        });
      });
    });
  });
});
