import fs from 'fs';
import { WebWorkerExecutionEnvironmentService } from './WebWorkerExecutionEnvironmentService';

const workerCode = fs.readFileSync(
  require.resolve('@metamask/snap-workers/dist/PluginWorker.js'),
  'utf8',
);

describe('Worker Controller', () => {
  it('can boot', async () => {
    const webWorkerExecutionEnvironmentService =
      new WebWorkerExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        workerUrl: new URL('https://foo.bar.baz'),
      });
    expect(webWorkerExecutionEnvironmentService).toBeDefined();
  });

  it('can create a plugin worker and start the plugin', async () => {
    const webWorkerExecutionEnvironmentService =
      new WebWorkerExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        workerUrl: new URL(URL.createObjectURL(new Blob([workerCode]))),
      });
    const pluginName = 'foo.bar.baz';
    const response = await webWorkerExecutionEnvironmentService.executePlugin({
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });
    expect(response).toStrictEqual('OK');
  });
});
