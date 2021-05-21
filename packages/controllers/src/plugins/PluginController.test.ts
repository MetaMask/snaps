import fs from 'fs';
import { ControllerMessenger } from '@metamask/controllers/dist/ControllerMessenger';
import { WorkerController } from '../workers/WorkerController';
import { PluginController } from './PluginController';

const workerCode = fs.readFileSync(
  require.resolve('@mm-snap/workers/dist/PluginWorker.js'),
  'utf8',
);

describe('PluginController Controller', () => {
  it('can create a worker and plugin controller', async () => {
    const workerController = new WorkerController({
      setupWorkerConnection: jest.fn(),
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const pluginController = new PluginController({
      command: workerController.command.bind(workerController),
      createPluginWorker: workerController.createPluginWorker.bind(
        workerController,
      ),
      terminateAll: workerController.terminateAll.bind(workerController),
      terminateWorkerOf: workerController.terminateWorkerOf.bind(
        workerController,
      ),
      startPlugin: workerController.startPlugin.bind(workerController),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
        allowedActions: [],
        allowedEvents: [],
      }),
      state: {
        pluginStates: {},
        plugins: {},
      },
      metadata: {
        pluginStates: {
          persist: false,
          anonymous: false,
        },
        plugins: {
          persist: false,
          anonymous: false,
        },
      },
    });
    expect(pluginController).toBeDefined();
  });
  it('can add a plugin and use its JSON-RPC api', async () => {
    const workerController = new WorkerController({
      setupWorkerConnection: jest.fn(),
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const pluginController = new PluginController({
      command: workerController.command.bind(workerController),
      createPluginWorker: workerController.createPluginWorker.bind(
        workerController,
      ),
      terminateAll: workerController.terminateAll.bind(workerController),
      terminateWorkerOf: workerController.terminateWorkerOf.bind(
        workerController,
      ),
      startPlugin: workerController.startPlugin.bind(workerController),
      removeAllPermissionsFor: jest.fn(),
      getPermissions: jest.fn(),
      hasPermission: jest.fn(),
      requestPermissions: jest.fn(),
      closeAllConnections: jest.fn(),
      messenger: new ControllerMessenger<any, any>().getRestricted({
        name: 'PluginController',
        allowedActions: [],
        allowedEvents: [],
      }),
      state: {
        pluginStates: {},
        plugins: {},
      },
      metadata: {
        pluginStates: {
          persist: false,
          anonymous: false,
        },
        plugins: {
          persist: false,
          anonymous: false,
        },
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
