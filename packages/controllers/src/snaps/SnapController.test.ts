import { Duplex } from 'stream';
import passworder from '@metamask/browser-passworder';
import {
  Caveat,
  getPersistentState,
  SubjectPermissions,
  ValidPermission,
} from '@metamask/controllers';
import {
  DEFAULT_ENDOWMENTS,
  getSnapSourceShasum,
  SnapManifest,
  HandlerType,
  SnapStatus,
  SnapCaveatType,
} from '@metamask/snap-utils';
import { Crypto } from '@peculiar/webcrypto';
import { EthereumRpcError, ethErrors, serializeError } from 'eth-rpc-errors';
import fetchMock from 'jest-fetch-mock';
import { createAsyncMiddleware, JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';
import {
  getSnapManifest,
  getPersistedSnapObject,
  getSnapObject,
  MOCK_ORIGIN,
  MOCK_SNAP_ID,
  getTruncatedSnap,
  getMockSnapData,
  DEFAULT_SNAP_BUNDLE,
  MOCK_LOCAL_SNAP_ID,
} from '@metamask/snap-utils/test-utils';
import { NodeThreadExecutionService, setupMultiplex } from '../services';
import { delay } from '../utils';
import {
  ExecutionEnvironmentStub,
  getControllerMessenger,
  getNodeEESMessenger,
  getSnapController,
  getSnapControllerMessenger,
  getSnapControllerOptions,
  getSnapControllerWithEES,
  getSnapControllerWithEESOptions,
  MOCK_KEYRING_SNAP,
  MOCK_NAMESPACES,
} from '../test-utils';
import { SnapEndowments } from './endowments';
import { SNAP_APPROVAL_UPDATE, SnapControllerState } from './SnapController';

const { subtle } = new Crypto();
Object.defineProperty(window, 'crypto', {
  value: {
    ...window.crypto,
    subtle,
    getRandomValues: jest.fn().mockReturnValue(new Uint32Array(32)),
  },
});

jest.mock('./utils/npm', () => ({
  ...jest.requireActual('./utils/npm'),
  fetchNpmSnap: jest.fn().mockResolvedValue({
    manifest: getSnapManifest(),
    sourceCode: DEFAULT_SNAP_BUNDLE,
  }),
}));

fetchMock.enableMocks();

describe('SnapController', () => {
  it('creates a snap controller and execution service', async () => {
    const [snapController, service] = getSnapControllerWithEES();
    expect(service).toBeDefined();
    expect(snapController).toBeDefined();
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('creates a worker and snap controller, adds a snap, and update its state', async () => {
    const [snapController, service] = getSnapControllerWithEES();

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    const state = { hello: 'world' };
    await snapController.startSnap(snap.id);
    await snapController.updateSnapState(snap.id, state);
    const snapState = await snapController.getSnapState(snap.id);
    expect(snapState).toStrictEqual(state);
    expect(snapController.state.snapStates).toStrictEqual({
      [MOCK_SNAP_ID]: await passworder.encrypt(
        `stateEncryption:${MOCK_SNAP_ID}`,
        state,
      ),
    });
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC api with a NodeThreadExecutionService', async () => {
    const [snapController, service] = getSnapControllerWithEES();

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

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
    expect(result).toStrictEqual('test1');
    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC API', async () => {
    const rootMessenger = getControllerMessenger();
    const executionEnvironmentStub = new ExecutionEnvironmentStub(
      getNodeEESMessenger(rootMessenger),
    ) as unknown as NodeThreadExecutionService;

    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({ rootMessenger }),
      executionEnvironmentStub,
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

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
    expect(result).toStrictEqual('test1');
    snapController.destroy();
  });

  it('passes endowments to a snap when executing it', async () => {
    const messenger = getSnapControllerMessenger();
    const callActionMock = jest.spyOn(messenger, 'call');

    const snapController = getSnapController(
      getSnapControllerOptions({
        environmentEndowmentPermissions: ['endowment:foo'],
        messenger,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    callActionMock.mockImplementation((method, ...args) => {
      if (method === 'PermissionController:hasPermission') {
        return true;
      } else if (method === 'ApprovalController:addRequest') {
        return (args[0] as any).requestData;
      } else if (method === 'PermissionController:getEndowments') {
        return ['fooEndowment'] as any;
      }
      return false;
    });

    await snapController.startSnap(snap.id);

    expect(callActionMock).toHaveBeenCalledTimes(4);
    expect(callActionMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      'endowment:foo',
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      2,
      'PermissionController:getEndowments',
      MOCK_SNAP_ID,
      'endowment:foo',
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      3,
      'ExecutionService:executeSnap',
      {
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        endowments: [...DEFAULT_ENDOWMENTS, 'fooEndowment'],
      },
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      4,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      SnapEndowments.LongRunning,
    );
    snapController.destroy();
  });

  it('errors if attempting to start a snap that was already started', async () => {
    const manifest = {
      ...getSnapManifest(),
      initialPermissions: { eth_accounts: {} },
    };

    const messenger = getSnapControllerMessenger();
    const callActionMock = jest.spyOn(messenger, 'call');

    const snapController = getSnapController(
      getSnapControllerOptions({ messenger }),
    );

    await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      manifest,
      sourceCode: DEFAULT_SNAP_BUNDLE,
    });
    await snapController.startSnap(MOCK_SNAP_ID);
    await expect(snapController.startSnap(MOCK_SNAP_ID)).rejects.toThrow(
      `Snap "${MOCK_SNAP_ID}" is already started.`,
    );
    expect(callActionMock).toHaveBeenCalledTimes(2);
    expect(callActionMock).toHaveBeenNthCalledWith(
      1,
      'ExecutionService:executeSnap',
      {
        snapId: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        endowments: [...DEFAULT_ENDOWMENTS],
      },
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
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
          snaps: {
            'npm:foo': getPersistedSnapObject({
              permissionName: 'fooperm',
              version: '0.0.1',
              sourceCode: DEFAULT_SNAP_BUNDLE,
              id: 'npm:foo',
              status: SnapStatus.Installing,
            }),
          },
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

    expect(secondSnapController.isRunning('npm:foo')).toStrictEqual(false);
    await secondSnapController.startSnap('npm:foo');

    expect(secondSnapController.state.snaps['npm:foo']).toBeDefined();
    expect(secondSnapController.isRunning('npm:foo')).toStrictEqual(true);
    firstSnapController.destroy();
    secondSnapController.destroy();
  });

  it(`adds errors to the controller's state`, async () => {
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

    expect(arrayOfErrors.length > 0).toStrictEqual(true);

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
    const options = getSnapControllerWithEESOptions();
    const { rootMessenger } = options;
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });
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
        idleTimeCheckInterval: 50,
        maxIdleTime: 100,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });
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

    await delay(300);

    expect(snapController.isRunning(snap.id)).toStrictEqual(false);
    snapController.destroy();

    await service.terminateAllSnaps();
  });

  it('terminates a snap even if connection to worker has failed', async () => {
    const rootMessenger = getControllerMessenger();
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        rootMessenger,
        idleTimeCheckInterval: 50,
        maxIdleTime: 100,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });
    await snapController.startSnap(snap.id);

    (snapController as any)._maxRequestTime = 50;

    (service as any)._command = () =>
      new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

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

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');
    snapController.destroy();

    await service.terminateAllSnaps();
  });

  it(`reads a snap's status after adding it`, async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('adds a snap, stops it, and starts it again on-demand', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

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
    expect(results).toStrictEqual('test1');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('installs a Snap via installSnaps', async () => {
    const messenger = getSnapControllerMessenger(undefined, false);
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
      }),
    );

    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementation((method, ...args) => {
        if (method === 'PermissionController:getPermissions') {
          return {};
        } else if (
          method === 'PermissionController:hasPermission' &&
          args[1] === SnapEndowments.LongRunning
        ) {
          return false;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as any).requestData;
        }
        return true;
      });
    jest.spyOn(messenger, 'publish');

    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: getSnapManifest({
            shasum: getSnapSourceShasum(DEFAULT_SNAP_BUNDLE),
          }),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
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
        messenger.subscribe('SnapController:snapInstalled', (truncatedSnap) => {
          expect(truncatedSnap).toStrictEqual(getTruncatedSnap());
          resolve();
        });
      }),
    ]);

    const expectedSnapObject = getTruncatedSnap();

    expect(
      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [MOCK_SNAP_ID]: expectedSnapObject,
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(5);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_ORIGIN,
      expectedSnapObject.permissionName,
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      2,
      'ApprovalController:addRequest',
      expect.objectContaining({
        requestData: {
          metadata: {
            origin: MOCK_SNAP_ID,
            dappOrigin: MOCK_ORIGIN,
            id: expect.any(String),
          },
          permissions: getSnapManifest().initialPermissions,
          snapId: MOCK_SNAP_ID,
        },
      }),
      true,
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      3,
      'PermissionController:grantPermissions',
      expect.any(Object),
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      4,
      'ExecutionService:executeSnap',
      expect.any(Object),
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      5,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      SnapEndowments.LongRunning,
    );

    await eventSubscriptionPromise;
  });

  it('throws an error on invalid semver range during installSnaps', async () => {
    const controller = getSnapController();

    const result = await controller.installSnaps(MOCK_ORIGIN, {
      [MOCK_SNAP_ID]: { version: 'foo' },
    });

    expect(result).toMatchObject({
      [MOCK_SNAP_ID]: { error: expect.any(EthereumRpcError) },
    });
  });

  it('reuses an already installed Snap if it satisfies the requested SemVer range', async () => {
    const messenger = getSnapControllerMessenger();
    const controller = getSnapController(
      getSnapControllerOptions({ messenger }),
    );

    await controller.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      manifest: getSnapManifest(),
      sourceCode: DEFAULT_SNAP_BUNDLE,
    });

    const addSpy = jest.spyOn(controller as any, 'add');
    const authorizeSpy = jest.spyOn(controller as any, 'authorize');
    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true);

    await controller.installSnaps(MOCK_ORIGIN, {
      [MOCK_SNAP_ID]: { version: '>0.9.0 <1.1.0' },
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newSnap = controller.get(MOCK_SNAP_ID)!;

    expect(newSnap).toStrictEqual(
      getSnapObject({ status: SnapStatus.Installing }),
    );
    expect(addSpy).not.toHaveBeenCalled();
    expect(authorizeSpy).not.toHaveBeenCalled();
    expect(messengerCallMock).toHaveBeenCalledTimes(1);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_ORIGIN,
      newSnap?.permissionName,
    );
  });

  it('fails to install snap if user rejects installation', async () => {
    const messenger = getSnapControllerMessenger(undefined, false);
    const controller = getSnapController(
      getSnapControllerOptions({ messenger }),
    );

    jest.spyOn(messenger, 'call').mockImplementation((method) => {
      if (method === 'ApprovalController:addRequest') {
        throw ethErrors.provider.userRejectedRequest();
      }
      return true;
    });

    jest
      .spyOn(controller as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: getSnapManifest(),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

    const result = await controller.installSnaps(MOCK_ORIGIN, {
      [MOCK_SNAP_ID]: {},
    });

    const { code, message } = serializeError(
      ethErrors.provider.userRejectedRequest(),
    );

    expect(result).toStrictEqual({
      [MOCK_SNAP_ID]: { error: expect.objectContaining({ code, message }) },
    });
    expect(controller.get(MOCK_SNAP_ID)).toBeUndefined();
  });

  it('removes a snap that errors during installation after being added', async () => {
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        messenger,
      }),
    );

    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true)
      .mockImplementation();

    jest.spyOn(messenger, 'publish');
    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: getSnapManifest(),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

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

    const expectedSnapObject = getTruncatedSnap();

    expect(
      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [MOCK_SNAP_ID]: { error: serializeError(new Error('foo')) },
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(3);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_ORIGIN,
      expectedSnapObject.permissionName,
    );

    await eventSubscriptionPromise;
  });

  it('adds a snap, disable/enables it, and still gets a response from an RPC method', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxRequestTime: 2000,
        maxIdleTime: 2000,
      }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

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
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);

    await snapController.disableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

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

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');
    expect(snapController.state.snaps[snap.id].enabled).toStrictEqual(false);

    snapController.enableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].enabled).toStrictEqual(true);

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

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

    expect(result).toStrictEqual('test1');
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('times out an RPC request that takes too long', async () => {
    const options = getSnapControllerWithEESOptions({
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      // Note that we are using the default maxRequestTime
    });
    jest
      .spyOn(options.messenger, 'call')
      .mockImplementation((method, ...args) => {
        // override handler to take too long to return
        if (method === 'ExecutionService:handleRpcRequest') {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(undefined);
            }, 300);
          });
        } else if (
          method === 'PermissionController:hasPermission' &&
          args[1] === SnapEndowments.LongRunning
        ) {
          return false;
        }
        return true;
      });
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // We set the maxRequestTime to a low enough value for it to time out
    (snapController as any)._maxRequestTime = 50;

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
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not timeout while waiting for response from MetaMask', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
      }),
    );
    const sourceCode = `
    module.exports.onRpcRequest = () => wallet.request({ method: 'eth_blockNumber', params: [] });
    `;

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    const blockNumber = '0xa70e77';

    jest
      // Cast because we are mocking a private property
      .spyOn(service, 'setupSnapProvider' as any)
      .mockImplementation((_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream as Duplex, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        const middleware = createAsyncMiddleware(async (req, res, _next) => {
          if (req.method === 'metamask_getProviderState') {
            res.result = { isUnlocked: false, accounts: [] };
          } else if (req.method === 'eth_blockNumber') {
            await new Promise((resolve) => setTimeout(resolve, 400));
            res.result = blockNumber;
          }
        });
        engine.push(middleware);
        const providerStream = createEngineStream({ engine });
        pump(stream, providerStream, stream);
      });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // Max request time should be shorter than eth_blockNumber takes to respond
    (snapController as any)._maxRequestTime = 300;

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
    ).toBe(blockNumber);

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not timeout while waiting for response from MetaMask when snap does multiple calls', async () => {
    const [snapController, service] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
      }),
    );
    const sourceCode = `
    const fetch = async () => parseInt(await wallet.request({ method: 'eth_blockNumber', params: [] }), 16);
    module.exports.onRpcRequest = async () => (await fetch()) + (await fetch());
    `;

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    jest
      // Cast because we are mocking a private property
      .spyOn(service, 'setupSnapProvider' as any)
      .mockImplementation((_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream as Duplex, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        const middleware = createAsyncMiddleware(async (req, res, _next) => {
          if (req.method === 'metamask_getProviderState') {
            res.result = { isUnlocked: false, accounts: [] };
          } else if (req.method === 'eth_blockNumber') {
            await new Promise((resolve) => setTimeout(resolve, 400));
            res.result = '0xa70e77';
          }
        });
        engine.push(middleware);
        const providerStream = createEngineStream({ engine });
        pump(stream, providerStream, stream);
      });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // Max request time should be shorter than eth_blockNumber takes to respond
    (snapController as any)._maxRequestTime = 300;

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
    ).toBe(21896430);

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('does not time out snaps that are permitted to be long-running', async () => {
    const options = getSnapControllerWithEESOptions({
      idleTimeCheckInterval: 30000,
      maxIdleTime: 160000,
      // Note that we are using the default maxRequestTime
    });

    jest.spyOn(options.messenger, 'call').mockImplementation((method) => {
      // override handler to take too long to return
      if (method === 'ExecutionService:handleRpcRequest') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 300);
        });
      }
      // Return true for everything here, so we signal that we have the long-running permission
      return true;
    });

    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // We set the maxRequestTime to a low enough value for it to time out if it werent a long running snap
    (snapController as any)._maxRequestTime = 50;

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

    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });

    expect(
      // Race the promises to check that handlerPromise does not time out
      await Promise.race([handlerPromise, timeoutPromise]),
    ).toBe(true);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('times out on stuck starting snap', async () => {
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({ messenger, maxRequestTime: 50 }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    jest.spyOn(messenger, 'call').mockImplementation((method) => {
      if (method === 'ExecutionService:executeSnap') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 300);
        });
      }
      return false;
    });

    await expect(snapController.startSnap(snap.id)).rejects.toThrow(
      /request timed out/u,
    );

    snapController.destroy();
  });

  it('does not kill snaps with open sessions', async () => {
    const options = getSnapControllerWithEESOptions({
      idleTimeCheckInterval: 100,
      maxIdleTime: 500,
    });
    const [snapController, service] = getSnapControllerWithEES(options);
    const sourceCode = `
    module.exports.onRpcRequest = () => 'foo bar';
    `;

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await options.rootMessenger.call(
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

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 501);
    });

    // Should still be running after idle timeout
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await options.rootMessenger.call(
      'SnapController:decrementActiveReferences',
      MOCK_SNAP_ID,
    );

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 101);
    });

    // Should be terminated by idle timeout now
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  it('shouldnt time out a long running snap on start up', async () => {
    const messenger = getSnapControllerMessenger();
    jest.spyOn(messenger, 'call').mockImplementation((method) => {
      // Make snap take 300 ms to execute
      if (method === 'ExecutionService:executeSnap') {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 300);
        });
      }
      // Return true for everything here, so we signal that we have the long-running permission
      return true;
    });
    const snapController = getSnapController(
      getSnapControllerOptions({ messenger, maxRequestTime: 50 }),
    );

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    const startPromise = snapController.startSnap(snap.id);

    const timeoutPromise = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 200);
    });

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
      maxRequestTime: 1000,
    });
    jest
      .spyOn(options.messenger, 'call')
      .mockImplementation((method, ...args) => {
        // override handler to take too long to return
        if (method === 'ExecutionService:handleRpcRequest') {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(undefined);
            }, 30000);
          });
        } else if (
          method === 'PermissionController:hasPermission' &&
          args[1] === SnapEndowments.LongRunning
        ) {
          return false;
        }
        return true;
      });
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: DEFAULT_SNAP_BUNDLE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

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
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');

    await snapController.removeSnap(snap.id);

    expect(snapController.state.snaps[snap.id]).toBeUndefined();

    snapController.destroy();
    await service.terminateAllSnaps();
  });

  describe('getRpcRequestHandler', () => {
    it('handlers populate the "jsonrpc" property if missing', async () => {
      const snapId = 'fooSnap';
      const options = getSnapControllerWithEESOptions({
        state: {
          snaps: {
            [snapId]: {
              enabled: true,
              id: snapId,
              status: SnapStatus.Running,
            } as any,
          },
        },
      });
      const [snapController, service] = getSnapControllerWithEES(options);

      const mockMessageHandler = jest.fn();
      const spyOnMessengerCall = jest
        .spyOn(options.messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'ExecutionService:handleRpcRequest') {
            return mockMessageHandler as any;
          }
          return true;
        });

      await snapController.handleRequest({
        snapId,
        origin: 'foo.com',
        handler: HandlerType.OnRpcRequest,
        request: {
          jsonrpc: '2.0',
          method: 'bar',
          params: {},
          id: 1,
        },
      });

      expect(spyOnMessengerCall).toHaveBeenCalledTimes(2);
      expect(spyOnMessengerCall).toHaveBeenCalledWith(
        'ExecutionService:handleRpcRequest',
        snapId,
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
      const messenger = getSnapControllerMessenger();
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

      jest.spyOn(messenger, 'call').mockImplementation((method) => {
        if (method === 'ExecutionService:executeSnap') {
          return deferredExecutePromise;
        }
        return true;
      });

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
      jest.spyOn(messenger, 'call').mockImplementation((method) => {
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

  describe('add', () => {
    it('does not persist failed addition attempt for future use', async () => {
      const manifest = getSnapManifest();
      const snapController = getSnapController();
      const snap = getSnapObject();

      const setSpy = jest
        .spyOn(snapController as any, '_set')
        .mockRejectedValueOnce(new Error('bar'))
        .mockResolvedValue(snap);

      await expect(
        snapController.add({
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }),
      ).rejects.toThrow('bar');
      expect(setSpy).toHaveBeenCalledTimes(1);

      expect(
        await snapController.add({
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }),
      ).toBe(snap);
      expect(setSpy).toHaveBeenCalledTimes(2);
    });

    it(`throws if the snap's manifest does not match the requested version range`, async () => {
      const controller = getSnapController();

      await expect(
        controller.add({
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
          manifest: getSnapManifest(),
          sourceCode: DEFAULT_SNAP_BUNDLE,
          versionRange: '>1.0.0',
        }),
      ).rejects.toThrow('Version mismatch');
    });

    it('throws if the fetched version of the snap is blocked', async () => {
      const checkBlockListSpy = jest.fn();
      const controller = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
        }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

      checkBlockListSpy.mockResolvedValueOnce({
        [MOCK_SNAP_ID]: { blocked: true },
      });

      await expect(
        controller.add({
          id: MOCK_SNAP_ID,
          origin: MOCK_ORIGIN,
        }),
      ).rejects.toThrow('Cannot install version "1.1.0" of snap');
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

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          }
          return false;
        });

      const addMock = jest.spyOn(snapController, 'add').mockImplementation();

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });
      expect(result).toStrictEqual({ [MOCK_SNAP_ID]: truncatedSnap });
      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        snapObject.permissionName,
      );
      expect(addMock).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (already stopped)', async () => {
      const messenger = getSnapControllerMessenger();
      const snapObject = getPersistedSnapObject({
        id: MOCK_LOCAL_SNAP_ID,
      });
      const truncatedSnap = getTruncatedSnap({
        id: MOCK_LOCAL_SNAP_ID,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_LOCAL_SNAP_ID]: snapObject,
            },
          },
        }),
      );

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method, ...args) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'ApprovalController:addRequest') {
            return (args[0] as any).requestData;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return {
            ...snapObject,
          };
        });
      const stopSnapSpy = jest.spyOn(snapController, 'stopSnap');

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });
      expect(result).toStrictEqual({ [MOCK_LOCAL_SNAP_ID]: truncatedSnap });

      expect(callActionMock).toHaveBeenCalledTimes(5);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        snapObject.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: getSnapManifest().initialPermissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: getSnapManifest().initialPermissions,
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

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(MOCK_LOCAL_SNAP_ID, '*');

      expect(stopSnapSpy).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (running)', async () => {
      const messenger = getSnapControllerMessenger();
      const version = '0.0.1';
      const newVersion = '0.0.2';

      const manifest = getSnapManifest({ version });
      const newManifest = getSnapManifest({ version: newVersion });
      const truncatedSnap = getTruncatedSnap({
        version: newVersion,
        id: MOCK_LOCAL_SNAP_ID,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
        }),
      );

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method, ...args) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'ApprovalController:addRequest') {
            return (args[0] as any).requestData;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => ({
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }))
        .mockImplementationOnce(() => ({
          manifest: newManifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }));
      const stopSnapSpy = jest.spyOn(snapController, 'stopSnap');

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });
      expect(snapController.isRunning(MOCK_LOCAL_SNAP_ID)).toStrictEqual(true);

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_LOCAL_SNAP_ID]: {},
      });
      expect(result).toStrictEqual({
        [MOCK_LOCAL_SNAP_ID]: truncatedSnap,
      });

      expect(callActionMock).toHaveBeenCalledTimes(11);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        truncatedSnap.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: manifest.initialPermissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: manifest.initialPermissions,
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

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.anything(),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        6,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        truncatedSnap.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        7,
        'ExecutionService:terminateSnap',
        MOCK_LOCAL_SNAP_ID,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        8,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_LOCAL_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: newManifest.initialPermissions,
            snapId: MOCK_LOCAL_SNAP_ID,
          },
        }),
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        9,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: newManifest.initialPermissions,
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

      expect(callActionMock).toHaveBeenNthCalledWith(
        10,
        'ExecutionService:executeSnap',
        expect.objectContaining({ snapId: MOCK_LOCAL_SNAP_ID }),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        11,
        'PermissionController:hasPermission',
        MOCK_LOCAL_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(2);

      expect(fetchSnapMock).toHaveBeenNthCalledWith(1, MOCK_LOCAL_SNAP_ID, '*');
      expect(fetchSnapMock).toHaveBeenNthCalledWith(2, MOCK_LOCAL_SNAP_ID, '*');
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('authorizes permissions needed for snaps', async () => {
      const manifest = getSnapManifest();
      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      const truncatedSnap = getTruncatedSnap({
        initialPermissions: manifest.initialPermissions,
      });

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method, ...args) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'ApprovalController:addRequest') {
            return (args[0] as any).requestData;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return getPersistedSnapObject({ manifest });
        });

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: truncatedSnap,
      });
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledTimes(5);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        truncatedSnap.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        expect.objectContaining({
          requestData: {
            metadata: {
              origin: MOCK_SNAP_ID,
              dappOrigin: MOCK_ORIGIN,
              id: expect.any(String),
            },
            permissions: manifest.initialPermissions,
            snapId: MOCK_SNAP_ID,
          },
        }),
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: manifest.initialPermissions,
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

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );
    });

    it('maps permission caveats to the proper format', async () => {
      const initialPermissions = {
        snap_getBip32Entropy: [
          { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        ],
      };

      const manifest = {
        ...getSnapManifest(),
        initialPermissions,
      };

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      const callActionMock = jest.spyOn(messenger, 'call');

      jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return getPersistedSnapObject({ manifest });
        });

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      expect(callActionMock).toHaveBeenNthCalledWith(
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

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: {
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
      const { manifest } = MOCK_KEYRING_SNAP;

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      const callActionMock = jest.spyOn(messenger, 'call');

      jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return getPersistedSnapObject({ manifest });
        });

      await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      const caveat = {
        type: SnapCaveatType.SnapKeyring,
        value: { namespaces: MOCK_NAMESPACES },
      };

      expect(callActionMock).toHaveBeenNthCalledWith(
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

      expect(callActionMock).toHaveBeenNthCalledWith(
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
        snap_getBip32Entropy: [
          { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        ],
      };

      const manifest = {
        ...getSnapManifest({ version: '1.1.0' }),
        initialPermissions,
      };

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
          },
        }),
      );

      const callActionMock = jest.spyOn(messenger, 'call');

      callActionMock.mockImplementation((method, ...args) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as any).requestData;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return getPersistedSnapObject({ manifest });
        });

      await snapController.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: {
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

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          }
          return false;
        });

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [snapId]: {},
      });

      expect(result).toStrictEqual({
        [snapId]: { error: expect.any(EthereumRpcError) },
      });
      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        expect.anything(),
      );
    });

    it('updates a snap', async () => {
      const newVersion = '1.0.2';
      const newVersionRange = '>=1.0.1';

      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      const fetchSnapMock = jest
        .spyOn(controller as any, '_fetchSnap')
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest(),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }))
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest({ version: newVersion }),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }));

      await controller.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await controller.stopSnap(MOCK_SNAP_ID);

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method, ...args) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'ApprovalController:addRequest') {
            return (args[0] as any).requestData;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(12);
      expect(callActionMock).toHaveBeenNthCalledWith(
        7,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        expect.anything(),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        8,
        'PermissionController:getPermissions',
        MOCK_SNAP_ID,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
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
            permissions: getSnapManifest().initialPermissions,
            snapId: MOCK_SNAP_ID,
            newVersion,
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        10,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: getSnapManifest().initialPermissions,
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            snapId: MOCK_SNAP_ID,
            newVersion,
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        11,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        12,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(2);
      expect(fetchSnapMock).toHaveBeenNthCalledWith(
        2,
        MOCK_SNAP_ID,
        newVersionRange,
      );

      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: getTruncatedSnap({ version: newVersion }),
      });
    });

    it("returns an error when didn't update", async () => {
      // Scenario: a newer version is installed compared to requested version range
      const newVersion = '0.9.0';
      const newVersionRange = '^0.9.0';

      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      await controller.add({
        id: MOCK_SNAP_ID,
        manifest: getSnapManifest(),
        origin: MOCK_ORIGIN,
        sourceCode: DEFAULT_SNAP_BUNDLE,
      });

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(controller as any, '_fetchSnap')
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest({ version: newVersion }),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }));

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        expect.anything(),
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(MOCK_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: { error: expect.any(EthereumRpcError) },
      });
    });

    it('returns an error when a throw happens inside an update', async () => {
      // Scenario: fetch fails
      const newVersionRange = '^1.0.1';

      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      await controller.add({
        id: MOCK_SNAP_ID,
        manifest: getSnapManifest(),
        origin: MOCK_ORIGIN,
        sourceCode: DEFAULT_SNAP_BUNDLE,
      });

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(controller as any, '_fetchSnap')
        .mockImplementationOnce(async () => {
          throw new Error('foo');
        });

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        expect.anything(),
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(MOCK_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: { error: expect.anything() },
      });
    });
  });

  describe('updateSnap', () => {
    it('throws an error on invalid snap id', async () => {
      await expect(() =>
        getSnapController().updateSnap(MOCK_ORIGIN, 'local:foo'),
      ).rejects.toThrow('Snap "local:foo" not found');
    });

    it('throws an error if the specified SemVer range is invalid', async () => {
      const controller = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
          },
        }),
      );

      await expect(
        controller.updateSnap(
          MOCK_ORIGIN,
          MOCK_SNAP_ID,
          'this is not a version',
        ),
      ).rejects.toThrow('Received invalid snap version range');
    });

    it('throws an error if the new version of the snap is blocked', async () => {
      const checkBlockListSpy = jest.fn();
      const controller = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
          },
        }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

      checkBlockListSpy.mockResolvedValueOnce({
        [MOCK_SNAP_ID]: { blocked: true },
      });

      await expect(
        controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID),
      ).rejects.toThrow('Cannot install version "1.1.0" of snap');
    });

    it('does not update on older snap version downloaded', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '0.9.0',
        };
        return {
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

      const snap = await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        manifest: getSnapManifest(),
      });

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toBeNull();
      expect(newSnap?.version).toStrictEqual(snap.version);
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(onSnapUpdated).not.toHaveBeenCalled();
      expect(onSnapAdded).not.toHaveBeenCalled();
    });

    it('updates a snap', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      fetchSnapSpy
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest(),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }))
        .mockImplementationOnce(async () => {
          const manifest: SnapManifest = {
            ...getSnapManifest(),
            version: '1.1.0',
          };
          return {
            manifest,
            sourceCode: DEFAULT_SNAP_BUNDLE,
          };
        });

      callActionSpy.mockImplementation((method, ...args) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as any).requestData;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      await controller.installSnaps(MOCK_ORIGIN, { [MOCK_SNAP_ID]: {} });
      await controller.stopSnap(MOCK_SNAP_ID);

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      const newSnapTruncated = controller.getTruncated(MOCK_SNAP_ID);

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toStrictEqual(newSnapTruncated);
      expect(newSnap?.version).toStrictEqual('1.1.0');
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
      expect(fetchSnapSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenCalledTimes(11);
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
            permissions: getSnapManifest().initialPermissions,
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        9,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: getSnapManifest().initialPermissions,
          subject: { origin: MOCK_SNAP_ID },
          requestData: {
            metadata: {
              id: expect.any(String),
              dappOrigin: MOCK_ORIGIN,
              origin: MOCK_SNAP_ID,
            },
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        10,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        11,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );

      expect(onSnapUpdated).toHaveBeenCalledTimes(1);
      expect(onSnapAdded).toHaveBeenCalledTimes(1);
    });

    it('stops and restarts a running snap during an update', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

      callActionSpy.mockImplementation((method, ...args) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as any).requestData;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        manifest: getSnapManifest(),
      });

      await controller.startSnap(MOCK_SNAP_ID);

      const startSnapSpy = jest.spyOn(controller as any, '_startSnap');
      const stopSnapSpy = jest.spyOn(controller as any, 'stopSnap');

      await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      const isRunning = controller.isRunning(MOCK_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(8);

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
            permissions: getSnapManifest().initialPermissions,
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
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
        8,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        SnapEndowments.LongRunning,
      );
      expect(isRunning).toStrictEqual(true);
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
      expect(startSnapSpy).toHaveBeenCalledTimes(1);
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('returns null on update request denied', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: DEFAULT_SNAP_BUNDLE,
        };
      });

      callActionSpy.mockImplementation((method) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        } else if (method === 'ApprovalController:addRequest') {
          throw ethErrors.provider.userRejectedRequest();
        }
        return false;
      });

      await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: DEFAULT_SNAP_BUNDLE,
        manifest: getSnapManifest(),
      });

      await expect(
        controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID),
      ).rejects.toThrow('User rejected the request.');

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(newSnap?.version).toStrictEqual('1.0.0');
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
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
            permissions: getSnapManifest().initialPermissions,
            snapId: MOCK_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: getSnapManifest().initialPermissions,
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
      );
    });

    it('requests approval for new and already approved permissions and revoke unused permissions', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

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

      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest({ initialPermissions }),
          sourceCode: DEFAULT_SNAP_BUNDLE,
        }))
        .mockImplementationOnce(async () => {
          const manifest: SnapManifest = getSnapManifest({
            version: '1.1.0',
            initialPermissions: {
              snap_confirm: {},
              'endowment:network-access': {},
            },
          });
          return {
            manifest,
            sourceCode: DEFAULT_SNAP_BUNDLE,
          };
        });

      callActionSpy.mockImplementation((method, ...args) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          return (args[0] as any).requestData;
        } else if (method === 'PermissionController:getPermissions') {
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

      await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(2);
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
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
        }),
      );

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

      const fetchSnapSpy = jest.spyOn(snapController as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy
        .mockImplementationOnce(async () => {
          return {
            manifest: getSnapManifest({ initialPermissions }),
            sourceCode: DEFAULT_SNAP_BUNDLE,
          };
        })
        .mockImplementationOnce(async () => {
          const manifest: SnapManifest = getSnapManifest({
            version: '1.1.0',
            initialPermissions: {
              snap_confirm: {},
              'endowment:network-access': {},
            },
          });
          return {
            manifest,
            sourceCode: DEFAULT_SNAP_BUNDLE,
          };
        });

      callActionSpy.mockImplementation((method, request: any) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'ApprovalController:addRequest') {
          // eslint-disable-next-line jest/no-conditional-expect
          expect(request.id).toBe(request.requestData.metadata.id);
          return request.requestData;
        } else if (method === 'PermissionController:getPermissions') {
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
      await snapController.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);
    });
  });

  describe('_fetchSnap', () => {
    it('can fetch NPM snaps', async () => {
      const controller = getSnapController();

      const result = await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
      });
      expect(result).toStrictEqual(
        getPersistedSnapObject({
          status: SnapStatus.Installing,
        }),
      );
    });

    it('can fetch local snaps', async () => {
      const controller = getSnapController();

      fetchMock
        .mockResponseOnce(JSON.stringify(getSnapManifest()))
        .mockResponseOnce(DEFAULT_SNAP_BUNDLE);

      const id = 'local:https://localhost:8081';
      const result = await controller.add({
        origin: MOCK_ORIGIN,
        id,
      });
      // Fetch is called 3 times, for fetching the manifest, the sourcecode and icon (icon just has the default response for now)
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(result).toStrictEqual(
        getPersistedSnapObject({
          id,
          status: SnapStatus.Installing,
          permissionName: 'wallet_snap_local:https://localhost:8081',
        }),
      );
    });
  });

  describe('enableSnap', () => {
    it('enables a disabled snap', () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject({ enabled: false }),
            },
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

    it('throws an error if the specified snap is blocked', async () => {
      const snapController = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject({
                enabled: false,
                blocked: true,
              }),
            },
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
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
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
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
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

    it('throws an error if the specified snap does not exist', () => {
      const snapController = getSnapController();
      expect(() => snapController.disableSnap(MOCK_SNAP_ID)).toThrow(
        `Snap "${MOCK_SNAP_ID}" not found.`,
      );
    });
  });

  describe('isBlocked', () => {
    it('returns whether a version of a snap is blocked', async () => {
      const checkBlockListSpy = jest.fn();
      const snapId = 'npm:example';
      const version = '1.0.0';
      const shasum = 'source-shasum';

      const snapController = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
        }),
      );

      checkBlockListSpy.mockResolvedValueOnce({
        [snapId]: { blocked: false },
      });

      expect(
        await snapController.isBlocked(snapId, {
          version,
          shasum,
        }),
      ).toBe(false);

      checkBlockListSpy.mockResolvedValueOnce({
        [snapId]: { blocked: true },
      });

      expect(
        await snapController.isBlocked(snapId, {
          version,
          shasum,
        }),
      ).toBe(true);

      expect(checkBlockListSpy).toHaveBeenCalledWith({
        [snapId]: {
          version,
          shasum,
        },
      });
    });
  });

  describe('updateBlockedSnaps', () => {
    it('blocks snaps as expected', async () => {
      const messenger = getSnapControllerMessenger();
      const publishMock = jest.spyOn(messenger, 'publish');

      const checkBlockListSpy = jest.fn();

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
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [mockSnapA.id]: mockSnapA.stateObject,
              [mockSnapB.id]: mockSnapB.stateObject,
            },
          },
        }),
      );

      const reason = 'foo';
      const infoUrl = 'foobar.com';
      // Block snap A, ignore B.
      checkBlockListSpy.mockResolvedValueOnce({
        [mockSnapA.id]: { blocked: true, reason, infoUrl },
      });
      await snapController.updateBlockedSnaps();

      // Ensure that CheckSnapBlockListArg is correct
      expect(checkBlockListSpy).toHaveBeenCalledWith({
        [mockSnapA.id]: {
          version: mockSnapA.manifest.version,
          shasum: mockSnapA.manifest.source.shasum,
        },
        [mockSnapB.id]: {
          version: mockSnapB.manifest.version,
          shasum: mockSnapB.manifest.source.shasum,
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
          reason,
        },
      );
    });

    it('stops running snaps when they are blocked', async () => {
      const checkBlockListSpy = jest.fn();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [mockSnap.id]: mockSnap.stateObject,
            },
          },
        }),
      );

      await snapController.startSnap(mockSnap.id);

      // Block the snap
      checkBlockListSpy.mockResolvedValueOnce({
        [mockSnap.id]: { blocked: true },
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

      const checkBlockListSpy = jest.fn();

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
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [mockSnapA.id]: mockSnapA.stateObject,
              [mockSnapB.id]: mockSnapB.stateObject,
            },
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
      checkBlockListSpy.mockResolvedValueOnce({
        [mockSnapA.id]: { blocked: false },
        [mockSnapB.id]: { blocked: false },
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
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const checkBlockListSpy = jest.fn();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [mockSnap.id]: mockSnap.stateObject,
            },
          },
        }),
      );

      // Block the snap
      let resolveBlockListPromise: any;
      checkBlockListSpy.mockReturnValueOnce(
        new Promise<unknown>((resolve) => (resolveBlockListPromise = resolve)),
      );

      const updateBlockList = snapController.updateBlockedSnaps();

      // Remove the snap while waiting for the blocklist
      snapController.removeSnap(mockSnap.id);

      // Resolve the blocklist and wait for the call to complete
      resolveBlockListPromise({
        [mockSnap.id]: { blocked: true },
      });
      await updateBlockList;

      // The snap was removed, no errors were thrown
      expect(snapController.has(mockSnap.id)).toBe(false);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('logs but does not throw unexpected errors while blocking', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error');
      const checkBlockListSpy = jest.fn();

      const mockSnap = getMockSnapData({
        id: 'npm:example',
        origin: 'foo.com',
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
          state: {
            snaps: {
              [mockSnap.id]: mockSnap.stateObject,
            },
          },
        }),
      );

      await snapController.startSnap(mockSnap.id);

      jest.spyOn(snapController, 'stopSnap').mockImplementationOnce(() => {
        throw new Error('foo');
      });

      // Block the snap
      checkBlockListSpy.mockResolvedValueOnce({
        [mockSnap.id]: { blocked: true },
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

  describe('SnapController actions', () => {
    describe('SnapController:add', () => {
      it('adds a snap to state', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
          }),
        );

        const fooSnapObject = getPersistedSnapObject();

        const addSpy = jest.spyOn(snapController, 'add');
        const fetchSnapMock = jest
          .spyOn(snapController as any, '_fetchSnap')
          .mockImplementationOnce(() => {
            return {
              ...fooSnapObject,
            };
          });

        await messenger.call('SnapController:add', {
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
        });

        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(fetchSnapMock).toHaveBeenCalledTimes(1);
        expect(Object.keys(snapController.state.snaps)).toHaveLength(1);
        expect(snapController.state.snaps[MOCK_SNAP_ID]).toMatchObject(
          getSnapObject({ status: SnapStatus.Installing }),
        );
      });
    });

    describe('SnapController:get', () => {
      it('gets a snap', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [MOCK_SNAP_ID]: getPersistedSnapObject(),
              },
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
        const messenger = getSnapControllerMessenger(undefined, false);

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [MOCK_SNAP_ID]: getPersistedSnapObject(),
              },
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
        ).toStrictEqual(true);
        expect(handleRpcRequestSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('handles a transaction insight request', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject(),
            },
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
      ).toStrictEqual(true);
      expect(handleRpcRequestSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SnapController:getSnapState', () => {
    it(`gets the snap's state`, async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const state = {
        fizz: 'buzz',
      };
      const encrypted = await passworder.encrypt(
        'stateEncryption:npm:fooSnap',
        state,
      );
      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snapStates: {
              'npm:fooSnap': encrypted,
            },
          },
        }),
      );

      const getSnapStateSpy = jest.spyOn(snapController, 'getSnapState');
      const result = await messenger.call(
        'SnapController:getSnapState',
        'npm:fooSnap',
      );

      expect(getSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(state);
    });

    it('throws custom error message in case decryption fails', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snapStates: { [MOCK_SNAP_ID]: 'foo' },
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject({
                status: SnapStatus.Installing,
              }),
            },
          },
        }),
      );

      const getSnapStateSpy = jest.spyOn(snapController, 'getSnapState');
      await expect(
        messenger.call('SnapController:getSnapState', MOCK_SNAP_ID),
      ).rejects.toThrow(
        'Failed to decrypt snap state, the state must be corrupted.',
      );
      expect(getSnapStateSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('SnapController:has', () => {
    it('checks if a snap exists in state', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              'npm:fooSnap': getPersistedSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: DEFAULT_SNAP_BUNDLE,
                id: 'npm:fooSnap',
                manifest: getSnapManifest(),
                enabled: true,
                status: SnapStatus.Installing,
              }),
            },
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
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              'npm:fooSnap': getPersistedSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: DEFAULT_SNAP_BUNDLE,
                id: 'npm:fooSnap',
                manifest: getSnapManifest(),
                enabled: true,
                status: SnapStatus.Installing,
              }),
            },
          },
        }),
      );

      const updateSnapStateSpy = jest.spyOn(snapController, 'updateSnapState');
      const state = {
        bar: 'baz',
      };
      await messenger.call(
        'SnapController:updateSnapState',
        'npm:fooSnap',
        state,
      );

      expect(updateSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(snapController.state.snapStates).toStrictEqual({
        'npm:fooSnap': await passworder.encrypt(
          'stateEncryption:npm:fooSnap',
          state,
        ),
      });
    });

    it('has different encryption for the same data stored by two different snaps', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snaps: {
              'npm:fooSnap': getPersistedSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: DEFAULT_SNAP_BUNDLE,
                id: 'npm:fooSnap',
                manifest: getSnapManifest(),
                enabled: true,
                status: SnapStatus.Installing,
              }),
              'npm:fooSnap2': getPersistedSnapObject({
                permissionName: 'fooperm2',
                version: '0.0.1',
                sourceCode: DEFAULT_SNAP_BUNDLE,
                id: 'npm:fooSnap2',
                manifest: getSnapManifest(),
                enabled: true,
                status: SnapStatus.Installing,
              }),
            },
          },
        }),
      );

      const updateSnapStateSpy = jest.spyOn(snapController, 'updateSnapState');
      const state = {
        bar: 'baz',
      };
      await messenger.call(
        'SnapController:updateSnapState',
        'npm:fooSnap',
        state,
      );

      await messenger.call(
        'SnapController:updateSnapState',
        'npm:fooSnap2',
        state,
      );

      expect(updateSnapStateSpy).toHaveBeenCalledTimes(2);
      expect(snapController.state.snapStates).toStrictEqual({
        'npm:fooSnap': await passworder.encrypt(
          'stateEncryption:npm:fooSnap',
          state,
        ),
        'npm:fooSnap2': await passworder.encrypt(
          'stateEncryption:npm:fooSnap2',
          state,
        ),
      });

      expect(snapController.state.snapStates['npm:fooSnap']).not.toStrictEqual(
        snapController.state.snapStates['npm:fooSnap2'],
      );
    });
  });

  describe('SnapController:clearSnapState', () => {
    it('clears the state of a snap', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snapStates: { [MOCK_SNAP_ID]: 'foo' },
            snaps: {
              [MOCK_SNAP_ID]: getPersistedSnapObject({
                status: SnapStatus.Installing,
              }),
            },
          },
        }),
      );

      const clearSnapStateSpy = jest.spyOn(snapController, 'clearSnapState');
      await messenger.call('SnapController:clearSnapState', MOCK_SNAP_ID);
      const clearedState = await messenger.call(
        'SnapController:getSnapState',
        MOCK_SNAP_ID,
      );
      expect(clearSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(snapController.state.snapStates).toStrictEqual({});
      expect(clearedState).toBeNull();
    });
  });

  describe('SnapController:updateBlockedSnaps', () => {
    it('calls SnapController.updateBlockedSnaps()', async () => {
      const messenger = getSnapControllerMessenger(undefined, false);
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
      it('calls SnapController.enableSnap()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: false,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [mockSnap.id]: mockSnap.stateObject,
              },
            },
          }),
        );

        await messenger.call('SnapController:enable', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id].enabled).toBe(true);
      });
    });

    describe('SnapController:disable', () => {
      it('calls SnapController.disableSnap()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: true,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [mockSnap.id]: mockSnap.stateObject,
              },
            },
          }),
        );

        await messenger.call('SnapController:disable', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id].enabled).toBe(false);
      });
    });

    describe('SnapController:remove', () => {
      it('calls SnapController.removeSnap()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const mockSnap = getMockSnapData({
          id: 'npm:example',
          origin: 'foo.com',
          enabled: true,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [mockSnap.id]: mockSnap.stateObject,
              },
            },
          }),
        );

        const originalCall = messenger.call.bind(messenger);

        jest.spyOn(messenger, 'call').mockImplementation((method, ...args) => {
          // Mock out permission requests
          if (
            method === 'PermissionController:hasPermissions' ||
            method === 'PermissionController:revokeAllPermissions' ||
            method === 'PermissionController:revokePermissionForAllSubjects'
          ) {
            return true;
          }
          return originalCall(method, ...args);
        });

        await messenger.call('SnapController:remove', mockSnap.id);
        expect(snapController.state.snaps[mockSnap.id]).toBeUndefined();
      });
    });

    describe('SnapController:getPermitted', () => {
      it('calls SnapController.getPermittedSnaps()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const mockSnap = getMockSnapData({
          id: MOCK_SNAP_ID,
          origin: MOCK_ORIGIN,
        });

        const originalCall = messenger.call.bind(messenger);

        jest.spyOn(messenger, 'call').mockImplementation((method, ...args) => {
          if (method === 'PermissionController:getPermissions') {
            return {
              [`wallet_snap_${MOCK_SNAP_ID}`]: {
                caveats: null,
                date: 1661166080905,
                id: 'VyAsBJiDDKawv_XlNcm13',
                invoker: 'https://metamask.github.io',
                parentCapability: `wallet_snap_${MOCK_SNAP_ID}`,
              },
            };
          }
          return originalCall(method, ...args);
        });

        getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [mockSnap.id]: mockSnap.stateObject,
              },
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
      it('calls SnapController.getAllSnaps()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const mockSnap = getMockSnapData({
          id: MOCK_SNAP_ID,
          origin: MOCK_ORIGIN,
        });

        getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                [mockSnap.id]: mockSnap.stateObject,
              },
            },
          }),
        );

        const result = await messenger.call('SnapController:getAll');
        expect(result).toStrictEqual([getTruncatedSnap()]);
      });
    });

    describe('SnapController:install', () => {
      it('calls SnapController.installSnaps()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
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
      it('calls SnapController.removeSnapError()', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
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

        await messenger.call('SnapController:removeSnapError', 'foo');
        expect(snapController.state.snapErrors.foo).toBeUndefined();
      });
    });
  });
});
