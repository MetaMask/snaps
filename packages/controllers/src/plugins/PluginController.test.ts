import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { WebWorkerExecutionEnvironmentService } from '../services/WebWorkerExecutionEnvironmentService';
import { ExecutionEnvironmentService } from '../services/ExecutionEnvironmentService';
import { PluginController } from './PluginController';

const workerCode = fs.readFileSync(
  require.resolve('@mm-snap/workers/dist/PluginWorker.js'),
  'utf8',
);

describe('PluginController Controller', () => {
  it('can create a worker and plugin controller', async () => {
    const workerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        setupWorkerConnection: jest.fn(),
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
      getRpcMessageHandler: workerExecutionEnvironment.getRpcMessageHandler.bind(
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
      state: {
        inlinePluginIsRunning: false,
        pluginStates: {},
        plugins: {},
      },
    });
    expect(pluginController).toBeDefined();
  });

  it('can add a plugin and use its JSON-RPC api with a WebWorkerExecutionEnvironmentService', async () => {
    const webWorkerExecutionEnvironment = new WebWorkerExecutionEnvironmentService(
      {
        setupWorkerConnection: jest.fn(),
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      },
    );
    const pluginController = new PluginController({
      terminateAllPlugins: webWorkerExecutionEnvironment.terminateAllPlugins.bind(
        webWorkerExecutionEnvironment,
      ),
      terminatePlugin: webWorkerExecutionEnvironment.terminatePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      executePlugin: webWorkerExecutionEnvironment.executePlugin.bind(
        webWorkerExecutionEnvironment,
      ),
      getRpcMessageHandler: webWorkerExecutionEnvironment.getRpcMessageHandler.bind(
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
      state: {
        inlinePluginIsRunning: false,
        pluginStates: {},
        plugins: {},
      },
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
    expect(result).toEqual('test1');
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
      state: {
        inlinePluginIsRunning: false,
        pluginStates: {},
        plugins: {},
      },
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
    expect(result).toEqual('test1');
  });
});
