import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { getPersistentState } from '@metamask/controllers';
import { WebWorkerExecutionEnvironmentService } from '../services/WebWorkerExecutionEnvironmentService';
import { ExecutionEnvironmentService } from '../services/ExecutionEnvironmentService';
import { PluginController, PluginControllerState } from './PluginController';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/PluginWorker.js'),
  'utf8',
);

describe('PluginController Controller', () => {
  it('can create a worker and plugin controller', async () => {
    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
    });

    expect(pluginController).toBeDefined();
  });

  it('can create a worker and plugin controller and add a plugin and update its state', async () => {
    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
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
  });

  it('can add a plugin and use its JSON-RPC api with a WebWorkerExecutionEnvironmentService', async () => {
    const webWorkerExecutionEnvironment =
      new WebWorkerExecutionEnvironmentService({
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
      state: {
        pluginErrors: [],
        pluginStates: {},
        inlinePluginIsRunning: false,
        plugins: {
          foo: {
            isRunning: true,
            initialPermissions: {},
            permissionName: 'fooperm',
            version: '0.0.1',
            sourceCode: 'console.log("foo")',
            name: 'foo',
          },
        },
      },
    });
    // persist the state somewhere
    const persistedState = getPersistentState<PluginControllerState>(
      firstPluginController.state,
      firstPluginController.metadata,
    );
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
      state: persistedState as unknown as PluginControllerState,
    });
    expect(secondPluginController.state.plugins.foo.isRunning).toStrictEqual(
      false,
    );
    await secondPluginController.runExistingPlugins();
    expect(secondPluginController.state.plugins.foo).toBeDefined();
    expect(secondPluginController.state.plugins.foo.isRunning).toStrictEqual(
      true,
    );
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
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
      }),
    });
    pluginController.addPluginErrors([
      {
        code: 1,
        data: {},
        message: 'error happened',
      },
    ]);

    expect(pluginController.state.pluginErrors.length > 0).toStrictEqual(true);

    pluginController.removePluginErrors([
      {
        code: 1,
        data: {},
        message: 'error happened',
      },
    ]);

    expect(pluginController.state.pluginErrors).toHaveLength(0);

    pluginController.addPluginErrors([
      {
        code: 1,
        data: {},
        message: 'error happened',
      },
    ]);

    pluginController.addPluginErrors([
      {
        code: 2,
        data: {},
        message: 'error 2',
      },
    ]);

    pluginController.removePluginErrors([
      {
        code: 1,
        data: {},
        message: 'error happened',
      },
    ]);

    expect(pluginController.state.pluginErrors).toHaveLength(1);
    expect(pluginController.state.pluginErrors[0]).toStrictEqual({
      code: 2,
      data: {},
      message: 'error 2',
    });
  });
});
