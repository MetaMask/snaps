import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { WorkerExecutionEnvironment } from '../services/WorkerExecutionEnvironment';
import { PluginController } from './PluginController';

const workerCode = fs.readFileSync(
  require.resolve('@mm-snap/workers/dist/PluginWorker.js'),
  'utf8',
);

describe('PluginController Controller', () => {
  it('can create a worker and plugin controller', async () => {
    const workerExecutionEnvironment = new WorkerExecutionEnvironment({
      setupWorkerConnection: jest.fn(),
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const pluginController = new PluginController({
      command: workerExecutionEnvironment.command.bind(
        workerExecutionEnvironment,
      ),
      createPluginEnvironment: workerExecutionEnvironment.createPluginEnvironment.bind(
        workerExecutionEnvironment,
      ),
      terminateAll: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      startPlugin: workerExecutionEnvironment.startPlugin.bind(
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

  it('can add a plugin and use its JSON-RPC api', async () => {
    const workerExecutionEnvironment = new WorkerExecutionEnvironment({
      setupWorkerConnection: jest.fn(),
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const pluginController = new PluginController({
      command: workerExecutionEnvironment.command.bind(
        workerExecutionEnvironment,
      ),
      createPluginEnvironment: workerExecutionEnvironment.createPluginEnvironment.bind(
        workerExecutionEnvironment,
      ),
      terminateAll: workerExecutionEnvironment.terminateAllPlugins.bind(
        workerExecutionEnvironment,
      ),
      terminatePlugin: workerExecutionEnvironment.terminatePlugin.bind(
        workerExecutionEnvironment,
      ),
      startPlugin: workerExecutionEnvironment.startPlugin.bind(
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
    const handle = pluginController.getRpcMessageHandler(plugin.name);
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
