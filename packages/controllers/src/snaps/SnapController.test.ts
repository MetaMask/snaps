import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { getPersistentState } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { WebWorkerExecutionEnvironmentService } from '../services/WebWorkerExecutionEnvironmentService';
import { ExecutionEnvironmentService } from '../services/ExecutionEnvironmentService';
import {
  SnapController,
  SnapControllerActions,
  SnapControllerState,
  SnapStatus,
} from './SnapController';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/SnapWorker.js'),
  'utf8',
);

describe('SnapController Controller', () => {
  it('can create a worker and snap controller', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const snapController = new SnapController({
      terminateAllSnaps: workerExecutionEnvironment.terminateAllSnaps.bind(
        workerExecutionEnvironment,
      ),
      terminateSnap: workerExecutionEnvironment.terminateSnap.bind(
        workerExecutionEnvironment,
      ),
      executeSnap: workerExecutionEnvironment.executeSnap.bind(
        workerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        workerExecutionEnvironment.getRpcMessageHandler.bind(
          workerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    expect(snapController).toBeDefined();
    snapController.destroy();
  });

  it('can create a worker and snap controller and add a snap and update its state', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const snapController = new SnapController({
      terminateAllSnaps: workerExecutionEnvironment.terminateAllSnaps.bind(
        workerExecutionEnvironment,
      ),
      terminateSnap: workerExecutionEnvironment.terminateSnap.bind(
        workerExecutionEnvironment,
      ),
      executeSnap: workerExecutionEnvironment.executeSnap.bind(
        workerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        workerExecutionEnvironment.getRpcMessageHandler.bind(
          workerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });
    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    await snapController.startSnap(snap.name);
    await snapController.updateSnapState(snap.name, { hello: 'world' });
    const snapState = await snapController.getSnapState(snap.name);
    expect(snapState).toStrictEqual({ hello: 'world' });
    expect(snapController.state.snapStates).toStrictEqual({
      TestSnap: {
        hello: 'world',
      },
    });
    snapController.destroy();
  });

  it('can add a snap and use its JSON-RPC api with a WebWorkerExecutionEnvironmentService', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const snapController = new SnapController({
      terminateAllSnaps: webWorkerExecutionEnvironment.terminateAllSnaps.bind(
        webWorkerExecutionEnvironment,
      ),
      terminateSnap: webWorkerExecutionEnvironment.terminateSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      executeSnap: webWorkerExecutionEnvironment.executeSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
          webWorkerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          wallet.request({method: 'setState'})
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    await snapController.startSnap(snap.name);
    const handle = await snapController.getRpcMessageHandler(snap.name);
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

  it('can add a snap and use its JSON-RPC api with a stub execution env service', async () => {
    class ExecutionEnvironmentStub implements ExecutionEnvironmentService {
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

    const executionEnvironmentStub = new ExecutionEnvironmentStub();
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const snapController = new SnapController({
      terminateAllSnaps: executionEnvironmentStub.terminateAllSnaps.bind(
        executionEnvironmentStub,
      ),
      terminateSnap: executionEnvironmentStub.terminateSnap.bind(
        executionEnvironmentStub,
      ),
      executeSnap: executionEnvironmentStub.executeSnap.bind(
        executionEnvironmentStub,
      ),
      getRpcMessageHandler: executionEnvironmentStub.getRpcMessageHandler.bind(
        executionEnvironmentStub,
      ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    await snapController.startSnap(snap.name);
    const handle = await snapController.getRpcMessageHandler(snap.name);
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

  it('errors if attempting to start a snap that was already started', async () => {
    const name = 'fooSnap';
    const manifest = {
      name,
      version: '1.0.0',
      web3Wallet: {
        initialPermissions: {
          eth_accounts: {},
        },
      },
    };
    const sourceCode = 'foo';

    const mockExecuteSnap = jest.fn();

    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const snapController = new SnapController({
      terminateAllSnaps: jest.fn(),
      terminateSnap: jest.fn(),
      executeSnap: mockExecuteSnap,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    await snapController.add({ name, manifest, sourceCode });
    await snapController.startSnap(name);
    await expect(snapController.startSnap(name)).rejects.toThrow(
      /^Snap "fooSnap" is already started.$/u,
    );
    expect(mockExecuteSnap).toHaveBeenCalledTimes(1);
    expect(mockExecuteSnap).toHaveBeenCalledWith({
      snapName: name,
      sourceCode,
    });
  });

  it('can not delete existing snaps when using runExistinSnaps with a hydrated state', async () => {
    const mockExecuteSnap = jest.fn();

    const controllerMessenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();

    const firstSnapController = new SnapController({
      terminateAllSnaps: jest.fn(),
      terminateSnap: jest.fn(),
      executeSnap: mockExecuteSnap,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: controllerMessenger.getRestricted({
        name: 'SnapController',
        allowedEvents: [
          'ServiceMessenger:unhandledError',
          'ServiceMessenger:unresponsive',
        ],
      }),
      state: {
        snapErrors: {},
        snapStates: {},
        inlineSnapIsRunning: false,
        snaps: {
          foo: {
            initialPermissions: {},
            permissionName: 'fooperm',
            version: '0.0.1',
            sourceCode: 'console.log("foo")',
            name: 'foo',
            enabled: true,
            status: SnapStatus.idle,
          },
        },
      },
    });

    // persist the state somewhere
    const persistedState = getPersistentState<SnapControllerState>(
      firstSnapController.state,
      firstSnapController.metadata,
    );
    const secondControllerMessenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    // create a new controller
    const secondSnapController = new SnapController({
      terminateAllSnaps: jest.fn(),
      terminateSnap: jest.fn(),
      executeSnap: mockExecuteSnap,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: secondControllerMessenger.getRestricted({
        name: 'SnapController',
        allowedEvents: [
          'ServiceMessenger:unhandledError',
          'ServiceMessenger:unresponsive',
        ],
      }),
      state: persistedState as unknown as SnapControllerState,
    });
    expect(secondSnapController.isRunning('foo')).toStrictEqual(false);
    await secondSnapController.runExistingSnaps();
    expect(secondSnapController.state.snaps.foo).toBeDefined();
    expect(secondSnapController.isRunning('foo')).toStrictEqual(true);
    firstSnapController.destroy();
    secondSnapController.destroy();
  });

  it('can add errors to the SnapControllers state', async () => {
    class ExecutionEnvironmentStub implements ExecutionEnvironmentService {
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

    const executionEnvironmentStub = new ExecutionEnvironmentStub();

    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const snapController = new SnapController({
      terminateAllSnaps: executionEnvironmentStub.terminateAllSnaps.bind(
        executionEnvironmentStub,
      ),
      terminateSnap: executionEnvironmentStub.terminateSnap.bind(
        executionEnvironmentStub,
      ),
      executeSnap: executionEnvironmentStub.executeSnap.bind(
        executionEnvironmentStub,
      ),
      getRpcMessageHandler: executionEnvironmentStub.getRpcMessageHandler.bind(
        executionEnvironmentStub,
      ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });
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

  it('can handle an error event on the controller messenger', async () => {
    const controllerMessenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    const serviceMessenger = controllerMessenger.getRestricted({
      name: 'ServiceMessenger',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const snapControllerMessenger = controllerMessenger.getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger: serviceMessenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const snapController = new SnapController({
      terminateAllSnaps: workerExecutionEnvironment.terminateAllSnaps.bind(
        workerExecutionEnvironment,
      ),
      terminateSnap: workerExecutionEnvironment.terminateSnap.bind(
        workerExecutionEnvironment,
      ),
      executeSnap: workerExecutionEnvironment.executeSnap.bind(
        workerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        workerExecutionEnvironment.getRpcMessageHandler.bind(
          workerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: snapControllerMessenger,
    });
    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });
    await snapController.startSnap(snap.name);

    // defer
    setTimeout(() => {
      controllerMessenger.publish(
        'ServiceMessenger:unhandledError',
        snap.name,
        {
          message: 'foo',
          code: 123,
        },
      );
    }, 100);

    await new Promise((resolve) => {
      snapControllerMessenger.subscribe(
        'ServiceMessenger:unhandledError',
        () => {
          const localSnap = snapController.get(snap.name);
          expect(localSnap.status).toStrictEqual('crashed');
          resolve(undefined);
          snapController.destroy();
        },
      );
    });
  });

  it('can handle an unresponsive event on the controller messenger', async () => {
    const controllerMessenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    const serviceMessenger = controllerMessenger.getRestricted({
      name: 'ServiceMessenger',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const snapControllerMessenger = controllerMessenger.getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger: serviceMessenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const snapController = new SnapController({
      terminateAllSnaps: workerExecutionEnvironment.terminateAllSnaps.bind(
        workerExecutionEnvironment,
      ),
      terminateSnap: workerExecutionEnvironment.terminateSnap.bind(
        workerExecutionEnvironment,
      ),
      executeSnap: workerExecutionEnvironment.executeSnap.bind(
        workerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        workerExecutionEnvironment.getRpcMessageHandler.bind(
          workerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: snapControllerMessenger,
    });
    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });
    await snapController.startSnap(snap.name);

    // defer
    setTimeout(() => {
      controllerMessenger.publish('ServiceMessenger:unresponsive', snap.name);
    }, 1);

    await new Promise((resolve) => {
      controllerMessenger.subscribe(
        'ServiceMessenger:unresponsive',
        async (snapName: string) => {
          const localSnap = snapController.get(snapName);
          expect(localSnap.status).toStrictEqual('crashed');
          resolve(undefined);
          snapController.destroy();
        },
      );
    });
  }, 3000);

  it('can add a snap and use its JSON-RPC api and then get stopped from idling too long', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const snapController = new SnapController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllSnaps: webWorkerExecutionEnvironment.terminateAllSnaps.bind(
        webWorkerExecutionEnvironment,
      ),
      terminateSnap: webWorkerExecutionEnvironment.terminateSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      executeSnap: webWorkerExecutionEnvironment.executeSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
          webWorkerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          wallet.request({method: 'setState'})
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    await snapController.startSnap(snap.name);
    const handle = await snapController.getRpcMessageHandler(snap.name);
    if (!handle) {
      throw Error('rpc handler not found');
    }

    await handle('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });

    await new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'stopped',
    );
  });

  it('can add a snap and see its status', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const snapController = new SnapController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllSnaps: webWorkerExecutionEnvironment.terminateAllSnaps.bind(
        webWorkerExecutionEnvironment,
      ),
      terminateSnap: webWorkerExecutionEnvironment.terminateSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      executeSnap: webWorkerExecutionEnvironment.executeSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
          webWorkerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          wallet.request({method: 'setState'})
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    await snapController.startSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'running',
    );

    await snapController.stopSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'stopped',
    );
  });

  it('can add a snap and stop it and have it start on-demand', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const snapController = new SnapController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllSnaps: webWorkerExecutionEnvironment.terminateAllSnaps.bind(
        webWorkerExecutionEnvironment,
      ),
      terminateSnap: webWorkerExecutionEnvironment.terminateSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      executeSnap: webWorkerExecutionEnvironment.executeSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
          webWorkerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          wallet.request({method: 'setState'})
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    const handler = await snapController.getRpcMessageHandler(snap.name);

    await snapController.startSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'running',
    );

    await snapController.stopSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'stopped',
    );

    const results = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });
    expect(results).toStrictEqual('test1');
  });

  it('can add a snap disable/enable it and still get a response from method "test"', async () => {
    const messenger = new ControllerMessenger<
      SnapControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'SnapController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupSnapProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const snapController = new SnapController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllSnaps: webWorkerExecutionEnvironment.terminateAllSnaps.bind(
        webWorkerExecutionEnvironment,
      ),
      terminateSnap: webWorkerExecutionEnvironment.terminateSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      executeSnap: webWorkerExecutionEnvironment.executeSnap.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler:
        webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
          webWorkerExecutionEnvironment,
        ),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    const snap = await snapController.add({
      name: 'TestSnap',
      sourceCode: `
        wallet.registerRpcMessageHandler(async (origin, request) => {
          const {method, params, id} = request;
          wallet.request({method: 'setState'})
          return method + id;
        });
      `,
      manifest: {
        web3Wallet: {
          initialPermissions: {},
        },
        version: '0.0.0-development',
      },
    });

    const handler = await snapController.getRpcMessageHandler(snap.name);

    await snapController.startSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'running',
    );

    snapController.disableSnap(snap.name);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'stopped',
    );

    await expect(snapController.startSnap(snap.name)).rejects.toThrow(
      /^Snap "TestSnap" is disabled.$/u,
    );

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/^Snap "TestSnap" is disabled.$/u);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'stopped',
    );

    expect(snapController.state.snaps[snap.name].enabled).toStrictEqual(false);

    snapController.enableSnap(snap.name);

    const results = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });

    expect(snapController.state.snaps[snap.name].enabled).toStrictEqual(true);

    expect(snapController.state.snaps[snap.name].status).toStrictEqual(
      'running',
    );

    expect(results).toStrictEqual('test1');
  });
});
