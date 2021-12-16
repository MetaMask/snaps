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
        setupSnapProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
        ),
      });
    expect(iframeExecutionEnvironmentService).toBeDefined();
    await iframeExecutionEnvironmentService.terminateAllSnaps();
  });

  it('can create a snap worker and start the snap', async () => {
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
        setupSnapProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
        ),
      });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionEnvironmentService,
    );
    const response = await iframeExecutionEnvironmentService.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
    });
    expect(response).toStrictEqual('OK');
    removeListener();
    await iframeExecutionEnvironmentService.terminateAllSnaps();
  });

  it('can handle a crashed snap', async () => {
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
        setupSnapProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
        ),
      });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionEnvironmentService,
    );
    const action = async () => {
      await iframeExecutionEnvironmentService.executeSnap({
        snapId: 'TestSnap',
        sourceCode: `
          throw new Error("potato");
        `,
      });
    };

    await expect(action()).rejects.toThrow(
      /Error while running snap 'TestSnap'/u,
    );
    await iframeExecutionEnvironmentService.terminateAllSnaps();
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
        setupSnapProvider: () => {
          // do nothing
        },
        iframeUrl: new URL(
          'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
        ),
      });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionEnvironmentService,
    );
    const snapId = 'foo.bar.baz';

    await iframeExecutionEnvironmentService.executeSnap({
      snapId,
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
    expect(result).toStrictEqual(snapId);
    removeListener();
  }, 60000);
});
