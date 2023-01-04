import { createService } from '@metamask/snaps-controllers/test-utils';
import { HandlerType } from '@metamask/snaps-utils';

import { IframeExecutionService } from './IframeExecutionService';
import fixJSDOMPostMessageEventSource from './test/fixJSDOMPostMessageEventSource';
import {
  PORT as serverPort,
  start as startServer,
  stop as stopServer,
} from './test/server';

// We do not use our default endowments in these tests because JSDOM doesn't
// implement all of them.

const iframeUrl = new URL(`http://localhost:${serverPort}`);

const createIFrameService = () => {
  const { service, ...rest } = createService(IframeExecutionService, {
    iframeUrl,
  });

  const removeListener = fixJSDOMPostMessageEventSource(service);
  return { service, removeListener, ...rest };
};

jest.mock('@metamask/snaps-utils', () => {
  const actual = jest.requireActual('@metamask/snaps-utils');
  return {
    ...actual,
    createWindow: async (uri: string, jobId: string) => {
      const result = await actual.createWindow(uri, jobId);
      const scriptElement = result.document.createElement('script');

      if (!scriptElement) {
        return result;
      }

      // Fix the inside window.
      scriptElement.textContent = `
        window.addEventListener('message', (postMessageEvent) => {
          if (postMessageEvent.source === null && !postMessageEvent.origin) {
            let source;
            let postMessageEventOrigin;
            if (postMessageEvent.data.target === 'child') {
              source = window.parent;
              postMessageEventOrigin = '*';
            } else if (postMessageEvent.data.target === 'parent') {
              source = window;
              postMessageEventOrigin = window.location.origin;
            }
            if (postMessageEvent.data.target) {
              postMessageEvent.stopImmediatePropagation();
              const args = Object.assign({
                ...postMessageEvent,
                data: postMessageEvent.data,
                source,
                origin: postMessageEventOrigin,
              });
              const postMessageEventWithOrigin = new MessageEvent(
                'message',
                args,
              );
              window.dispatchEvent(postMessageEventWithOrigin);
            }
          }
        });
      `;
      result.document.body.appendChild(scriptElement);

      return result;
    },
  };
});

describe('IframeExecutionService', () => {
  // The tests start running before the server is ready if we don't use the done callback.
  // eslint-disable-next-line jest/no-done-callback
  beforeAll((done) => {
    startServer().then(done).catch(done.fail);
  });

  // eslint-disable-next-line jest/no-done-callback
  afterAll((done) => {
    stopServer().then(done).catch(done.fail);
  });

  it('can boot', async () => {
    const { service, removeListener } = createIFrameService();
    expect(service).toBeDefined();
    await service.terminateAllSnaps();
    removeListener();
  });

  it('can create a snap worker and start the snap', async () => {
    const { service, removeListener } = createIFrameService();
    const response = await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toBe('OK');
    await service.terminateAllSnaps();
    removeListener();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const { service, removeListener } = createIFrameService();
    const action = async () => {
      await service.executeSnap({
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
    await service.terminateAllSnaps();
    removeListener();
  });

  it('can detect outbound requests', async () => {
    const blockNumber = '0xa70e75';
    expect.assertions(4);
    const { service, removeListener, messenger } = createIFrameService();
    const publishSpy = jest.spyOn(messenger, 'publish');
    const snapId = 'TestSnap';
    const executeResult = await service.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = () => ethereum.request({ method: 'eth_blockNumber', params: [] });
      `,
      endowments: ['ethereum'],
    });

    expect(executeResult).toBe('OK');

    const result = await service.handleRpcRequest(snapId, {
      origin: 'foo',
      handler: HandlerType.OnRpcRequest,
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'foobar',
        params: [],
      },
    });

    expect(result).toBe(blockNumber);

    expect(publishSpy).toHaveBeenCalledWith(
      'ExecutionService:outboundRequest',
      'TestSnap',
    );

    expect(publishSpy).toHaveBeenCalledWith(
      'ExecutionService:outboundResponse',
      'TestSnap',
    );

    await service.terminateAllSnaps();
    removeListener();
  });
});
