import { Duplex } from 'stream';
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
import { SnapExecutionData } from '@metamask/snap-types';
import { createEngineStream } from 'json-rpc-middleware-stream';
import { createAsyncMiddleware, JsonRpcEngine } from 'json-rpc-engine';
import pump from 'pump';
import { SnapManifest } from '@metamask/snap-utils';
import { ExecutionService } from '../services/ExecutionService';
import { NodeThreadExecutionService } from '../services/node';
import { delay } from '../utils';
import { setupMultiplex } from '../services';
import { DEFAULT_ENDOWMENTS } from './default-endowments';
import { LONG_RUNNING_PERMISSION } from './endowments';
import {
  AllowedActions,
  AllowedEvents,
  CheckSnapBlockListArg,
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
      'ExecutionService:getRpcRequestHandler',
      'ExecutionService:terminateAllSnaps',
      'ExecutionService:terminateSnap',
      'PermissionController:getEndowments',
      'PermissionController:hasPermission',
      'PermissionController:getPermissions',
      'PermissionController:grantPermissions',
      'PermissionController:requestPermissions',
      'PermissionController:revokeAllPermissions',
      'SnapController:add',
      'SnapController:get',
      'SnapController:handleRpcRequest',
      'SnapController:getSnapState',
      'SnapController:has',
      'SnapController:updateSnapState',
      'SnapController:clearSnapState',
      'SnapController:updateBlockedSnaps',
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

const getNodeEESMessenger = (
  messenger: ReturnType<typeof getControllerMessenger>,
) =>
  messenger.getRestricted({
    name: 'ExecutionService',
    allowedEvents: [
      'ExecutionService:unhandledError',
      'ExecutionService:outboundRequest',
      'ExecutionService:outboundResponse',
    ],
    allowedActions: [
      'ExecutionService:executeSnap',
      'ExecutionService:getRpcRequestHandler',
      'ExecutionService:terminateAllSnaps',
      'ExecutionService:terminateSnap',
    ],
  });

type SnapControllerConstructorParams = ConstructorParameters<
  typeof SnapController
>[0];

type PartialSnapControllerConstructorParams = Partial<
  Omit<ConstructorParameters<typeof SnapController>[0], 'state'> & {
    state: Partial<SnapControllerConstructorParams['state']>;
  }
>;

const getSnapControllerOptions = (
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

type GetSnapControllerWithEESOptionsParam = Omit<
  PartialSnapControllerConstructorParams,
  'messenger'
> & { rootMessenger?: ReturnType<typeof getControllerMessenger> };

const getSnapControllerWithEESOptions = (
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
        args[1] === LONG_RUNNING_PERMISSION
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

const getSnapController = (options = getSnapControllerOptions()) => {
  return new SnapController(options);
};

const MOCK_BLOCK_NUMBER = '0xa70e75';

const getNodeEES = (messenger: ReturnType<typeof getNodeEESMessenger>) =>
  new NodeThreadExecutionService({
    messenger,
    setupSnapProvider: jest.fn().mockImplementation((_snapId, rpcStream) => {
      const mux = setupMultiplex(rpcStream, 'foo');
      const stream = mux.createStream('metamask-provider');
      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        if (req.method === 'metamask_getProviderState') {
          res.result = { isUnlocked: false, accounts: [] };
          return end();
        } else if (req.method === 'eth_blockNumber') {
          res.result = MOCK_BLOCK_NUMBER;
          return end();
        }
        return next();
      });
      const providerStream = createEngineStream({ engine });
      pump(stream, providerStream, stream);
    }),
  });

class ExecutionEnvironmentStub implements ExecutionService {
  constructor(messenger: ReturnType<typeof getNodeEESMessenger>) {
    messenger.registerActionHandler(
      'ExecutionService:getRpcRequestHandler',
      (snapId: string) => this.getRpcRequestHandler(snapId),
    );

    messenger.registerActionHandler(
      'ExecutionService:executeSnap',
      (snapData: SnapExecutionData) => this.executeSnap(snapData),
    );

    messenger.registerActionHandler(
      'ExecutionService:terminateSnap',
      (snapId: string) => this.terminateSnap(snapId),
    );

    messenger.registerActionHandler('ExecutionService:terminateAllSnaps', () =>
      this.terminateAllSnaps(),
    );
  }

  async terminateAllSnaps() {
    // empty stub
  }

  async getRpcRequestHandler(_snapId: string) {
    return (_: any, request: Record<string, unknown>) => {
      return new Promise((resolve) => {
        const results = `${request.method}${request.id}`;
        resolve(results);
      });
    };
  }

  async executeSnap(_snapData: SnapExecutionData) {
    return 'some-unique-id';
  }

  async terminateSnap(_snapId: string) {
    // empty stub
  }
}

const getSnapControllerWithEES = (
  options = getSnapControllerWithEESOptions(),
  service?: ReturnType<typeof getNodeEES>,
) => {
  const _service =
    service ?? getNodeEES(getNodeEESMessenger(options.rootMessenger));
  const controller = new SnapController(options);
  return [controller, _service] as const;
};

const MOCK_SNAP_ID = 'npm:example-snap';
const MOCK_SNAP_SOURCE_CODE = `
exports.onRpcRequest = async ({ origin, request }) => {
  const {method, params, id} = request;
  return method + id;
};
`;
const MOCK_SNAP_SHASUM = getSnapSourceShasum(MOCK_SNAP_SOURCE_CODE);
const MOCK_ORIGIN = 'foo.com';

const getSnapManifest = ({
  version = '1.0.0',
  proposedName = 'ExampleSnap',
  description = 'arbitraryDescription',
  filePath = 'dist/bundle.js',
  iconPath = 'images/icon.svg',
  packageName = 'example-snap',
  initialPermissions = {},
  shasum = MOCK_SNAP_SHASUM,
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
  blocked = false,
  enabled = true,
  id = MOCK_SNAP_ID,
  initialPermissions = {},
  manifest = getSnapManifest(),
  permissionName = `wallet_snap_${MOCK_SNAP_ID}`,
  sourceCode = MOCK_SNAP_SOURCE_CODE,
  status = SnapStatus.stopped,
  version = '1.0.0',
  versionHistory = [
    { origin: MOCK_ORIGIN, version: '1.0.0', date: expect.any(Number) },
  ],
} = {}): Snap => {
  return {
    blocked,
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

/**
 * Gets a whole suite of associated snap data, including the snap's id, origin,
 * package name, source code, shasum, manifest, and SnapController state object.
 *
 * @param options - Options bag.
 * @param options.id - The id of the snap.
 * @param options.origin - The origin associated with the snap's installation
 * request.
 * @param options.sourceCode - The snap's source code. Will be used to compute
 * the snap's shasum.
 * @param options.blocked - Whether the snap's state object should indicate that
 * the snap is blocked.
 * @param options.enabled - Whether the snap's state object should should
 * indicate that the snap is enabled. Must not be `true` if the snap is blocked.
 * @returns The mock snap data.
 */
const getMockSnapData = ({
  blocked = false,
  enabled = true,
  id,
  origin,
  sourceCode,
}: {
  id: string;
  origin: string;
  sourceCode?: string;
  blocked?: boolean;
  enabled?: boolean;
}) => {
  if (blocked && enabled) {
    throw new Error('A snap may not be enabled if it is blocked.');
  }

  const packageName = `${id}-package`;
  const _sourceCode = sourceCode ?? `${MOCK_SNAP_SOURCE_CODE}// ${id}\n`;
  const shasum = getSnapSourceShasum(_sourceCode);
  const manifest = getSnapManifest({
    packageName,
    shasum,
  });

  return {
    id,
    origin,
    packageName,
    shasum,
    sourceCode: _sourceCode,
    manifest,
    stateObject: getSnapObject({
      blocked,
      enabled,
      id,
      manifest,
      sourceCode,
    }),
  };
};

const getTruncatedSnap = ({
  initialPermissions = {},
  id = MOCK_SNAP_ID,
  permissionName = `wallet_snap_${MOCK_SNAP_ID}`,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
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
    await service.terminateAllSnaps();
  });

  it('adds a snap and uses its JSON-RPC api with a NodeThreadExecutionService', async () => {
    const [snapController, service] = getSnapControllerWithEES();

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);

    const result = await snapController.handleRpcRequest(snap.id, 'foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);

    const result = await snapController.handleRpcRequest(snap.id, 'foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
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
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        endowments: [...DEFAULT_ENDOWMENTS, 'fooEndowment'],
      },
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      4,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      LONG_RUNNING_PERMISSION,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
    });
    await snapController.startSnap(MOCK_SNAP_ID);
    await expect(snapController.startSnap(MOCK_SNAP_ID)).rejects.toThrow(
      /^Snap "npm:example-snap" is already started.$/u,
    );
    expect(callActionMock).toHaveBeenCalledTimes(2);
    expect(callActionMock).toHaveBeenNthCalledWith(
      1,
      'ExecutionService:executeSnap',
      {
        snapId: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        endowments: [...DEFAULT_ENDOWMENTS],
      },
    );

    expect(callActionMock).toHaveBeenNthCalledWith(
      2,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      LONG_RUNNING_PERMISSION,
    );
  });

  it('can rehydrate state', async () => {
    const firstSnapController = getSnapController(
      getSnapControllerOptions({
        state: {
          snaps: {
            'npm:foo': getSnapObject({
              permissionName: 'fooperm',
              version: '0.0.1',
              sourceCode: MOCK_SNAP_SOURCE_CODE,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        expect(crashedSnap.status).toStrictEqual(SnapStatus.crashed);
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });
    await snapController.startSnap(snap.id);

    await snapController.handleRpcRequest(snap.id, 'foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });
    await snapController.startSnap(snap.id);

    (snapController as any)._maxRequestTime = 50;

    (service as any)._command = () =>
      new Promise((resolve) => {
        setTimeout(resolve, 2000);
      });

    await expect(
      snapController.handleRpcRequest(snap.id, 'foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await snapController.stopSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('stopped');

    const results = await snapController.handleRpcRequest(snap.id, 'foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
          args[1] === LONG_RUNNING_PERMISSION
        ) {
          return false;
        }
        return true;
      });
    jest.spyOn(messenger, 'publish');

    jest
      .spyOn(snapController as any, '_fetchSnap')
      .mockImplementationOnce(async () => {
        return {
          manifest: getSnapManifest(),
          sourceCode: MOCK_SNAP_SOURCE_CODE,
        };
      });

    const eventSubscriptionPromise = Promise.all([
      new Promise<void>((resolve) => {
        messenger.subscribe('SnapController:snapAdded', (snap) => {
          expect(snap).toStrictEqual(
            getSnapObject({ status: SnapStatus.installing }),
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

    expect(messengerCallMock).toHaveBeenCalledTimes(3);
    expect(messengerCallMock).toHaveBeenNthCalledWith(
      1,
      'PermissionController:hasPermission',
      MOCK_ORIGIN,
      expectedSnapObject.permissionName,
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      2,
      'ExecutionService:executeSnap',
      expect.any(Object),
    );

    expect(messengerCallMock).toHaveBeenNthCalledWith(
      3,
      'PermissionController:hasPermission',
      MOCK_SNAP_ID,
      LONG_RUNNING_PERMISSION,
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

    const snap = await controller.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      manifest: getSnapManifest(),
      sourceCode: MOCK_SNAP_SOURCE_CODE,
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

    // Notice usage of toBe - we're checking if it's actually the same object, not an equal one
    expect(newSnap).toBe(snap);
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
            getSnapObject({ status: SnapStatus.installing }),
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await expect(
      snapController.handleRpcRequest(snap.id, 'foo.com', {
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
      snapController.handleRpcRequest(snap.id, 'foo.com', {
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

    const result = await snapController.handleRpcRequest(snap.id, 'foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
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
        if (method === 'ExecutionService:getRpcRequestHandler') {
          return (async () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(undefined);
              }, 300);
            });
          }) as any;
        } else if (
          method === 'PermissionController:hasPermission' &&
          args[1] === LONG_RUNNING_PERMISSION
        ) {
          return false;
        }
        return true;
      });
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // We set the maxRequestTime to a low enough value for it to time out
    (snapController as any)._maxRequestTime = 50;

    await expect(
      snapController.handleRpcRequest(snap.id, 'foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
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
      await snapController.handleRpcRequest(snap.id, 'foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
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
      await snapController.handleRpcRequest(snap.id, 'foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
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
      if (method === 'ExecutionService:getRpcRequestHandler') {
        return (async () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve(undefined);
            }, 300);
          });
        }) as any;
      }
      // Return true for everything here, so we signal that we have the long-running permission
      return true;
    });

    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    // We set the maxRequestTime to a low enough value for it to time out if it werent a long running snap
    (snapController as any)._maxRequestTime = 50;

    const handlerPromise = snapController.handleRpcRequest(snap.id, 'foo.com', {
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
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
      sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        if (method === 'ExecutionService:getRpcRequestHandler') {
          return (async () => {
            return new Promise((resolve) => {
              setTimeout(() => {
                resolve(undefined);
              }, 30000);
            });
          }) as any;
        } else if (
          method === 'PermissionController:hasPermission' &&
          args[1] === LONG_RUNNING_PERMISSION
        ) {
          return false;
        }
        return true;
      });
    const [snapController, service] = getSnapControllerWithEES(options);

    const snap = await snapController.add({
      origin: MOCK_ORIGIN,
      id: MOCK_SNAP_ID,
      sourceCode: MOCK_SNAP_SOURCE_CODE,
      manifest: getSnapManifest(),
    });

    await snapController.startSnap(snap.id);
    expect(snapController.state.snaps[snap.id].status).toStrictEqual('running');

    await expect(
      snapController.handleRpcRequest(snap.id, 'foo.com', {
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
              status: SnapStatus.running,
            } as any,
          },
        },
      });
      const [snapController, service] = getSnapControllerWithEES(options);

      const mockMessageHandler = jest.fn();
      jest.spyOn(options.messenger, 'call').mockImplementation((method) => {
        if (method === 'ExecutionService:getRpcRequestHandler') {
          return mockMessageHandler as any;
        }
        return true;
      });

      await snapController.handleRpcRequest(snapId, 'foo.com', {
        id: 1,
        method: 'bar',
      });

      expect(mockMessageHandler).toHaveBeenCalledTimes(1);
      expect(mockMessageHandler).toHaveBeenCalledWith('foo.com', {
        id: 1,
        method: 'bar',
        jsonrpc: '2.0',
      });
      await service.terminateAllSnaps();
    });

    it('handlers throw if the request has an invalid "jsonrpc" property', async () => {
      const fakeSnap = getSnapObject({ status: SnapStatus.running });
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
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 1,
          method: 'bar',
          jsonrpc: 'kaplar',
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
      const fakeSnap = getSnapObject({ status: SnapStatus.stopped });
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
        } else if (method === 'ExecutionService:getRpcRequestHandler') {
          // eslint-disable-next-line consistent-return
          return;
        }
        return true;
      });

      // Fill up the request queue
      const finishPromise = Promise.all([
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 1,
          method: 'bar',
        }),
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 2,
          method: 'bar',
        }),
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 3,
          method: 'bar',
        }),
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 4,
          method: 'bar',
        }),
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 5,
          method: 'bar',
        }),
      ]);

      await expect(
        snapController.handleRpcRequest(snapId, 'foo.com', {
          id: 6,
          method: 'bar',
        }),
      ).rejects.toThrow(
        'Exceeds maximum number of requests waiting to be resolved, please try again.',
      );

      // Before processing the pending requests,
      // we need an rpc message handler function to be returned
      jest.spyOn(messenger, 'call').mockImplementation((method) => {
        if (method === 'ExecutionService:executeSnap') {
          return deferredExecutePromise;
        } else if (method === 'ExecutionService:getRpcRequestHandler') {
          return (async () => undefined) as any;
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
      const manifest = {
        ...getSnapManifest(),
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
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
          manifest,
          sourceCode: MOCK_SNAP_SOURCE_CODE,
        }),
      ).rejects.toThrow('bar');
      expect(setSpy).toHaveBeenCalledTimes(1);

      expect(
        await snapController.add({
          origin: MOCK_ORIGIN,
          id: MOCK_SNAP_ID,
          manifest,
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
        };
      });

      checkBlockListSpy.mockResolvedValueOnce({
        [MOCK_SNAP_ID]: { blocked: true },
      });

      await expect(
        controller.add({
          id: MOCK_SNAP_ID,
          origin: 'foo.com',
        }),
      ).rejects.toThrow('Cannot install version "1.1.0" of snap');
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
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...getSnapManifest(), version },
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
      const messenger = getSnapControllerMessenger();
      const requester = 'baz.com';
      const snapId = 'local:fooSnap';
      const version = '0.0.1';
      const fooSnapObject = getSnapObject({
        permissionName: `wallet_snap_${snapId}`,
        version,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...getSnapManifest(), version },
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
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'PermissionController:hasPermission',
        snapId,
        LONG_RUNNING_PERMISSION,
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(snapId, '*');

      expect(stopSnapSpy).not.toHaveBeenCalled();
    });

    it('reinstalls local snaps even if they are already installed (running)', async () => {
      const messenger = getSnapControllerMessenger();
      const requester = 'baz.com';
      const snapId = 'local:fooSnap';
      const version = '0.0.1';
      const fooSnapObject = getSnapObject({
        permissionName: `wallet_snap_${snapId}`,
        version,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        id: snapId,
        manifest: { ...getSnapManifest(), version },
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
          messenger,
          state: {
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

      expect(callActionMock).toHaveBeenCalledTimes(4);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        requester,
        fooSnapObject.permissionName,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'ExecutionService:terminateSnap',
        snapId,
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'ExecutionService:executeSnap',
        expect.objectContaining({ snapId }),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        snapId,
        LONG_RUNNING_PERMISSION,
      );

      expect(fetchSnapMock).toHaveBeenCalledTimes(1);

      expect(fetchSnapMock).toHaveBeenCalledWith(snapId, '*');
      expect(stopSnapSpy).toHaveBeenCalledTimes(1);
    });

    it('authorizes permissions needed for snaps', async () => {
      const initialPermissions = { eth_accounts: {} };
      const manifest = {
        ...getSnapManifest(),
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

      const result = await snapController.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: {},
      });

      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: getTruncatedSnap({ initialPermissions }),
      });
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(callActionMock).toHaveBeenCalledTimes(4);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        'wallet_snap_npm:example-snap',
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        2,
        'PermissionController:requestPermissions',
        { origin: MOCK_SNAP_ID },
        { eth_accounts: {} },
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
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

      await controller.add({
        id: MOCK_SNAP_ID,
        manifest: getSnapManifest(),
        origin: MOCK_ORIGIN,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
        }));

      const result = await controller.installSnaps(MOCK_ORIGIN, {
        [MOCK_SNAP_ID]: { version: newVersionRange },
      });

      expect(callActionMock).toHaveBeenCalledTimes(5);
      expect(callActionMock).toHaveBeenNthCalledWith(
        1,
        'PermissionController:hasPermission',
        MOCK_ORIGIN,
        expect.anything(),
      );

      expect(callActionMock).toHaveBeenNthCalledWith(
        3,
        'ApprovalController:addRequest',
        {
          origin: MOCK_ORIGIN,
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
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
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
        LONG_RUNNING_PERMISSION,
      );
      expect(fetchSnapMock).toHaveBeenCalledTimes(1);
      expect(fetchSnapMock).toHaveBeenCalledWith(MOCK_SNAP_ID, newVersionRange);
      expect(result).toStrictEqual({
        [MOCK_SNAP_ID]: {
          id: MOCK_SNAP_ID,
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
        id: MOCK_SNAP_ID,
        manifest: getSnapManifest(),
        origin: MOCK_ORIGIN,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        sourceCode: MOCK_SNAP_SOURCE_CODE,
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
      ).rejects.toThrow('Could not find snap');
    });

    it('throws an error if the specified SemVer range is invalid', async () => {
      const controller = getSnapController(
        getSnapControllerOptions({
          state: {
            snaps: {
              [MOCK_SNAP_ID]: getSnapObject(),
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
              [MOCK_SNAP_ID]: getSnapObject(),
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
        };
      });

      const snap = await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
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

      fetchSnapSpy.mockImplementationOnce(async () => {
        const manifest: SnapManifest = {
          ...getSnapManifest(),
          version: '1.1.0',
        };
        return {
          manifest,
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        manifest: getSnapManifest(),
      });

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
      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(4);
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
            approvedPermissions: {},
            unusedPermissions: {},
          },
        },
        true,
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        3,
        'ExecutionService:executeSnap',
        expect.objectContaining({}),
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        LONG_RUNNING_PERMISSION,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        manifest: getSnapManifest(),
      });

      await controller.startSnap(MOCK_SNAP_ID);

      const startSnapSpy = jest.spyOn(controller as any, '_startSnap');
      const stopSnapSpy = jest.spyOn(controller as any, 'stopSnap');

      await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      const isRunning = controller.isRunning(MOCK_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
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
        LONG_RUNNING_PERMISSION,
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
        7,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
        LONG_RUNNING_PERMISSION,
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        manifest: getSnapManifest(),
      });

      const result = await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      const newSnap = controller.get(MOCK_SNAP_ID);

      expect(result).toBeNull();
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
          sourceCode: MOCK_SNAP_SOURCE_CODE,
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
          return undefined;
        }
        return false;
      });

      await controller.add({
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
        sourceCode: MOCK_SNAP_SOURCE_CODE,
        manifest: getSnapManifest({ initialPermissions }),
      });

      await controller.updateSnap(MOCK_ORIGIN, MOCK_SNAP_ID);

      expect(fetchSnapSpy).toHaveBeenCalledTimes(1);
      expect(callActionSpy).toHaveBeenCalledTimes(6);
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
        3,
        'PermissionController:revokePermissions',
        { [MOCK_SNAP_ID]: ['snap_manageState'] },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        4,
        'PermissionController:grantPermissions',
        {
          approvedPermissions: { 'endowment:network-access': {} },
          subject: { origin: MOCK_SNAP_ID },
        },
      );

      expect(callActionSpy).toHaveBeenNthCalledWith(
        6,
        'PermissionController:hasPermission',
        MOCK_SNAP_ID,
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
        origin: MOCK_ORIGIN,
        id: MOCK_SNAP_ID,
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
        .mockResponseOnce(JSON.stringify(getSnapManifest()))
        .mockResponseOnce(MOCK_SNAP_SOURCE_CODE);

      const id = 'local:https://localhost:8081';
      const result = await controller.add({
        origin: MOCK_ORIGIN,
        id,
      });
      // Fetch is called 3 times, for fetching the manifest, the sourcecode and icon (icon just has the default response for now)
      expect(fetchMock).toHaveBeenCalledTimes(3);
      expect(result).toStrictEqual(
        getSnapObject({
          id,
          sourceCode: MOCK_SNAP_SOURCE_CODE,
          status: SnapStatus.installing,
          manifest: getSnapManifest(),
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
              [MOCK_SNAP_ID]: { ...getSnapObject(), enabled: false },
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
              [MOCK_SNAP_ID]: {
                ...getSnapObject(),
                blocked: true,
                enabled: false,
              },
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
              [MOCK_SNAP_ID]: { ...getSnapObject(), enabled: true },
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
              [MOCK_SNAP_ID]: { ...getSnapObject(), enabled: true },
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

      const snapController = getSnapController(
        getSnapControllerOptions({
          checkBlockList: checkBlockListSpy,
        }),
      );

      checkBlockListSpy.mockResolvedValueOnce({
        [snapId]: { blocked: false },
      });
      expect(await snapController.isBlocked(snapId, '1.0.0')).toBe(false);

      checkBlockListSpy.mockResolvedValueOnce({
        [snapId]: { blocked: true },
      });
      expect(await snapController.isBlocked(snapId, '1.0.0')).toBe(true);
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

        const fooSnapObject = {
          initialPermissions: {},
          permissionName: 'wallet_snap_npm:fooSnap',
          version: '1.0.0',
          sourceCode: MOCK_SNAP_SOURCE_CODE,
          id: 'npm:fooSnap',
          manifest: getSnapManifest(),
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
          origin: MOCK_ORIGIN,
          id: 'npm:fooSnap',
        });

        expect(addSpy).toHaveBeenCalledTimes(1);
        expect(fetchSnapMock).toHaveBeenCalledTimes(1);
        expect(Object.keys(snapController.state.snaps)).toHaveLength(1);
        expect(snapController.state.snaps['npm:fooSnap']).toMatchObject(
          fooSnapObject,
        );
      });
    });

    describe('SnapController:get', () => {
      it('gets a snap', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const fooSnapObject = getSnapObject({
          permissionName: 'fooperm',
          version: '0.0.1',
          sourceCode: MOCK_SNAP_SOURCE_CODE,
          id: 'npm:fooSnap',
          manifest: getSnapManifest(),
          enabled: true,
          status: SnapStatus.installing,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
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
    });

    describe('SnapController:handleRpcRequest', () => {
      it('handles a snap RPC request', async () => {
        const messenger = getSnapControllerMessenger(undefined, false);
        const fooSnapObject = getSnapObject({
          initialPermissions: {},
          permissionName: 'fooperm',
          version: '0.0.1',
          sourceCode: MOCK_SNAP_SOURCE_CODE,
          id: 'npm:fooSnap',
          manifest: getSnapManifest(),
          enabled: true,
          status: SnapStatus.running,
        });

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                'npm:fooSnap': fooSnapObject,
              },
            },
          }),
        );

        const handleRpcRequestSpy = jest
          .spyOn(snapController, 'handleRpcRequest')
          .mockResolvedValueOnce(true);

        expect(
          await messenger.call(
            'SnapController:handleRpcRequest',
            'npm:fooSnap',
            'foo',
            {},
          ),
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
                [MOCK_SNAP_ID]: getSnapObject({
                  status: SnapStatus.installing,
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
                'npm:fooSnap': getSnapObject({
                  permissionName: 'fooperm',
                  version: '0.0.1',
                  sourceCode: MOCK_SNAP_SOURCE_CODE,
                  id: 'npm:fooSnap',
                  manifest: getSnapManifest(),
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
    });

    describe('SnapController:updateSnapState', () => {
      it(`updates the snap's state`, async () => {
        const messenger = getSnapControllerMessenger(undefined, false);

        const snapController = getSnapController(
          getSnapControllerOptions({
            messenger,
            state: {
              snaps: {
                'npm:fooSnap': getSnapObject({
                  permissionName: 'fooperm',
                  version: '0.0.1',
                  sourceCode: MOCK_SNAP_SOURCE_CODE,
                  id: 'npm:fooSnap',
                  manifest: getSnapManifest(),
                  enabled: true,
                  status: SnapStatus.installing,
                }),
              },
            },
          }),
        );

        const updateSnapStateSpy = jest.spyOn(
          snapController,
          'updateSnapState',
        );
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
                'npm:fooSnap': getSnapObject({
                  permissionName: 'fooperm',
                  version: '0.0.1',
                  sourceCode: MOCK_SNAP_SOURCE_CODE,
                  id: 'npm:fooSnap',
                  manifest: getSnapManifest(),
                  enabled: true,
                  status: SnapStatus.installing,
                }),
                'npm:fooSnap2': getSnapObject({
                  permissionName: 'fooperm2',
                  version: '0.0.1',
                  sourceCode: MOCK_SNAP_SOURCE_CODE,
                  id: 'npm:fooSnap2',
                  manifest: getSnapManifest(),
                  enabled: true,
                  status: SnapStatus.installing,
                }),
              },
            },
          }),
        );

        const updateSnapStateSpy = jest.spyOn(
          snapController,
          'updateSnapState',
        );
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

        expect(
          snapController.state.snapStates['npm:fooSnap'],
        ).not.toStrictEqual(snapController.state.snapStates['npm:fooSnap2']);
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
                [MOCK_SNAP_ID]: getSnapObject({
                  status: SnapStatus.installing,
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
    });
  });
});
