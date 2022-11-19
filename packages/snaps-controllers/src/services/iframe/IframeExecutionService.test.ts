import { createService } from '@metamask/snaps-controllers/test-utils';
import { HandlerType } from '@metamask/snaps-utils';
import { ChildProcess, fork } from 'child_process';

import { IframeExecutionService } from './IframeExecutionService';
import fixJSDOMPostMessageEventSource from './test/fixJSDOMPostMessageEventSource';

// We do not use our default endowments in these tests because JSDOM doesn't
// implement all of them.

const iframeUrl = new URL(`http://localhost:6364`);

const createIFrameService = () => {
  const { service, ...rest } = createService(IframeExecutionService, {
    iframeUrl,
  });

  const removeListener = fixJSDOMPostMessageEventSource(service);
  return { service, removeListener, ...rest };
};

describe('IframeExecutionService', () => {
  let process: ChildProcess;

  beforeAll(() => {
    // Forking the process makes it possible to kill the process later, which is
    // much faster than gracefully stopping the server.
    process = fork(require.resolve('./test/server'), [], {
      stdio: 'inherit',
    });
  });

  afterAll(() => {
    process.kill();
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
