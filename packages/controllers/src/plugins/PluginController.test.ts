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
  PluginController,
  PluginControllerActions,
  PluginControllerState,
  PluginStatus,
} from './PluginController';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/PluginWorker.js'),
  'utf8',
);

describe('PluginController Controller', () => {
  it('can create a worker and plugin controller', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const pluginController = new PluginController({
      terminateAllPlugins: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      executePlugin: workerExecutionEnvironment.executePlugin.bind(
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

    expect(pluginController).toBeDefined();
    pluginController.destroy();
  });

  it('can create a worker and plugin controller and add a plugin and update its state', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const pluginController = new PluginController({
      terminateAllPlugins: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      executePlugin: workerExecutionEnvironment.executePlugin.bind(
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
    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    await pluginController.startPlugin(plugin.name);
    await pluginController.updatePluginState(plugin.name, { hello: 'world' });
    const pluginState = await pluginController.getPluginState(plugin.name);
    expect(pluginState).toStrictEqual({ hello: 'world' });
    expect(pluginController.state.pluginStates).toStrictEqual({
      TestPlugin: {
        hello: 'world',
      },
    });
    pluginController.destroy();
  });

  it('can add a plugin and use its JSON-RPC api with a WebWorkerExecutionEnvironmentService', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginController = new PluginController({
      terminateAllPlugins:
        webWorkerExecutionEnvironment.terminateAllPlugins.bind(
          webWorkerExecutionEnvironment,
        ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    await pluginController.startPlugin(plugin.name);
    const handle = await pluginController.getRpcMessageHandler(plugin.name);
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
    pluginController.destroy();
  });

  it('can add a plugin and use its JSON-RPC api with a stub execution env service', async () => {
    class ExecutionEnvironmentStub implements ExecutionEnvironmentService {
      async terminateAllPlugins() {
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

      async executePlugin() {
        return 'some-unique-id';
      }

      async terminatePlugin() {
        // empty stub
      }
    }

    const executionEnvironmentStub = new ExecutionEnvironmentStub();
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const pluginController = new PluginController({
      terminateAllPlugins: executionEnvironmentStub.terminateAllPlugins.bind(
        executionEnvironmentStub,
      ),
      terminatePlugin: executionEnvironmentStub.terminatePlugin.bind(
        executionEnvironmentStub,
      ),
      executePlugin: executionEnvironmentStub.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    await pluginController.startPlugin(plugin.name);
    const handle = await pluginController.getRpcMessageHandler(plugin.name);
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
    pluginController.destroy();
  });

  it('errors if attempting to start a plugin that was already started', async () => {
    const name = 'fooPlugin';
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

    const mockExecutePlugin = jest.fn();

    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const pluginController = new PluginController({
      terminateAllPlugins: jest.fn(),
      terminatePlugin: jest.fn(),
      executePlugin: mockExecutePlugin,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger,
    });

    await pluginController.add({ name, manifest, sourceCode });
    await pluginController.startPlugin(name);
    await expect(pluginController.startPlugin(name)).rejects.toThrow(
      /^Plugin "fooPlugin" is already started.$/u,
    );
    expect(mockExecutePlugin).toHaveBeenCalledTimes(1);
    expect(mockExecutePlugin).toHaveBeenCalledWith({
      pluginName: name,
      sourceCode,
    });
  });

  it('can not delete existing plugins when using runExistinPlugins with a hydrated state', async () => {
    const mockExecutePlugin = jest.fn();

    const controllerMessenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();

    const firstPluginController = new PluginController({
      terminateAllPlugins: jest.fn(),
      terminatePlugin: jest.fn(),
      executePlugin: mockExecutePlugin,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: controllerMessenger.getRestricted({
        name: 'PluginController',
        allowedEvents: [
          'ServiceMessenger:unhandledError',
          'ServiceMessenger:unresponsive',
        ],
      }),
      state: {
        pluginErrors: {},
        pluginStates: {},
        inlinePluginIsRunning: false,
        plugins: {
          foo: {
            initialPermissions: {},
            permissionName: 'fooperm',
            version: '0.0.1',
            sourceCode: 'console.log("foo")',
            name: 'foo',
            enabled: true,
            status: PluginStatus.idle,
          },
        },
      },
    });

    // persist the state somewhere
    const persistedState = getPersistentState<PluginControllerState>(
      firstPluginController.state,
      firstPluginController.metadata,
    );
    const secondControllerMessenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    // create a new controller
    const secondPluginController = new PluginController({
      terminateAllPlugins: jest.fn(),
      terminatePlugin: jest.fn(),
      executePlugin: mockExecutePlugin,
      getRpcMessageHandler: jest.fn(),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: secondControllerMessenger.getRestricted({
        name: 'PluginController',
        allowedEvents: [
          'ServiceMessenger:unhandledError',
          'ServiceMessenger:unresponsive',
        ],
      }),
      state: persistedState as unknown as PluginControllerState,
    });
    expect(secondPluginController.isRunning('foo')).toStrictEqual(false);
    await secondPluginController.runExistingPlugins();
    expect(secondPluginController.state.plugins.foo).toBeDefined();
    expect(secondPluginController.isRunning('foo')).toStrictEqual(true);
    firstPluginController.destroy();
    secondPluginController.destroy();
  });

  it('can add errors to the PluginControllers state', async () => {
    class ExecutionEnvironmentStub implements ExecutionEnvironmentService {
      async terminateAllPlugins() {
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

      async executePlugin() {
        return 'some-unique-id';
      }

      async terminatePlugin() {
        // empty stub
      }
    }

    const executionEnvironmentStub = new ExecutionEnvironmentStub();

    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const pluginController = new PluginController({
      terminateAllPlugins: executionEnvironmentStub.terminateAllPlugins.bind(
        executionEnvironmentStub,
      ),
      terminatePlugin: executionEnvironmentStub.terminatePlugin.bind(
        executionEnvironmentStub,
      ),
      executePlugin: executionEnvironmentStub.executePlugin.bind(
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
    pluginController.addPluginError({
      code: 1,
      data: {},
      message: 'error happened',
    });

    const arrayOfErrors = Object.entries(pluginController.state.pluginErrors);

    expect(arrayOfErrors.length > 0).toStrictEqual(true);

    pluginController.removePluginError(arrayOfErrors[0][0]);

    expect(Object.entries(pluginController.state.pluginErrors)).toHaveLength(0);

    pluginController.addPluginError({
      code: 1,
      data: {},
      message: 'error happened',
    });

    pluginController.addPluginError({
      code: 2,
      data: {},
      message: 'error 2',
    });

    pluginController.removePluginError(
      Object.entries(pluginController.state.pluginErrors)[0][0],
    );

    expect(Object.entries(pluginController.state.pluginErrors)).toHaveLength(1);
    expect(
      Object.entries(pluginController.state.pluginErrors)[0][1],
    ).toStrictEqual(
      expect.objectContaining({
        code: 2,
        data: {},
        message: 'error 2',
      }),
    );
    pluginController.destroy();
  });

  it('can handle an error event on the controller messenger', async () => {
    const controllerMessenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    const serviceMessenger = controllerMessenger.getRestricted({
      name: 'ServiceMessenger',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const pluginControllerMessenger = controllerMessenger.getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger: serviceMessenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const pluginController = new PluginController({
      terminateAllPlugins: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      executePlugin: workerExecutionEnvironment.executePlugin.bind(
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
      messenger: pluginControllerMessenger,
    });
    const plugin = await pluginController.add({
      name: 'TestPlugin',
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
    await pluginController.startPlugin(plugin.name);

    // defer
    setTimeout(() => {
      controllerMessenger.publish(
        'ServiceMessenger:unhandledError',
        plugin.name,
        {
          message: 'foo',
          code: 123,
        },
      );
    }, 100);

    await new Promise((resolve) => {
      pluginControllerMessenger.subscribe(
        'ServiceMessenger:unhandledError',
        () => {
          const localPlugin = pluginController.get(plugin.name);
          expect(localPlugin.status).toStrictEqual('crashed');
          resolve(undefined);
          pluginController.destroy();
        },
      );
    });
  });

  it('can handle an unresponsive event on the controller messenger', async () => {
    const controllerMessenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >();
    const serviceMessenger = controllerMessenger.getRestricted({
      name: 'ServiceMessenger',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const pluginControllerMessenger = controllerMessenger.getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });

    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        messenger: serviceMessenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const pluginController = new PluginController({
      terminateAllPlugins: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      executePlugin: workerExecutionEnvironment.executePlugin.bind(
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
      messenger: pluginControllerMessenger,
    });
    const plugin = await pluginController.add({
      name: 'TestPlugin',
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
    await pluginController.startPlugin(plugin.name);

    // defer
    setTimeout(() => {
      controllerMessenger.publish('ServiceMessenger:unresponsive', plugin.name);
    }, 1);

    await new Promise((resolve) => {
      controllerMessenger.subscribe(
        'ServiceMessenger:unresponsive',
        async (pluginName: string) => {
          const localPlugin = pluginController.get(pluginName);
          expect(localPlugin.status).toStrictEqual('crashed');
          resolve(undefined);
          pluginController.destroy();
        },
      );
    });
  }, 3000);

  it('can add a plugin and use its JSON-RPC api and then get stopped from idling too long', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginController = new PluginController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllPlugins:
        webWorkerExecutionEnvironment.terminateAllPlugins.bind(
          webWorkerExecutionEnvironment,
        ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    await pluginController.startPlugin(plugin.name);
    const handle = await pluginController.getRpcMessageHandler(plugin.name);
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

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'stopped',
    );
  });

  it('can add a plugin and see its status', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginController = new PluginController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllPlugins:
        webWorkerExecutionEnvironment.terminateAllPlugins.bind(
          webWorkerExecutionEnvironment,
        ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    await pluginController.startPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'running',
    );

    await pluginController.stopPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'stopped',
    );
  });

  it('can add a plugin and stop it and have it start on-demand', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginController = new PluginController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllPlugins:
        webWorkerExecutionEnvironment.terminateAllPlugins.bind(
          webWorkerExecutionEnvironment,
        ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    const handler = await pluginController.getRpcMessageHandler(plugin.name);

    await pluginController.startPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'running',
    );

    await pluginController.stopPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
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

  it('can add a plugin disable/enable it and still get a response from method "test"', async () => {
    const messenger = new ControllerMessenger<
      PluginControllerActions,
      ErrorMessageEvent | UnresponsiveMessageEvent
    >().getRestricted({
      name: 'PluginController',
      allowedEvents: [
        'ServiceMessenger:unhandledError',
        'ServiceMessenger:unresponsive',
      ],
    });
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
        messenger,
        setupPluginProvider: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginController = new PluginController({
      idleTimeCheckInterval: 1000,
      maxIdleTime: 2000,
      terminateAllPlugins:
        webWorkerExecutionEnvironment.terminateAllPlugins.bind(
          webWorkerExecutionEnvironment,
        ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
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

    const plugin = await pluginController.add({
      name: 'TestPlugin',
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

    const handler = await pluginController.getRpcMessageHandler(plugin.name);

    await pluginController.startPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'running',
    );

    await pluginController.stopPlugin(plugin.name);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'stopped',
    );

    pluginController.disablePlugin(plugin.name);

    await expect(
      handler('foo.com', {
        jsonrpc: '2.0',
        method: 'test',
        params: {},
        id: 1,
      }),
    ).rejects.toThrow(/^Plugin "TestPlugin" is disabled.$/u);

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'stopped',
    );

    expect(pluginController.state.plugins[plugin.name].enabled).toStrictEqual(
      false,
    );

    pluginController.enablePlugin(plugin.name);

    const results = await handler('foo.com', {
      jsonrpc: '2.0',
      method: 'test',
      params: {},
      id: 1,
    });

    expect(pluginController.state.plugins[plugin.name].enabled).toStrictEqual(
      true,
    );

    expect(pluginController.state.plugins[plugin.name].status).toStrictEqual(
      'running',
    );

    expect(results).toStrictEqual('test1');
  });
});
