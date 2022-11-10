import { ControllerMessenger } from '@metamask/controllers';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';
import { HandlerType } from '@metamask/snaps-utils';
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

const MOCK_BLOCK_NUM = '0xa70e75';

function createService() {
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
  const service = new IframeExecutionService({
    messenger,
    setupSnapProvider: (_snapId, rpcStream) => {
      const mux = setupMultiplex(rpcStream, 'foo');
      const stream = mux.createStream('metamask-provider');
      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        if (req.method === 'metamask_getProviderState') {
          res.result = {
            isUnlocked: false,
            accounts: [],
            chainId: '0x1',
            networkVersion: '1',
          };
          return end();
        } else if (req.method === 'eth_blockNumber') {
          res.result = MOCK_BLOCK_NUM;
          return end();
        }
        return next();
      });
      const providerStream = createEngineStream({ engine });
      pump(stream, providerStream, stream);
    },
    iframeUrl,
  });
  const removeListener = fixJSDOMPostMessageEventSource(service);
  return { service, messenger, controllerMessenger, removeListener };
}

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
    const { service, removeListener } = createService();
    expect(service).toBeDefined();
    await service.terminateAllSnaps();
    removeListener();
  });

  it('can create a snap worker and start the snap', async () => {
    const { service, removeListener } = createService();
    const response = await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toStrictEqual('OK');
    await service.terminateAllSnaps();
    removeListener();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const { service, removeListener } = createService();
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
    const { service, removeListener, messenger } = createService();
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
