import { ControllerMessenger } from '@metamask/controllers';
import { ErrorMessageEvent } from '@metamask/snap-types';
import { IframeExecutionService } from './IframeExecutionService';
import fixJSDOMPostMessageEventSource from './testHelpers/fixJSDOMPostMessageEventSource';

// We do not use our default endowments in these tests because JSDOM doesn't
// implement all of them.

describe('IframeExecutionService', () => {
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
        endowments: [],
      });
    };

    await expect(action()).rejects.toThrow(
      /Error while running snap 'TestSnap'/u,
    );
    await iframeExecutionService.terminateAllSnaps();
    removeListener();
  });
});
