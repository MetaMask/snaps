import { describe, expect, it } from '@jest/globals';
import fixJSDOMPostMessageEventSource from './testHelpers/fixJSDOMPostMessageEventSource';
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
    expect(response).toStrictEqual('OK');
    removeListener();
  });
  it('can handle a crashed plugin', async () => {
    expect.assertions(1);
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
    const action = async () => {
      await iframeExecutionEnvironmentService.executePlugin({
        pluginName: 'TestPlugin',
        sourceCode: `
          throw new Error("potato");
        `,
      });
    }
    await expect(action()).rejects.toThrow(/Error while running plugin 'TestPlugin'/)
    removeListener();
  });
});
