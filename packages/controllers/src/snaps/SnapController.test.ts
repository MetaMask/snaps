import * as fs from 'fs';
import {
  Caveat,
  getPersistentState,
  Json,
  SubjectPermissions,
  ValidPermission,
} from '@metamask/controllers';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { EthereumRpcError, ethErrors, serializeError } from 'eth-rpc-errors';
import fetchMock from 'jest-fetch-mock';
import passworder from '@metamask/browser-passworder';
import { Crypto } from '@peculiar/webcrypto';
import { ExecutionService } from '../services/ExecutionService';
import { WebWorkerExecutionService } from '../services/WebWorkerExecutionService';
import { delay } from '../utils';
import { DEFAULT_ENDOWMENTS } from './default-endowments';
import { LONG_RUNNING_PERMISSION } from './endowments';
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
  SNAP_APPROVAL_UPDATE,
  TruncatedSnap,
} from './SnapController';
import * as utils from './utils';

const { getSnapSourceShasum } = utils;

const workerCode = fs.readFileSync(
  require.resolve(
    '@metamask/execution-environments/dist/webpack/webworker/bundle.js',
  ),
  'utf8',
);

const { subtle } = new Crypto();
Object.defineProperty(window, 'crypto', {
  value: {
    ...window.crypto,
    subtle,
    getRandomValues: jest.fn().mockReturnValue(new Uint32Array(32)),
  },
});

const getControllerMessenger = () =>
  new ControllerMessenger<
    SnapControllerActions | AllowedActions,
    SnapControllerEvents | AllowedEvents
  >();

const getSnapControllerMessenger = (
  messenger?: ReturnType<typeof getControllerMessenger>,
  mocked = true,
) => {
  const m = (messenger ?? getControllerMessenger()).getRestricted<
    'SnapController',
    SnapControllerActions['type'] | AllowedActions['type'],
    SnapControllerEvents['type'] | AllowedEvents['type']
  >({
    name: 'SnapController',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'SnapController:snapAdded',
      'SnapController:snapInstalled',
      'SnapController:snapUpdated',
      'SnapController:snapRemoved',
      'SnapController:stateChange',
    ],
    allowedActions: [
      'ApprovalController:addRequest',
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:getPermissions',
      'PermissionController:grantPermissions',
      'PermissionController:requestPermissions',
      'PermissionController:revokeAllPermissions',
      'SnapController:add',
      'SnapController:get',
      'SnapController:getRpcMessageHandler',
      'SnapController:getSnapState',
      'SnapController:has',
      'SnapController:updateSnapState',
      'SnapController:clearSnapState',
    ],
  });
  if (mocked) {
    jest.spyOn(m, 'call').mockImplementation((method, ...args) => {
      // Return false for long-running by default, and true for everything else.
      if (
        method === 'PermissionController:hasPermission' &&
        args[1] === LONG_RUNNING_PERMISSION
      ) {
        return false;
      }
      return true;
    });
  }
  return m;
};

const getWebWorkerEESMessenger = (
  messenger?: ReturnType<typeof getControllerMessenger>,
) =>
  (messenger ?? getControllerMessenger()).getRestricted({
    name: 'ExecutionService',
    allowedEvents: ['ExecutionService:unhandledError'],
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
    environmentEndowmentPermissions: [],
    getRpcMessageHandler: jest.fn(),
    removeAllPermissionsFor: jest.fn(),
    getPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    closeAllConnections: jest.fn(),
    getAppKey: jest
      .fn()
      .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`),
    messenger: getSnapControllerMessenger(),
    featureFlags: { dappsCanUpdateSnaps: true },
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
    environmentEndowmentPermissions: [],
    removeAllPermissionsFor: jest.fn(),
    getPermissions: jest.fn(),
    requestPermissions: jest.fn(),
    closeAllConnections: jest.fn(),
    getAppKey: jest
      .fn()
      .mockImplementation((snapId, appKeyType) => `${appKeyType}:${snapId}`),
    messenger: getSnapControllerMessenger(),
    state: undefined,
    ...opts,
  } as SnapControllerWithEESConstructorParams;
};

const getSnapController = (options = getSnapControllerOptions()) => {
  return new SnapController(options);
};

const getEmptySnapControllerState = () => {
  return {
    snaps: {},
    snapStates: {},
    snapErrors: {},
  } as SnapControllerState;
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
exports.onMessage = async (origin, request) => {
  const {method, params, id} = request;
  return method + id;
};
`;
const FAKE_SNAP_SHASUM = getSnapSourceShasum(FAKE_SNAP_SOURCE_CODE);
const FAKE_ORIGIN = 'foo.com';

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

const FAKE_SNAP_MANIFEST = getSnapManifest();

const getSnapObject = ({
  initialPermissions = {},
  id = FAKE_SNAP_ID,
  permissionName = `wallet_snap_${FAKE_SNAP_ID}`,
  version = '1.0.0',
  manifest = FAKE_SNAP_MANIFEST,
  status = SnapStatus.stopped,
  enabled = true,
  sourceCode = FAKE_SNAP_SOURCE_CODE,
  versionHistory = [
    { origin: FAKE_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
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
    versionHistory,
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

jest.mock('./utils', () => ({
  ...jest.requireActual<typeof utils>('./utils'),
  fetchNpmSnap: jest.fn().mockResolvedValue({
    manifest: {
      description: 'arbitraryDescription',
      initialPermissions: {},
      manifestVersion: '0.1',
      proposedName: 'ExampleSnap',
      repository: { type: 'git', url: 'https://github.com/example-snap' },
      source: {
        location: {
          npm: {
            filePath: 'dist/bundle.js',
            iconPath: 'images/icon.svg',
            packageName: 'example-snap',
            registry: 'https://registry.npmjs.org',
          },
        },
        shasum: 'vCmyHWIgnBwgiTqSXnd7LI7PbXSQim/JOotFfXkjAQk=',
      },
      version: '1.0.0',
    },
    sourceCode: '// foo',
  }),
}));

fetchMock.enableMocks();

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

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    const state = { hello: 'world' };
    await snapController.startSnap(snap.id);
    await snapController.updateSnapState(snap.id, state);
    const snapState = await snapController.getSnapState(snap.id);
    expect(snapState).toStrictEqual(state);
    expect(snapController.state.snapStates).toStrictEqual({
      'npm:example-snap': await passworder.encrypt(
        'stateEncryption:npm:example-snap',
        state,
      ),
    });
    snapController.destroy();
  });

  it('should add a snap and use its JSON-RPC api with a WebWorkerExecutionService', async () => {
    const [snapController] = getSnapControllerWithEES();

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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
      getSnapControllerWithEESOptions(),
      executionEnvironmentStub,
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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
        environmentEndowmentPermissions: ['endowment:foo'],
        executeSnap: executeSnapMock,
        messenger,
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    callActionMock.mockImplementation((method) => {
      if (
        method === 'PermissionController:hasPermission' ||
        method === 'ApprovalController:addRequest'
      ) {
        return true;
      } else if (method === 'PermissionController:getEndowments') {
        return ['fooEndowment'] as any;
      }
      return false;
    });

    await snapController.startSnap(snap.id);

    expect(callActionMock).toHaveBeenCalledTimes(3);
    expect(callActionMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      FAKE_SNAP_ID,
      'endowment:foo',
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      2,
      'PermissionController:getEndowments',
      FAKE_SNAP_ID,
      'endowment:foo',
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      3,
      'PermissionController:hasPermission',
      FAKE_SNAP_ID,
      LONG_RUNNING_PERMISSION,
    );

    expect(executeSnapMock).toHaveBeenCalledTimes(1);
    expect(executeSnapMock).toHaveBeenNthCalledWith(1, {
      snapId: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      endowments: [...DEFAULT_ENDOWMENTS, 'fooEndowment'],
    });
    snapController.destroy();
  });

  it('errors if attempting to start a snap that was already started', async () => {
    const manifest = {
      ...FAKE_SNAP_MANIFEST,
      initialPermissions: { eth_accounts: {} },
    };

    const mockExecuteSnap = jest.fn();

    const snapController = getSnapController(
      getSnapControllerOptions({ executeSnap: mockExecuteSnap }),
    );

    await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      manifest,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
    });
    await snapController.startSnap(FAKE_SNAP_ID);
    await expect(snapController.startSnap(FAKE_SNAP_ID)).rejects.toThrow(
      /^Snap "npm:example-snap" is already started.$/u,
    );
    expect(mockExecuteSnap).toHaveBeenCalledTimes(1);
    expect(mockExecuteSnap).toHaveBeenCalledWith({
      snapId: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      endowments: [...DEFAULT_ENDOWMENTS],
    });
  });

  it('should be able to rehydrate state', async () => {
    const mockExecuteSnap = jest.fn();

    const firstSnapController = getSnapController(
      getSnapControllerOptions({
        executeSnap: mockExecuteSnap,
        state: {
          snapErrors: {},
          snapStates: {},
          snaps: {
            'npm:foo': getSnapObject({
              permissionName: 'fooperm',
              version: '0.0.1',
              sourceCode: FAKE_SNAP_SOURCE_CODE,
              id: 'npm:foo',
              status: SnapStatus.installing,
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
    const serviceMessenger = getWebWorkerEESMessenger(controllerMessenger);
    const snapControllerMessenger =
      getSnapControllerMessenger(controllerMessenger);

    const workerExecutionEnvironment = getWebWorkerEES(serviceMessenger);
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({ messenger: snapControllerMessenger }),
      workerExecutionEnvironment,
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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
      controllerMessenger.subscribe('SnapController:stateChange', (state) => {
        const crashedSnap = state.snaps[snap.id];
        expect(crashedSnap.status).toStrictEqual(SnapStatus.crashed);
        resolve(undefined);
        snapController.destroy();
      });
    });
  });

  it('should add a snap and use its JSON-RPC api and then get stopped from idling too long', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 50,
        maxIdleTime: 100,
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });
    await snapController.startSnap(snap.id);

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });

    await delay(300);

    expect(snapController.isRunning(snap.id)).toStrictEqual(false);
    snapController.destroy();
  });

  it('should still terminate if connection to worker has failed', async () => {
    const options = getSnapControllerWithEESOptions({
      idleTimeCheckInterval: 50,
      maxIdleTime: 100,
    });
    const worker = getWebWorkerEES(options.messenger);
    const [snapController] = getSnapControllerWithEES(options, worker);

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });
    await snapController.startSnap(snap.id);

    const handler = await snapController.getRpcMessageHandler(snap.id);

    (snapController as any)._maxRequestTime = 50;

    (worker as any)._command = () =>
      new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/request timed out/u);

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');
    snapController.destroy();
  });

  it('should add a snap and see its status', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxIdleTime: 2000,
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);
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

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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
    const messenger = getSnapControllerMessenger(undefined, false);
    const snapController = getSnapController(
      getSnapControllerOptions({
        executeSnap: executeSnapMock,
        messenger,
      }),
    );

    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true) // PermissionController:hasPermission
      .mockImplementationOnce(async () => undefined) // PermissionController:getPermissions
      .mockImplementationOnce(() => false); // PermissionController:hasPermission - long running
    jest.spyOn(messenger, 'publish');

    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: FAKE_SNAP_MANIFEST,
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
      await snapController.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [FAKE_SNAP_ID]: expectedSnapObject,
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(3);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      FAKE_ORIGIN,
      expectedSnapObject.permissionName,
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      2,
      'PermissionController:getPermissions',
      FAKE_SNAP_ID,
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      3,
      'PermissionController:hasPermission',
      FAKE_SNAP_ID,
      LONG_RUNNING_PERMISSION,
    );

    await eventSubscriptionPromise;
  });

  it('should error on invalid semver range during installSnaps', async () => {
    const controller = getSnapController();

    const result = await controller.installSnaps(FAKE_ORIGIN, {
      [FAKE_SNAP_ID]: { version: 'foo' },
    });

    expect(result).toMatchObject({
      [FAKE_SNAP_ID]: { error: expect.any(EthereumRpcError) },
    });
  });

  it('should reuse an already installed Snap if satisfies requestes semver range', async () => {
    const messenger = getSnapControllerMessenger();
    const controller = getSnapController(
      getSnapControllerOptions({ messenger }),
    );

    const snap = await controller.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      manifest: FAKE_SNAP_MANIFEST,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
    });

    const addSpy = jest.spyOn(controller as any, 'add');
    const authorizeSpy = jest.spyOn(controller as any, 'authorize');
    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true);

    await controller.installSnaps(FAKE_ORIGIN, {
      [FAKE_SNAP_ID]: { version: '>0.9.0 <1.1.0' },
    });

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newSnap = controller.get(FAKE_SNAP_ID)!;

    // Notice usage of toBe - we're checking if it's actually the same object, not an equal one
    expect(newSnap).toBe(snap);
    expect(addSpy).not.toHaveBeenCalled();
    expect(authorizeSpy).not.toHaveBeenCalled();
    expect(messengerCallMock).toHaveBeenCalledTimes(1);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      FAKE_ORIGIN,
      newSnap?.permissionName,
    );
  });

  it('add should throw if manifest mismatches requestes version range', async () => {
    const controller = getSnapController();

    await expect(
      controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        manifest: FAKE_SNAP_MANIFEST,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        versionRange: '>1.0.0',
      }),
    ).rejects.toThrow('Version mismatch');
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

    const messengerCallMock = jest
      .spyOn(messenger, 'call')
      .mockImplementationOnce(() => true)
      .mockImplementation();

    jest.spyOn(messenger, 'publish');
    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: FAKE_SNAP_MANIFEST,
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
      await snapController.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: {},
      }),
    ).toStrictEqual({
      [FAKE_SNAP_ID]: { error: serializeError(new Error('foo')) },
    });

    expect(messengerCallMock).toHaveBeenCalledTimes(3);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      FAKE_ORIGIN,
      expectedSnapObject.permissionName,
    );

    await eventSubscriptionPromise;
  });

  it('should add a snap disable/enable it and still get a response from method "test"', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 1000,
        maxRequestTime: 2000,
        maxIdleTime: 2000,
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    const handler = await snapController.getRpcMessageHandler(snap.id);

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(
      /^Snap "npm:example-snap" is currently being installed\. Please try again later\.$/u,
    );

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);

    await snapController.disableSnap(snap.id);
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

    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');
    console.log('about to call handler', snapController.state);
    const result = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    console.log('after handler', result, snapController.state);
    expect(result).toStrictEqual('test1');
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    snapController.destroy();
  });

  it('should send an rpc request and time out', async () => {
    const messenger = getSnapControllerMessenger();
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        messenger,
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
        // Note that we are using the default maxRequestTime
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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

    // We set the maxRequestTime to a low enough value for it to time out
    (snapController as any)._maxRequestTime = 50;

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/request timed out/u);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');

    snapController.destroy();
  });

  it('should not time out long running snaps', async () => {
    const messenger = getSnapControllerMessenger();
    jest.spyOn(messenger, 'call').mockImplementation(() => {
      // Return true for everything here, so we signal that we have the long-running permission
      return true;
    });
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        messenger,
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
        // Note that we are using the default maxRequestTime
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
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

    // We set the maxRequestTime to a low enough value for it to time out if it werent a long running snap
    (snapController as any)._maxRequestTime = 50;

    const handlerPromise = handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
  });

  it('should time out on stuck starting snap', async () => {
    const executeSnap = jest.fn();
    const snapController = getSnapController(
      getSnapControllerOptions({ executeSnap, maxRequestTime: 50 }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    executeSnap.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 300);
      });
    });

    await expect(snapController.startSnap(snap.id)).rejects.toThrow(
      /request timed out/u,
    );

    snapController.destroy();
  });

  it('shouldnt time out a long running snap on start up', async () => {
    const messenger = getSnapControllerMessenger();
    jest.spyOn(messenger, 'call').mockImplementation(() => {
      // Return true for everything here, so we signal that we have the long-running permission
      return true;
    });
    const executeSnap = jest.fn();
    const snapController = getSnapController(
      getSnapControllerOptions({ messenger, executeSnap, maxRequestTime: 50 }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    executeSnap.mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(undefined);
        }, 300);
      });
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

  it('should remove a snap that is stopped without errors', async () => {
    const [snapController] = getSnapControllerWithEES(
      getSnapControllerWithEESOptions({
        idleTimeCheckInterval: 30000,
        maxIdleTime: 160000,
        maxRequestTime: 1000,
      }),
    );

    const snap = await snapController.add({
      origin: FAKE_ORIGIN,
      id: FAKE_SNAP_ID,
      sourceCode: FAKE_SNAP_SOURCE_CODE,
      manifest: FAKE_SNAP_MANIFEST,
    });

    // override handler to take too long to return
    (snapController as any)._getRpcMessageHandler = async () => {
      return async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(undefined);
          }, 30000);
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
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('crashed');

    await snapController.removeSnap(snap.id);

    expect(snapController.state.snaps[snap.id]).toBeUndefined();

    snapController.destroy();
  });

  describe('getRpcMessageHandler', () => {
    it('handlers populate the "jsonrpc" property if missing', async () => {
      const snapId = 'fooSnap';
      const [snapController] = getSnapControllerWithEES(
        getSnapControllerWithEESOptions({
          state: {
            snaps: {
              [snapId]: {
                enabled: true,
                id: snapId,
                status: SnapStatus.running,
              },
            },
          } as any,
        }),
      );

      const mockMessageHandler = jest.fn();
      jest
        .spyOn(snapController as any, '_getRpcMessageHandler')
        .mockReturnValueOnce(mockMessageHandler as any);

      const handle = await snapController.getRpcMessageHandler(snapId);
      await handle('foo.com', { id: 1, method: 'bar' });

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      expect(mockMessageHandler).toHaveBeenCalledWith('foo.com', {
        id: 1,
        method: 'bar',
        jsonrpc: '2.0',
      });
    });

    it('handlers throw if the request has an invalid "jsonrpc" property', async () => {
      const fakeSnap = getSnapObject({ status: SnapStatus.running });
      const snapId = fakeSnap.id;
      const snapController = getSnapController(
        getSnapControllerOptions({
          getRpcMessageHandler: (async () => () => undefined) as any,
          state: {
            ...getEmptySnapControllerState(),
            snaps: {
              [snapId]: fakeSnap,
            },
          },
        }),
      );
      const handle = await snapController.getRpcMessageHandler(snapId);

      await expect(
        handle('foo.com', { id: 1, method: 'bar', jsonrpc: 'kaplar' }),
      ).rejects.toThrow(
        ethErrors.rpc.invalidRequest({
          message: 'Invalid "jsonrpc" property. Must be "2.0" if provided.',
          data: 'kaplar',
        }),
      );
    });

    it('handlers will throw if there are too many pending requests before a snap has started', async () => {
      const fakeSnap = getSnapObject({ status: SnapStatus.stopped });
      const snapId = fakeSnap.id;
      const mockGetRpcMessageHandler = jest.fn();
      const snapController = getSnapController(
        getSnapControllerOptions({
          getRpcMessageHandler: mockGetRpcMessageHandler as any,
          state: {
            ...getEmptySnapControllerState(),
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

      jest
        .spyOn(snapController as any, '_executeSnap')
        .mockImplementation((() => deferredExecutePromise) as any);

      const handle = await snapController.getRpcMessageHandler(snapId);

      // Fill up the request queue
      const finishPromise = Promise.all([
        handle('foo.com', { id: 1, method: 'bar' }),
        handle('foo.com', { id: 2, method: 'bar' }),
        handle('foo.com', { id: 3, method: 'bar' }),
        handle('foo.com', { id: 4, method: 'bar' }),
        handle('foo.com', { id: 5, method: 'bar' }),
      ]);

      await expect(handle('foo.com', { id: 6, method: 'bar' })).rejects.toThrow(
        'Exceeds maximum number of requests waiting to be resolved, please try again.',
      );

      // Before processing the pending requests,
      // we need an rpc message handler function to be returned
      const mockRpcMessageHandler = async () => undefined;
      mockGetRpcMessageHandler.mockReturnValue(mockRpcMessageHandler);

      // Resolve the promise that the pending requests are waiting for and wait for them to finish
      resolveExecutePromise();
      await finishPromise;
    });
  });

  describe('installSnaps', () => {
    it('returns existing non-local snaps without reinstalling them', async () => {
      const messenger = getSnapControllerMessenger();
      const requester = 'baz.com';
      const snapId = 'npm:fooSnap';
      const version = '0.0.1';
      const fooSnapObject = getSnapObject({
        permissionName: `wallet_snap_${snapId}`,
        version,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...FAKE_SNAP_MANIFEST, version },
        enabled: true,
        status: SnapStatus.stopped,
      });

      const truncatedFooSnap = getTruncatedSnap({
        id: snapId,
        initialPermissions: fooSnapObject.initialPermissions,
        permissionName: fooSnapObject.permissionName,
        version: fooSnapObject.version,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              [snapId]: fooSnapObject,
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

      const result = await snapController.installSnaps(requester, {
        [snapId]: {},
      });
      expect(result).toStrictEqual({ [snapId]: truncatedFooSnap });
      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        requester,
        fooSnapObject.permissionName,
      );
      expect(addMock).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (already stopped)', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const requester = 'baz.com';
      const snapId = 'local:fooSnap';
      const version = '0.0.1';
      const fooSnapObject = getSnapObject({
        permissionName: `wallet_snap_${snapId}`,
        version,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...FAKE_SNAP_MANIFEST, version },
        enabled: true,
        status: SnapStatus.stopped,
      });

      const truncatedFooSnap = getTruncatedSnap({
        id: snapId,
        initialPermissions: fooSnapObject.initialPermissions,
        permissionName: fooSnapObject.permissionName,
        version: fooSnapObject.version,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              [snapId]: fooSnapObject,
            },
          },
        }),
      );

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return {
            ...fooSnapObject,
          };
        });
      const stopSnapSpy = jest.spyOn(snapController, 'stopSnap');

      const result = await snapController.installSnaps(requester, {
        [snapId]: {},
      });
      expect(result).toStrictEqual({ [snapId]: truncatedFooSnap });

      expect(callActionMock).toHaveBeenCalledTimes(3);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        requester,
        fooSnapObject.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'PermissionController:getPermissions',
        snapId,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:hasPermission',
        snapId,
        LONG_RUNNING_PERMISSION,
      );

      expect(executeSnapMock).toHaveBeenCalledTimes(1);
      expect(executeSnapMock).toHaveBeenCalledWith(
        expect.objectContaining({ snapId }),
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(snapId, '*');

      expect(stopSnapSpy).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (running)', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger();
      const requester = 'baz.com';
      const snapId = 'local:fooSnap';
      const version = '0.0.1';
      const fooSnapObject = getSnapObject({
        permissionName: `wallet_snap_${snapId}`,
        version,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...FAKE_SNAP_MANIFEST, version },
        enabled: true,
        // Set to "running"
        status: SnapStatus.running,
      });

      const truncatedFooSnap = getTruncatedSnap({
        id: snapId,
        initialPermissions: fooSnapObject.initialPermissions,
        permissionName: fooSnapObject.permissionName,
        version: fooSnapObject.version,
      });

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              [snapId]: fooSnapObject,
            },
          },
        }),
      );

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return {
            ...fooSnapObject,
          };
        });
      const stopSnapSpy = jest.spyOn(snapController as any, 'stopSnap');

      const result = await snapController.installSnaps(requester, {
        [snapId]: {},
      });

      expect(result).toStrictEqual({ [snapId]: truncatedFooSnap });

      expect(callActionMock).toHaveBeenCalledTimes(3);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        requester,
        fooSnapObject.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'PermissionController:getPermissions',
        snapId,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:hasPermission',
        snapId,
        LONG_RUNNING_PERMISSION,
      );

      expect(executeSnapMock).toHaveBeenCalledTimes(1);
      expect(executeSnapMock).toHaveBeenCalledWith(
        expect.objectContaining({ snapId }),
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(1);

      expect(fetchSnapMock).toHaveBeenCalledWith(snapId, '*');
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('should authorize permissions needed for snaps', async () => {
      const initialPermissions = { eth_accounts: {} };
      const manifest = {
        ...FAKE_SNAP_MANIFEST,
        initialPermissions,
      };

      const messenger = getSnapControllerMessenger();
      const snapController = getSnapController(
        getSnapControllerOptions({ messenger }),
      );

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (method === 'PermissionController:hasPermission') {
            return true;
          } else if (method === 'PermissionController:requestPermissions') {
            return [{ eth_accounts: {} }];
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(snapController as any, '_fetchSnap')
        .mockImplementationOnce(() => {
          return getSnapObject({ manifest });
        });

      const result = await snapController.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: {},
      });

      expect(result).toStrictEqual({
        [FAKE_SNAP_ID]: getTruncatedSnap({ initialPermissions }),
      });
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledTimes(4);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        FAKE_ORIGIN,
        'wallet_snap_npm:example-snap',
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'PermissionController:getPermissions',
        FAKE_SNAP_ID,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:requestPermissions',
        { origin: FAKE_SNAP_ID },
        { eth_accounts: {} },
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
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

      const result = await controller.installSnaps(FAKE_ORIGIN, {
        [snapId]: {},
      });

      expect(result).toStrictEqual({
        [snapId]: { error: expect.any(EthereumRpcError) },
      });
      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        FAKE_ORIGIN,
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

      await controller.add({
        id: FAKE_SNAP_ID,
        manifest: getSnapManifest(),
        origin: FAKE_ORIGIN,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
      });

      const callActionMock = jest
        .spyOn(messenger, 'call')
        .mockImplementation((method) => {
          if (
            method === 'PermissionController:hasPermission' ||
            method === 'ApprovalController:addRequest'
          ) {
            return true;
          } else if (method === 'PermissionController:getPermissions') {
            return {};
          }
          return false;
        });

      const fetchSnapMock = jest
        .spyOn(controller as any, '_fetchSnap')
        .mockImplementationOnce(async () => ({
          manifest: getSnapManifest({ version: newVersion }),
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        }));

      const result = await controller.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(4);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        FAKE_ORIGIN,
        expect.anything(),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'ApprovalController:addRequest',
        {
          origin: FAKE_ORIGIN,
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            snapId: FAKE_SNAP_ID,
            newVersion,
            newPermissions: {},
            approvedPermissions: {},
          },
        },
        true,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(FAKE_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [FAKE_SNAP_ID]: {
          id: FAKE_SNAP_ID,
          initialPermissions: {},
          permissionName: expect.anything(),
          version: newVersion,
        },
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
        id: FAKE_SNAP_ID,
        manifest: getSnapManifest(),
        origin: FAKE_ORIGIN,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
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
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        }));

      const result = await controller.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        FAKE_ORIGIN,
        expect.anything(),
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(FAKE_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [FAKE_SNAP_ID]: { error: expect.any(EthereumRpcError) },
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
        id: FAKE_SNAP_ID,
        manifest: getSnapManifest(),
        origin: FAKE_ORIGIN,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
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

      const result = await controller.installSnaps(FAKE_ORIGIN, {
        [FAKE_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledWith(
        'PermissionController:hasPermission',
        FAKE_ORIGIN,
        expect.anything(),
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(FAKE_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [FAKE_SNAP_ID]: { error: expect.anything() },
      });
    });
  });

  it('should not persist failed install attempt for future use', async () => {
    const manifest = {
      ...FAKE_SNAP_MANIFEST,
      initialPermissions: { eth_accounts: {} },
    };

    const snapController = getSnapController();

    const snap = getSnapObject();

    const setSpy = jest
      .spyOn(snapController as any, '_set')
      .mockRejectedValueOnce(new Error('bar'))
      .mockResolvedValue(snap);

    await expect(
      snapController.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        manifest,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
      }),
    ).rejects.toThrow('bar');
    expect(setSpy).toHaveBeenCalledTimes(1);

    expect(
      await snapController.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        manifest,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
      }),
    ).toBe(snap);
    expect(setSpy).toHaveBeenCalledTimes(2);
  });

  describe('controller actions', () => {
    it('action: SnapController:add', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);
      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
        }),
      );
      const fooSnapObject = {
        initialPermissions: {},
        permissionName: 'wallet_snap_npm:fooSnap',
        version: '1.0.0',
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: 'npm:fooSnap',
        manifest: FAKE_SNAP_MANIFEST,
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
        origin: FAKE_ORIGIN,
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
      const messenger = getSnapControllerMessenger(undefined, false);
      const fooSnapObject = getSnapObject({
        permissionName: 'fooperm',
        version: '0.0.1',
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: 'npm:fooSnap',
        manifest: FAKE_SNAP_MANIFEST,
        enabled: true,
        status: SnapStatus.installing,
      });

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
      const messenger = getSnapControllerMessenger(undefined, false);
      const fooSnapObject = getSnapObject({
        initialPermissions: {},
        permissionName: 'fooperm',
        version: '0.0.1',
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        id: 'npm:fooSnap',
        manifest: FAKE_SNAP_MANIFEST,
        enabled: true,
        status: SnapStatus.installing,
      });

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
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {
              'npm:fooSnap': encrypted,
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
      expect(result).toStrictEqual(state);
    });

    it('action: SnapController:has', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': getSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: FAKE_SNAP_SOURCE_CODE,
                id: 'npm:fooSnap',
                manifest: FAKE_SNAP_MANIFEST,
                enabled: true,
                status: SnapStatus.installing,
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

    it('action: SnapController:updateSnapState', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': getSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: FAKE_SNAP_SOURCE_CODE,
                id: 'npm:fooSnap',
                manifest: FAKE_SNAP_MANIFEST,
                enabled: true,
                status: SnapStatus.installing,
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

    it('should have different encryption for the same data stored by two different snaps', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: {},
            snaps: {
              'npm:fooSnap': getSnapObject({
                permissionName: 'fooperm',
                version: '0.0.1',
                sourceCode: FAKE_SNAP_SOURCE_CODE,
                id: 'npm:fooSnap',
                manifest: FAKE_SNAP_MANIFEST,
                enabled: true,
                status: SnapStatus.installing,
              }),
              'npm:fooSnap2': getSnapObject({
                permissionName: 'fooperm2',
                version: '0.0.1',
                sourceCode: FAKE_SNAP_SOURCE_CODE,
                id: 'npm:fooSnap2',
                manifest: FAKE_SNAP_MANIFEST,
                enabled: true,
                status: SnapStatus.installing,
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

    it('should throw our custom error message in case decryption fails', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: { [FAKE_SNAP_ID]: 'foo' },
            snaps: {
              [FAKE_SNAP_ID]: getSnapObject({
                status: SnapStatus.installing,
              }),
            },
          },
        }),
      );

      const getSnapStateSpy = jest.spyOn(snapController, 'getSnapState');
      await expect(
        messenger.call('SnapController:getSnapState', FAKE_SNAP_ID),
      ).rejects.toThrow(
        'Failed to decrypt snap state, the state must be corrupted.',
      );
      expect(getSnapStateSpy).toHaveBeenCalledTimes(1);
    });

    it('action: SnapController:clearSnapState', async () => {
      const executeSnapMock = jest.fn();
      const messenger = getSnapControllerMessenger(undefined, false);

      const snapController = getSnapController(
        getSnapControllerOptions({
          executeSnap: executeSnapMock,
          messenger,
          state: {
            snapErrors: {},
            snapStates: { [FAKE_SNAP_ID]: 'foo' },
            snaps: {
              [FAKE_SNAP_ID]: getSnapObject({
                status: SnapStatus.installing,
              }),
            },
          },
        }),
      );

      const clearSnapStateSpy = jest.spyOn(snapController, 'clearSnapState');
      await messenger.call('SnapController:clearSnapState', FAKE_SNAP_ID);
      const clearedState = await messenger.call(
        'SnapController:getSnapState',
        FAKE_SNAP_ID,
      );
      expect(clearSnapStateSpy).toHaveBeenCalledTimes(1);
      expect(snapController.state.snapStates).toStrictEqual({});
      expect(clearedState).toBeNull();
    });
  });

  describe('updateSnap', () => {
    it('should throw an error on invalid snap id', async () => {
      await expect(() =>
        getSnapController().updateSnap(FAKE_ORIGIN, 'local:foo'),
      ).rejects.toThrow('Could not find snap');
    });

    it('should not update on older snap version downloaded', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...FAKE_SNAP_MANIFEST,
          version: '0.9.0',
        };
        return {
          manifest,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

      const snap = await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: FAKE_SNAP_MANIFEST,
      });

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(FAKE_ORIGIN, FAKE_SNAP_ID);

      const newSnap = controller.get(FAKE_SNAP_ID);

      expect(result).toBeNull();
      expect(newSnap?.version).toStrictEqual(snap.version);
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(onSnapUpdated).not.toHaveBeenCalled();
      expect(onSnapAdded).not.toHaveBeenCalled();
    });

    it('should update a snap', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');
      const onSnapUpdated = jest.fn();
      const onSnapAdded = jest.fn();

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...FAKE_SNAP_MANIFEST,
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

      callActionSpy.mockImplementation((method) => {
        if (
          method === 'PermissionController:hasPermission' ||
          method === 'ApprovalController:addRequest'
        ) {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: FAKE_SNAP_MANIFEST,
      });

      messenger.subscribe('SnapController:snapUpdated', onSnapUpdated);
      messenger.subscribe('SnapController:snapAdded', onSnapAdded);

      const result = await controller.updateSnap(FAKE_ORIGIN, FAKE_SNAP_ID);

      const newSnapTruncated = controller.getTruncated(FAKE_SNAP_ID);

      const newSnap = controller.get(FAKE_SNAP_ID);

      expect(result).toStrictEqual(newSnapTruncated);
      expect(newSnap?.version).toStrictEqual('1.1.0');
      expect(newSnap?.versionHistory).toStrictEqual([
        {
          origin: FAKE_ORIGIN,
          version: '1.0.0',
          date: expect.any(Number),
        },
        {
          origin: FAKE_ORIGIN,
          version: '1.1.0',
          date: expect.any(Number),
        },
      ]);
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(3);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        FAKE_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        {
          origin: FAKE_ORIGIN,
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            snapId: FAKE_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: {},
            approvedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
      );
      expect(onSnapUpdated).toHaveBeenCalledTimes(1);
      expect(onSnapAdded).toHaveBeenCalledTimes(1);
    });

    it('should stop and restart a live snap during update', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...FAKE_SNAP_MANIFEST,
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

      callActionSpy.mockImplementation((method) => {
        if (
          method === 'PermissionController:hasPermission' ||
          method === 'ApprovalController:addRequest'
        ) {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: FAKE_SNAP_MANIFEST,
      });

      await controller.startSnap(FAKE_SNAP_ID);

      const startSnapSpy = jest.spyOn(controller as any, '_startSnap');
      const stopSnapSpy = jest.spyOn(controller as any, 'stopSnap');

      await controller.updateSnap(FAKE_ORIGIN, FAKE_SNAP_ID);

      const isRunning = controller.isRunning(FAKE_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(4);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'PermissionController:getPermissions',
        FAKE_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'ApprovalController:addRequest',
        {
          origin: FAKE_ORIGIN,
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            snapId: FAKE_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: {},
            approvedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
      );
      expect(isRunning).toStrictEqual(true);
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
      expect(startSnapSpy).toHaveBeenCalledTimes(1);
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('should throw an error on invalid SemVer range', async () => {
      const controller = getSnapController();

      await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: FAKE_SNAP_MANIFEST,
      });

      await expect(
        controller.updateSnap(
          FAKE_ORIGIN,
          FAKE_SNAP_ID,
          'this is not a version',
        ),
      ).rejects.toThrow('invalid Snap version range');
    });

    it('should return null on update request denied', async () => {
      const messenger = getSnapControllerMessenger();
      const controller = getSnapController(
        getSnapControllerOptions({ messenger }),
      );
      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...FAKE_SNAP_MANIFEST,
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

      callActionSpy.mockImplementation((method) => {
        if (method === 'PermissionController:hasPermission') {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return {};
        }
        return false;
      });

      await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: FAKE_SNAP_MANIFEST,
      });

      const result = await controller.updateSnap(FAKE_ORIGIN, FAKE_SNAP_ID);

      const newSnap = controller.get(FAKE_SNAP_ID);

      expect(result).toBeNull();
      expect(newSnap?.version).toStrictEqual('1.0.0');
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(2);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        FAKE_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        {
          origin: FAKE_ORIGIN,
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            snapId: FAKE_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: {},
            approvedPermissions: {},
          },
        },
        true,
      );
    });

    it('should request approval for new and already approved permissions and revoke unused permissions', async () => {
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
          invoker: FAKE_SNAP_ID,
        },
        snap_manageState: {
          caveats: null,
          parentCapability: 'snap_manageState',
          id: '2',
          date: 1,
          invoker: FAKE_SNAP_ID,
        },
      };

      const fetchSnapSpy = jest.spyOn(controller as any, '_fetchSnap');
      const callActionSpy = jest.spyOn(messenger, 'call');

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = getSnapManifest({
          version: '1.1.0',
          initialPermissions: {
            snap_confirm: {},
            'endowment:network-access': {},
          },
        });
        return {
          manifest,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
        };
      });

      callActionSpy.mockImplementation((method) => {
        if (
          method === 'PermissionController:hasPermission' ||
          method === 'ApprovalController:addRequest'
        ) {
          return true;
        } else if (method === 'PermissionController:getPermissions') {
          return approvedPermissions;
        } else if (
          method === 'PermissionController:revokePermissions' ||
          method === 'PermissionController:grantPermissions'
        ) {
          // eslint-disable-next-line consistent-return
          return;
        }
        return false;
      });

      await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
        manifest: getSnapManifest({ initialPermissions }),
      });

      await controller.updateSnap(FAKE_ORIGIN, FAKE_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(5);
      expect(callActionSpy).toHaveBeenNthCalledWith(
        1,
        'PermissionController:getPermissions',
        FAKE_SNAP_ID,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        2,
        'ApprovalController:addRequest',
        {
          origin: FAKE_ORIGIN,
          type: SNAP_APPROVAL_UPDATE,
          requestData: {
            snapId: FAKE_SNAP_ID,
            newVersion: '1.1.0',
            newPermissions: { 'endowment:network-access': {} },
            approvedPermissions: {
              snap_confirm: approvedPermissions.snap_confirm,
            },
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'PermissionController:revokePermissions',
        { [FAKE_SNAP_ID]: ['snap_manageState'] },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: { 'endowment:network-access': {} },
          subject: { origin: FAKE_SNAP_ID },
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        5,
        'PermissionController:hasPermission',
        FAKE_SNAP_ID,
        LONG_RUNNING_PERMISSION,
      );
    });
  });

  describe('_fetchSnap', () => {
    it('can fetch NPM snaps', async () => {
      const sourceCode = '// foo';
      const shasum = 'vCmyHWIgnBwgiTqSXnd7LI7PbXSQim/JOotFfXkjAQk=';
      const controller = getSnapController();

      const result = await controller.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
      });
      expect(result).toStrictEqual(
        getSnapObject({
          sourceCode,
          status: SnapStatus.installing,
          manifest: getSnapManifest({ shasum }),
        }),
      );
    });

    it('can fetch local snaps', async () => {
      const controller = getSnapController();

      fetchMock
        .mockResponseOnce(JSON.stringify(FAKE_SNAP_MANIFEST))
        .mockResponseOnce(FAKE_SNAP_SOURCE_CODE);

      const id = 'local:https://localhost:8081';
      const result = await controller.add({
        origin: FAKE_ORIGIN,
        id,
      });
      // Fetch is called 3 times, for fetching the manifest, the sourcecode and icon (icon just has the default response for now)
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(result).toStrictEqual(
        getSnapObject({
          id,
          sourceCode: FAKE_SNAP_SOURCE_CODE,
          status: SnapStatus.installing,
          manifest: FAKE_SNAP_MANIFEST,
          permissionName: 'wallet_snap_local:https://localhost:8081',
        }),
      );
    });
  });

  describe('enableSnap/disableSnap', () => {
    it('updates snap state correctly', async () => {
      const manifest = {
        ...FAKE_SNAP_MANIFEST,
        initialPermissions: { eth_accounts: {} },
      };

      const snapController = getSnapController();

      await snapController.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        manifest,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
      });

      await snapController.disableSnap(FAKE_SNAP_ID);
      expect(snapController.get(FAKE_SNAP_ID)?.enabled).toBe(false);
      snapController.enableSnap(FAKE_SNAP_ID);
      expect(snapController.get(FAKE_SNAP_ID)?.enabled).toBe(true);
    });

    it('disableSnap also stops a running snap', async () => {
      const manifest = {
        ...FAKE_SNAP_MANIFEST,
        initialPermissions: { eth_accounts: {} },
      };

      const snapController = getSnapController();

      await snapController.add({
        origin: FAKE_ORIGIN,
        id: FAKE_SNAP_ID,
        manifest,
        sourceCode: FAKE_SNAP_SOURCE_CODE,
      });

      await snapController.startSnap(FAKE_SNAP_ID);

      await snapController.disableSnap(FAKE_SNAP_ID);
      const snap = snapController.get(FAKE_SNAP_ID);
      expect(snap?.enabled).toBe(false);
      expect(snap?.status).toBe(SnapStatus.stopped);
    });
  });
});
