import { ControllerMessenger } from '@metamask/controllers';
import { ErrorMessageEvent } from '@metamask/snap-types';
import { IframeExecutionService } from './IframeExecutionService';
import { stop as stopServer, start as startServer } from './testHelpers/server';

// We do not use our default endowments in these tests because JSDOM doesn't
// implement all of them.

const iframeUrl = new URL('http://localhost:6363');

describe('IframeExecutionService', () => {
  // The tests start running before the server is ready if we dont use the done callback.
  // eslint-disable-next-line jest/no-done-callback
  beforeAll(async (done) => {
    await startServer();
    done();
  });

  // eslint-disable-next-line jest/no-done-callback
  afterAll(async (done) => {
    await stopServer();
    done();
  });

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
      iframeUrl,
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
      iframeUrl,
    });
    const response = await iframeExecutionService.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toStrictEqual('OK');
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
      iframeUrl,
    });
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
  });
});
