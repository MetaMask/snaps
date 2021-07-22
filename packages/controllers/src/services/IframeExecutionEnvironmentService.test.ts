import { IframeExecutionEnvironmentService } from './IframeExecutionEnvironmentService';

describe('Iframe Controller', () => {
  it('can boot', async () => {
    const webWorkerExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/',
        ),
      });
    expect(webWorkerExecutionEnvironmentService).toBeDefined();
  });
  it('can create a plugin worker and start the plugin', async () => {
    const webWorkerExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/',
        ),
      });
    const pluginName = 'foo.bar.baz';
    const response = await webWorkerExecutionEnvironmentService.executePlugin({
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });
    expect(response).toEqual('OK');
  });
});
