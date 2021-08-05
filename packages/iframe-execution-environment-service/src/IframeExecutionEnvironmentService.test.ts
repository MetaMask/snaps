import { describe, it, expect } from '@jest/globals';
import fixJSDOMPostMessageEventSource from './helpers/fixJSDOMPostMessageEventSource';
import { IframeExecutionEnvironmentService } from './IframeExecutionEnvironmentService';

describe('Iframe Controller', () => {
  it('can boot', async () => {
    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/',
        ),
      });
    iframeExecutionEnvironmentService.terminateAllPlugins();
    expect(iframeExecutionEnvironmentService).toBeDefined();
  });
  it('can create a plugin worker and start the plugin', async () => {
    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        setupPluginProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/',
        ),
      });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionEnvironmentService,
    );
    const response = await iframeExecutionEnvironmentService.executePlugin({
      pluginName: 'TestPlugin',
      sourceCode: `
        console.log('foo');
      `,
    });
    expect(response).toEqual('OK');
    removeListener();
  });
});
