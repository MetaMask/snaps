import { describe, expect, it, jest } from '@jest/globals';
import { ControllerMessenger } from '@metamask/controllers';
import {
  ErrorMessageEvent,
  UnresponsiveMessageEvent,
} from '@metamask/snap-types';
import { IframeExecutionService } from './IframeExecutionService';
import fixJSDOMPostMessageEventSource from './testHelpers/fixJSDOMPostMessageEventSource';

describe('Iframe Controller', () => {
  it('can boot', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionService = new IframeExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
      iframeUrl: new URL(
        'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
      ),
    });
    expect(iframeExecutionService).toBeDefined();
    await iframeExecutionService.terminateAllSnaps();
  });

  it('can create a snap worker and start the snap', async () => {
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionService = new IframeExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
      iframeUrl: new URL(
        'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
      ),
    });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionService,
    );
    const response = await iframeExecutionService.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      // Was gonna use DEFAULT_EXPOSED_APIS here, but some are not implemented in JSDom, breaking tests.
      endowments: ['console'],
    });
    expect(response).toStrictEqual('OK');
    removeListener();
    await iframeExecutionService.terminateAllSnaps();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const iframeExecutionService = new IframeExecutionService({
      messenger: controllerMessenger.getRestricted<
        'ExecutionService',
        never,
        ErrorMessageEvent['type']
      >({
        name: 'ExecutionService',
      }),
      setupSnapProvider: () => {
        // do nothing
      },
      iframeUrl: new URL(
        'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
      ),
    });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionService,
    );
    const action = async () => {
      await iframeExecutionService.executeSnap({
        snapId: 'TestSnap',
        sourceCode: `
          throw new Error("potato");
        `,
        // Was gonna use DEFAULT_EXPOSED_APIS here, but some are not implemented in JSDom, breaking tests.
        endowments: [],
      });
    };

    await expect(action()).rejects.toThrow(
      /Error while running snap 'TestSnap'/u,
    );
    await iframeExecutionService.terminateAllSnaps();
    removeListener();
  });

  it('can handle a no ping reply', async () => {
    const messenger = new ControllerMessenger<
      never,
      UnresponsiveMessageEvent
    >().getRestricted<
      'ExecutionService',
      never,
      UnresponsiveMessageEvent['type']
    >({
      name: 'ExecutionService',
      allowedEvents: ['ExecutionService:unresponsive'],
    });

    const iframeExecutionService = new IframeExecutionService({
      messenger,
      setupSnapProvider: () => {
        // do nothing
      },
      iframeUrl: new URL(
        'https://metamask.github.io/iframe-execution-environment/0.3.2-test/',
      ),
    });
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionService,
    );
    const snapId = 'foo.bar.baz';

    await iframeExecutionService.executeSnap({
      snapId,
      sourceCode: `
        console.log('foo');
      `,
      // Was gonna use DEFAULT_EXPOSED_APIS here, but some are not implemented in JSDom, breaking tests.
      endowments: ['console'],
    });
    // prevent command from returning
    // eslint-disable-next-line jest/prefer-spy-on
    (iframeExecutionService as any)._command = jest.fn();

    // check for an error
    const promise = new Promise((resolve) => {
      messenger.subscribe('ExecutionService:unresponsive', resolve);
    });

    const result = await promise;
    expect(result).toStrictEqual(snapId);
    removeListener();
  }, 60000);
});
