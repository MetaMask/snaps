import { describe, expect, it, jest } from '@jest/globals';
import { ControllerMessenger } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import fixJSDOMPostMessageEventSource from './testHelpers/fixJSDOMPostMessageEventSource';
import { IframeExecutionEnvironmentService } from './IframeExecutionEnvironmentService';

describe('Iframe Controller', () => {
  it('can boot', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        messenger: controllerMessenger.getRestricted<
          'ServiceMessenger',
          never,
          ErrorMessageEvent['type']
        >({
          name: 'ServiceMessenger',
        }),
        setupPluginProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/',
        ),
      });
    expect(iframeExecutionEnvironmentService).toBeDefined();
    await iframeExecutionEnvironmentService.terminateAllPlugins();
  });

  it('can create a plugin worker and start the plugin', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        messenger: controllerMessenger.getRestricted<
          'ServiceMessenger',
          never,
          ErrorMessageEvent['type']
        >({
          name: 'ServiceMessenger',
        }),
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
    await iframeExecutionEnvironmentService.terminateAllPlugins();
  });

  it('can handle a crashed plugin', async () => {
    expect.assertions(1);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        messenger: controllerMessenger.getRestricted<
          'ServiceMessenger',
          never,
          ErrorMessageEvent['type']
        >({
          name: 'ServiceMessenger',
        }),
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
    };

    await expect(action()).rejects.toThrow(
      /Error while running plugin 'TestPlugin'/u,
    );
    await iframeExecutionEnvironmentService.terminateAllPlugins();
    removeListener();
  });

  it('can handle a no ping reply', async () => {
    const messenger = new ControllerMessenger<
      never,
      UnresponsiveMessageEvent
    >().getRestricted<
      'ServiceMessenger',
      never,
      UnresponsiveMessageEvent['type']
    >({
      name: 'ServiceMessenger',
      allowedEvents: ['ServiceMessenger:unresponsive'],
    });

    const iframeExecutionEnvironmentService =
      new IframeExecutionEnvironmentService({
        messenger,
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
    const pluginName = 'foo.bar.baz';

    await iframeExecutionEnvironmentService.executePlugin({
      pluginName,
      sourceCode: `
        console.log('foo');
      `,
    });
    // prevent command from returning
    // eslint-disable-next-line jest/prefer-spy-on
    (iframeExecutionEnvironmentService as any)._command = jest.fn();

    // check for an error
    const promise = new Promise((resolve) => {
      messenger.subscribe('ServiceMessenger:unresponsive', resolve);
    });

    const result = await promise;
    expect(result).toStrictEqual(pluginName);
    removeListener();
  }, 60000);
});
