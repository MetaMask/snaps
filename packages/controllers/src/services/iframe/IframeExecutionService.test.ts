import assert from 'assert';
import { ControllerMessenger } from '@metamask/controllers';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';
import { HandlerType } from '@metamask/execution-environments';
import { ErrorMessageEvent } from '../ExecutionService';
import { setupMultiplex } from '../AbstractExecutionService';
import { IframeExecutionService } from './IframeExecutionService';
import fixJSDOMPostMessageEventSource from './test/fixJSDOMPostMessageEventSource';
import {
  PORT as serverPort,
  stop as stopServer,
  start as startServer,
} from './test/server';

// We do not use our default endowments in these tests because JSDOM doesn't
// implement all of them.

const iframeUrl = new URL(`http://localhost:${serverPort}`);

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
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionService,
    );
    expect(iframeExecutionService).toBeDefined();
    await iframeExecutionService.terminateAllSnaps();
    removeListener();
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
    await iframeExecutionService.terminateAllSnaps();
    removeListener();
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

  it('can detect outbound requests', async () => {
    const blockNumber = '0xa70e75';
    expect.assertions(4);
    const controllerMessenger = new ControllerMessenger<
      never,
      ErrorMessageEvent
    >();
    const messenger = controllerMessenger.getRestricted<
      'ExecutionService',
      never,
      ErrorMessageEvent['type']
    >({
      name: 'ExecutionService',
    });
    const publishSpy = jest.spyOn(messenger, 'publish');
    const iframeExecutionService = new IframeExecutionService({
      messenger,
      setupSnapProvider: (_snapId, rpcStream) => {
        const mux = setupMultiplex(rpcStream, 'foo');
        const stream = mux.createStream('metamask-provider');
        const engine = new JsonRpcEngine();
        engine.push((req, res, next, end) => {
          if (req.method === 'metamask_getProviderState') {
            res.result = { isUnlocked: false, accounts: [] };
            return end();
          } else if (req.method === 'eth_blockNumber') {
            res.result = blockNumber;
            return end();
          }
          return next();
        });
        const providerStream = createEngineStream({ engine });
        pump(stream, providerStream, stream);
      },
      iframeUrl,
    });
    const snapId = 'TestSnap';
    const removeListener = fixJSDOMPostMessageEventSource(
      iframeExecutionService,
    );
    const executeResult = await iframeExecutionService.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = () => wallet.request({ method: 'eth_blockNumber', params: [] });
      `,
      endowments: [],
    });

    expect(executeResult).toBe('OK');

    const result = await await iframeExecutionService.handleRpcRequest(snapId, {
      origin: 'foo',
      handler: HandlerType.onRpcRequest,
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

    await iframeExecutionService.terminateAllSnaps();
    removeListener();
  });
});
