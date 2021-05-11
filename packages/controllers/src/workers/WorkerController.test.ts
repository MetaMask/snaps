import fs from 'fs';
import { WorkerController } from './WorkerController';

const workerCode = fs.readFileSync(
  require.resolve('@mm-snap/workers/dist/PluginWorker.js'),
  'utf8',
);

describe('Worker Controller', () => {
  it('can boot', async () => {
    const workerController = new WorkerController({
      setupWorkerConnection: () => {
        // do nothing
      },
      workerUrl: new URL('https://foo.bar.baz'),
    });
    expect(workerController).toBeDefined();
  });
  it('can create a plugin worker and get the workerId back', async () => {
    const workerController = new WorkerController({
      setupWorkerConnection: () => {
        // do nothing
      },
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    expect(
      typeof (await workerController.createPluginWorker({
        hostname: 'foobarbaz',
      })),
    ).toEqual('string');
  });
  it('can create a plugin worker and start the plugin', async () => {
    const workerController = new WorkerController({
      setupWorkerConnection: () => {
        // do nothing
      },
      workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
    });
    const pluginName = 'foo.bar.baz';
    const workerId = await workerController.createPluginWorker({
      hostname: pluginName,
    });
    const response = await workerController.startPlugin(workerId, {
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });
    expect(response).toEqual('OK');
  });
});
