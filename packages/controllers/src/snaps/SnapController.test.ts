import fs from 'fs';
import { getPersistentState, Json } from '@metamask/controllers';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { serializeError } from 'eth-rpc-errors';
import { ExecutionService } from '../services/ExecutionService';
import { WebWorkerExecutionService } from '../services/WebWorkerExecutionService';
import { SnapManifest } from './json-schemas';
import {
  AllowedActions,
  AllowedEvents,
  Snap,
  SnapController,
  SnapControllerActions,
  SnapControllerEvents,
  SnapControllerState,
  SnapStatus,
  TruncatedSnap,
} from './SnapController';
import { getSnapSourceShasum } from './utils';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/SnapWorker.js'),
  'utf8',
);

const getControllerMessenger = () =>
  new ControllerMessenger<
    SnapControllerActions | AllowedActions,
    SnapControllerEvents | AllowedEvents
  >();

const getSnapControllerMessenger = (
  messenger?: ReturnType<typeof getControllerMessenger>,
) =>
  (messenger ?? getControllerMessenger()).getRestricted<
    'SnapController',
    SnapControllerActions['type'] | AllowedActions['type'],
    SnapControllerEvents['type'] | AllowedEvents['type']
  >({
    name: 'SnapController',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:unresponsive',
      'SnapController:snapAdded',
      'SnapController:snapInstalled',
      'SnapController:snapRemoved',
      'SnapController:stateChange',
    ],
    allowedActions: [
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:getPermissions',
      'PermissionController:requestPermissions',
      'PermissionController:revokeAllPermissions',
      'SnapController:add',
      'SnapController:get',
      'SnapController:getRpcMessageHandler',
      'SnapController:getSnapState',
      'SnapController:has',
      'SnapController:updateSnapState',
    ],
  });

const getWebWorkerEESMessenger = (
  messenger?: ReturnType<typeof getControllerMessenger>,
) =>
  (messenger ?? getControllerMessenger()).getRestricted({
    name: 'ExecutionService',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:unresponsive',
    ],
  });

type SnapControllerConstructorParams = ConstructorParameters<
  typeof SnapController
>[0];

const getSnapControllerOptions = (
  opts?: Partial<SnapControllerConstructorParams>,
) => {
  return {
    terminateAllSnaps: jest.fn(),
    terminateSnap: jest.fn(),
    executeSnap: jest.fn(),
    endowmentPermissionNames: [],
    getRpcMessageHandler: jest.fn(),
    removeAllPermissionsFor: jest.fn(),
    getPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    closeAllConnections: jest.fn(),
    messenger: getSnapControllerMessenger(),
    state: undefined,
    ...opts,
  } as SnapControllerConstructorParams;
};

type SnapControllerWithEESConstructorParams = Omit<
  SnapControllerConstructorParams,
  'terminateAllSnaps' | 'terminateSnap' | 'executeSnap' | 'getRpcMessageHandler'
>;

const getSnapControllerWithEESOptions = (
  opts?: Partial<SnapControllerWithEESConstructorParams>,
) => {
  return {
    endowmentPermissionNames: [],
    removeAllPermissionsFor: jest.fn(),
    getPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    closeAllConnections: jest.fn(),
    messenger: getSnapControllerMessenger(),
    state: undefined,
    ...opts,
  } as SnapControllerWithEESConstructorParams;
};

const getSnapController = (options = getSnapControllerOptions()) => {
  return new SnapController(options);
};

const getWebWorkerEES = (
  messenger: ReturnType<typeof getSnapControllerMessenger>,
) =>
  new WebWorkerExecutionService({
    messenger,
    setupSnapProvider: jest.fn(),
    workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
  });

class ExecutionEnvironmentStub implements ExecutionService {
  async terminateAllSnaps() {
    // empty stub
  }

  async getRpcMessageHandler() {
    return (_: any, request: Record<string, unknown>) => {
      return new Promise((resolve) => {
        const results = `${request.method}${request.id}`;
        resolve(results);
      });
    };
  }

  async executeSnap() {
    return 'some-unique-id';
  }

  async terminateSnap() {
    // empty stub
  }
}

const getSnapControllerWithEES = (
  options = getSnapControllerWithEESOptions(),
  service?: ReturnType<typeof getWebWorkerEES>,
) => {
  const { messenger } = options;
  const _service = service || getWebWorkerEES(messenger);
  const controller = new SnapController({
    terminateAllSnaps: _service.terminateAllSnaps.bind(_service),
    terminateSnap: _service.terminateSnap.bind(_service),
    executeSnap: _service.executeSnap.bind(_service),
    getRpcMessageHandler: _service.getRpcMessageHandler.bind(_service),
    ...options,
  });
  return [controller, _service] as const;
};

const FAKE_SNAP_ID = 'npm:example-snap';
const FAKE_SNAP_SOURCE_CODE = `
wallet.registerRpcMessageHandler(async (origin, request) => {
  const {method, params, id} = request;
  return method + id;
});
`;
const FAKE_SNAP_SHASUM = getSnapSourceShasum(FAKE_SNAP_SOURCE_CODE);

const getSnapManifest = ({
  version = '1.0.0',
  proposedName = 'ExampleSnap',
  description = 'arbitraryDescription',
  filePath = 'dist/bundle.js',
  iconPath = 'images/icon.svg',
  packageName = 'example-snap',
  initialPermissions = {},
  shasum = FAKE_SNAP_SHASUM,
}: Pick<Partial<SnapManifest>, 'version' | 'proposedName' | 'description'> & {
  filePath?: string;
  iconPath?: string;
  initialPermissions?: Record<string, Record<string, Json>>;
  packageName?: string;
  shasum?: string;
} = {}) => {
  return {
    version,
    proposedName,
    description,
    repository: {
      type: 'git',
      url: 'https://github.com/example-snap',
    },
    source: {
      shasum,
      location: {
        npm: {
          filePath,
          iconPath,
          packageName,
          registry: 'https://registry.npmjs.org',
        },
      },
    },
    initialPermissions,
    manifestVersion: '0.1',
  } as const;
};

const getSnapObject = ({
  initialPermissions = {},
  id = FAKE_SNAP_ID,
  permissionName = `wallet_snap_${FAKE_SNAP_ID}`,
  version = '1.0.0',
  manifest = getSnapManifest({ shasum: FAKE_SNAP_SHASUM }),
  status = SnapStatus.stopped,
  enabled = true,
  sourceCode = FAKE_SNAP_SOURCE_CODE,
} = {}): Snap => {
  return {
    initialPermissions,
    id,
    permissionName,
    version,
    manifest,
    status,
    enabled,
    sourceCode,
  } as const;
};

const getTruncatedSnap = ({
  initialPermissions = {},
  id = FAKE_SNAP_ID,
  permissionName = `wallet_snap_${FAKE_SNAP_ID}`,
  version = '1.0.0',
} = {}): TruncatedSnap => {
  return {
    initialPermissions,
    id,
    permissionName,
    version,
  } as const;
};

/**
 * Note that fake timers cannot be used in these tests because of the Electron
 * environment we use.
 */
describe('SnapController', () => {
  it('should create a snap controller and execution service', async () => {
    const [snapController, service] = getSnapControllerWithEES();
    expect(service).toBeDefined();
    expect(snapController).toBeDefined();
    snapController.destroy();
  });

  it('should create a worker and snap controller and add a snap and update its state', async () => {
    const [snapController] = getSnapControllerWithEES();

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    await snapController.startSnap(snap.id);
    await snapController.updateSnapState(snap.id, { hello: 'world' });
    const snapState = await snapController.getSnapState(snap.id);
    expect(snapState).toStrictEqual({ hello: 'world' });
    expect(snapController.state.snapStates).toStrictEqual({
      'npm:example-snap': {
        hello: 'world',
      },
    });
    snapController.destroy();
  });

  it('should add a snap and use its JSON-RPC api with a WebWorkerExecutionService', async () => {
    const [snapController] = getSnapControllerWithEES();

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    await snapController.startSnap(snap.id);
    const handle = await snapController.getRpcMessageHandler(snap.id);
    if (!handle) {
      throw Error('rpc handler not found');
    }

    const result = await handle('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    expect(result).toStrictEqual('test1');
    snapController.destroy();
  });

  it('should add a snap and use its JSON-RPC api', async () => {
    const executionEnvironmentStub =
      new ExecutionEnvironmentStub() as unknown as WebWorkerExecutionService;

    const [snapController] = getSnapControllerWithEES(
      undefined,
      executionEnvironmentStub,
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    await snapController.startSnap(snap.id);
    const handle = await snapController.getRpcMessageHandler(snap.id);
    if (!handle) {
      throw Error('rpc handler not found');
    }

    const result = await handle('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    expect(result).toStrictEqual('test1');
    snapController.destroy();
  });

  it('should pass endowments to a snap when executing it', async () => {
    const executeSnapMock = jest.fn();
    const messenger = getSnapControllerMessenger();
    const callActionMock = jest.spyOn(messenger, 'call');

    const snapController = getSnapController(
      getSnapControllerOptions({
        endowmentPermissionNames: ['endowment:foo'],
        executeSnap: executeSnapMock,
        messenger,
      }),
    );

    const sourceCode = `console.log('Hello, world!');`;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    callActionMock
      .mockImplementationOnce(() => true) // hasPermission
      .mockImplementationOnce(async () => ['fooEndowment']); // getEndowments

    await snapController.startSnap(snap.id);

    expect(callActionMock).toHaveBeenCalledTimes(2);
    expect(callActionMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      'npm:example-snap',
      'endowment:foo',
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      2,
      'PermissionController:getEndowments',
      'npm:example-snap',
      'endowment:foo',
    );

    expect(executeSnapMock).toHaveBeenCalledTimes(1);
    expect(executeSnapMock).toHaveBeenNthCalledWith(1, {
      snapId: 'npm:example-snap',
      sourceCode,
      endowments: ['fooEndowment'],
    });
    snapController.destroy();
  });

  it('errors if attempting to start a snap that was already started', async () => {
    const id = 'npm:example-snap';
    const sourceCode = 'foo';
    const manifest = getSnapManifest({
      version: '1.0.0',
      initialPermissions: { eth_accounts: {} },
      shasum: getSnapSourceShasum(sourceCode),
    });

    const mockExecuteSnap = jest.fn();

    const snapController = getSnapController(
      getSnapControllerOptions({ executeSnap: mockExecuteSnap }),
    );

    await snapController.add({ id, manifest, sourceCode });
    await snapController.startSnap(id);
    await expect(snapController.startSnap(id)).rejects.toThrow(
      /^Snap "npm:example-snap" is already started.$/u,
    );
    expect(mockExecuteSnap).toHaveBeenCalledTimes(1);
    expect(mockExecuteSnap).toHaveBeenCalledWith({
      snapId: id,
      sourceCode,
    });
  });

  it('should not delete existing snaps when using runExistinSnaps with a hydrated state', async () => {
    const mockExecuteSnap = jest.fn();

    const sourceCode = 'console.log("foo");';

    const firstSnapController = getSnapController(
      getSnapControllerOptions({
        executeSnap: mockExecuteSnap,
        state: {
          snapErrors: {},
          snapStates: {},
          snaps: {
            'npm:foo': {
              initialPermissions: {},
              permissionName: 'fooperm',
              version: '0.0.1',
              sourceCode,
              id: 'npm:foo',
              manifest: getSnapManifest({
                shasum: getSnapSourceShasum(sourceCode),
              }),
              enabled: true,
              status: SnapStatus.installing,
            },
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
        executeSnap: mockExecuteSnap,
        state: persistedState as unknown as SnapControllerState,
      }),
    );

    expect(secondSnapController.isRunning('npm:foo')).toStrictEqual(false);
    await secondSnapController.startSnap('npm:foo');

    expect(secondSnapController.state.snaps['npm:foo']).toBeDefined();
    expect(secondSnapController.isRunning('npm:foo')).toStrictEqual(true);
    firstSnapController.destroy();
    secondSnapController.destroy();
  });

  it('should add errors to the SnapControllers state', async () => {
    const executionEnvironmentStub =
      new ExecutionEnvironmentStub() as unknown as WebWorkerExecutionService;

    const [snapController] = getSnapControllerWithEES(
      undefined,
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

  it('should handle an error event on the controller messenger', async () => {
    const controllerMessenger = getControllerMessenger();

    const serviceMessenger = controllerMessenger.getRestricted({
      name: 'ExecutionService',
      allowedEvents: [
        'ExecutionService:unhandledError',
        'ExecutionService:unresponsive',
      ],
    });

    const snapControllerMessenger = controllerMessenger.getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ExecutionService:unhandledError',
        'ExecutionService:unresponsive',
      ],
      allowedActions: [
        'PermissionController:getEndowments',
        'PermissionController:hasPermission',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionService({
      messenger: serviceMessenger,
      setupSnapProvider: jest.fn(),
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });

    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({ messenger: snapControllerMessenger }),
      workerExecutionEnvironment,
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });
    await snapController.startSnap(snap.id);

    // defer
    setTimeout(() => {
      controllerMessenger.publish('ExecutionService:unhandledError', snap.id, {
        message: 'foo',
        code: 123,
      });
    }, 1);

    await new Promise((resolve) => {
      snapControllerMessenger.subscribe(
        'ExecutionService:unhandledError',
        () => {
          const localSnap = snapController.get(snap.id);
          expect(localSnap.status).toStrictEqual('crashed');
          resolve(undefined);
          snapController.destroy();
        },
      );
    });
  });

  it('should handle an unresponsive event on the controller messenger', async () => {
    const controllerMessenger = getControllerMessenger();
    const serviceMessenger = getWebWorkerEESMessenger(controllerMessenger);
    const snapControllerMessenger =
      getSnapControllerMessenger(controllerMessenger);

    const workerExecutionEnvironment = getWebWorkerEES(serviceMessenger);
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({ messenger: snapControllerMessenger }),
      workerExecutionEnvironment,
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });
    await snapController.startSnap(snap.id);

    // defer
    setTimeout(() => {
      controllerMessenger.publish('ExecutionService:unresponsive', snap.id);
    }, 1);

    await new Promise((resolve) => {
      controllerMessenger.subscribe(
        'ExecutionService:unresponsive',
        async (snapId: string) => {
          const localSnap = snapController.get(snapId);
          expect(localSnap.status).toStrictEqual('crashed');
          resolve(undefined);
          snapController.destroy();
        },
      );
    });
  });

  it('should add a snap and use its JSON-RPC api and then get stopped from idling too long', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 50,
        maxIdleTime: 100,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });
    await snapController.startSnap(snap.id);

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 300);
    });

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');
    snapController.destroy();
  });

  it('should add a snap and see its status', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    snapController.destroy();
  });

  it('should add a snap and stop it and have it start on-demand', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    const results = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    expect(results).toStrictEqual('test1');

    snapController.destroy();
  });

  it('should install a Snap via installSnaps', async () => {
    const executeSnapMock = jest.fn();
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        executeSnap: executeSnapMock,
        messenger,
      }),
    );

    const origin = 'foo.com';

    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true);
    jest.spyOn(messenger, 'publish');

    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: getSnapManifest(),
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

    const eventSubscriptionPromise = Promise.all([
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapAdded', (snapId, snap) => {
          expect(snapId).toStrictEqual(FAKE_SNAP_ID);
          expect(snap).toStrictEqual(
            getSnapObject({ status: SnapStatus.installing }),
          );
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapInstalled', (snapId) => {
          expect(snapId).toStrictEqual(FAKE_SNAP_ID);
          resolve();
        });
      }),
    ]);

    const expectedSnapObject = getTruncatedSnap();

    expect(
      await snapController.installSnaps(origin, {
        [FAKE_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [FAKE_SNAP_ID]: expectedSnapObject,
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(1);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      origin,
      expectedSnapObject.permissionName,
    );

    await eventSubscriptionPromise;
  });

  it('should remove a Snap that errors during installation after being added', async () => {
    const executeSnapMock = jest.fn();
    const messenger = getSnapControllerMessenger();
    const snapController = getSnapController(
      getSnapControllerOptions({
        executeSnap: executeSnapMock,
        messenger,
      }),
    );

    const origin = 'foo.com';

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
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

    jest
      .spyOn(snapController as any, 'authorize')
      .mockImplementationOnce(() => {
        throw new Error('foo');
      });

    const eventSubscriptionPromise = Promise.all([
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapAdded', (snapId, snap) => {
          expect(snapId).toStrictEqual(FAKE_SNAP_ID);
          expect(snap).toStrictEqual(
            getSnapObject({ status: SnapStatus.installing }),
          );
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapRemoved', (snapId) => {
          expect(snapId).toStrictEqual(FAKE_SNAP_ID);
          resolve();
        });
      }),
    ]);

    const expectedSnapObject = getTruncatedSnap();

    expect(
      await snapController.installSnaps(origin, {
        [FAKE_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [FAKE_SNAP_ID]: { error: serializeError(new Error('foo')) },
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(2);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      origin,
      expectedSnapObject.permissionName,
    );

    await eventSubscriptionPromise;
  });

  it('should add a snap disable/enable it and still get a response from method "test"', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/^Snap "npm:example-snap" has not been started yet.$/u);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.stopSnap(snap.id);

    snapController.disableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    await expect(snapController.startSnap(snap.id)).rejects.toThrow(
      /^Snap "npm:example-snap" is disabled.$/u,
    );

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/^Snap "npm:example-snap" is disabled.$/u);

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');
    expect(snapController.state.snaps[snap.id].enabled).toStrictEqual(false);

    snapController.enableSnap(snap.id);
    expect(snapController.state.snaps[snap.id].enabled).toStrictEqual(true);

    const result = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    expect(result).toStrictEqual('test1');
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.destroy();
  });

  it('should send an rpc request and time out', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
        maxRequestTime: 50,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    // override handler to take too long to return
    (snapController as any)._getRpcMessageHandler = async () => {
      return async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 300);
        });
      };
    };

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/request timed out/u);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    snapController.destroy();
  });

  it('should send an rpc request and time out and then be removed', async () => {
    const messenger = getSnapControllerMessenger();
    jest.spyOn(messenger, 'call').mockImplementation(() => true);
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        messenger,
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
        maxRequestTime: 50,
      }),
    );

    const sourceCode = `
      wallet.registerRpcMessageHandler(async (origin, request) => {
        const {method, params, id} = request;
        wallet.request({method: 'setState'})
        return method + id;
      });
    `;

    const snap = await snapController.add({
      id: 'npm:example-snap',
      sourceCode,
      manifest: getSnapManifest({ shasum: getSnapSourceShasum(sourceCode) }),
    });

    // override handler to take too long to return
    (snapController as any)._getRpcMessageHandler = async () => {
      return async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 300);
        });
      };
    };

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/request timed out/u);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    await snapController.removeSnap(snap.id);

    snapController.destroy();
  });

  describe('controller actions', () => {
    it('action: SnapController:add', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
        }),
      );
      const sourceCode = '// source code';
      const fooSnapObject = {
        initialPermissions: {},
        permissionName: 'wallet_snap_npm:fooSnap',
        version: '1.0.0',
        sourceCode,
        id: 'npm:fooSnap',
        manifest: getSnapManifest({
          shasum: getSnapSourceShasum(sourceCode),
        }),
        enabled: true,
        status: SnapStatus.installing,
      };

      const addSpy = jest.spyOn(snapController, 'add');
      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return {
            ...fooSnapObject,
          };
        });

      await messenger.call('SnapController:add', {
        id: 'npm:fooSnap',
      });

      expect(addSpy).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(Object.keys(snapController.state.snaps)).toHaveLength(1);
      expect(snapController.state.snaps['npm:fooSnap']).toMatchObject(
        fooSnapObject,
      );
    });

    it('action: SnapController:get', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const sourceCode = '// source code';
      const fooSnapObject = {
        initialPermissions: {},
        permissionName: 'fooperm',
        version: '0.0.1',
        sourceCode,
        id: 'npm:fooSnap',
        manifest: getSnapManifest({
          shasum: getSnapSourceShasum(sourceCode),
        }),
        enabled: true,
        status: SnapStatus.installing,
      };

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': fooSnapObject,
            },
          },
        }),
      );

      const getSpy = jest.spyOn(snapController, 'get');
      const result = messenger.call('SnapController:get', 'npm:fooSnap');

      expect(getSpy).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject(fooSnapObject);
    });

    it('action: SnapController:getRpcMessageHandler', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const sourceCode = '// source code';
      const fooSnapObject = {
        initialPermissions: {},
        permissionName: 'fooperm',
        version: '0.0.1',
        sourceCode,
        id: 'npm:fooSnap',
        manifest: getSnapManifest({
          shasum: getSnapSourceShasum(sourceCode),
        }),
        enabled: true,
        status: SnapStatus.installing,
      };

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': fooSnapObject,
            },
          },
        }),
      );

      const getRpcMessageHandlerSpy = jest.spyOn(
        snapController,
        'getRpcMessageHandler',
      );

      expect(
        await messenger.call(
          'SnapController:getRpcMessageHandler',
          'npm:fooSnap',
        ),
      ).toStrictEqual(expect.any(Function));
      expect(getRpcMessageHandlerSpy).toHaveBeenCalledTimes(1);
    });

    it('action: SnapController:getSnapState', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {
              'npm:fooSnap': {
                fizz: 'buzz',
              },
            },
            snaps: {},
          },
        }),
      );

      const getSnapStateSpy = jest.spyOn(snapController, 'getSnapState');
      const result = await messenger.call(
        'SnapController:getSnapState',
        'npm:fooSnap',
      );

      expect(getSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual({ fizz: 'buzz' });
    });

    it('action: SnapController:has', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const sourceCode = '// source code';

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': {
                initialPermissions: {},
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode,
                id: 'npm:fooSnap',
                manifest: getSnapManifest({
                  shasum: getSnapSourceShasum(sourceCode),
                }),
                enabled: true,
                status: SnapStatus.installing,
              },
            },
          },
        }),
      );

      const hasSpy = jest.spyOn(snapController, 'has');
      const result = messenger.call('SnapController:has', 'npm:fooSnap');

      expect(hasSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });

    it('action: SnapController:updateSnapState', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const sourceCode = '// source code';

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': {
                initialPermissions: {},
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode,
                id: 'npm:fooSnap',
                manifest: getSnapManifest({
                  shasum: getSnapSourceShasum(sourceCode),
                }),
                enabled: true,
                status: SnapStatus.installing,
              },
            },
          },
        }),
      );

      const updateSnapStateSpy = jest.spyOn(snapController, 'updateSnapState');
      await messenger.call('SnapController:updateSnapState', 'npm:fooSnap', {
        bar: 'baz',
      });

      expect(updateSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(snapController.state.snapStates).toStrictEqual({
        'npm:fooSnap': {
          bar: 'baz',
        },
      });
    });
  });
});
