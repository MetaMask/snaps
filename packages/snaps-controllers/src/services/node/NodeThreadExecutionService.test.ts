import { ControllerMessenger } from '@metamask/controllers';
import { HandlerType, SnapId } from '@metamask/snaps-utils';
import { JsonRpcEngine } from 'json-rpc-engine';
import { createEngineStream } from 'json-rpc-middleware-stream';
import pump from 'pump';
import { ErrorMessageEvent, SnapErrorJson } from '../ExecutionService';
import { setupMultiplex } from '../AbstractExecutionService';
import { NodeThreadExecutionService } from './NodeThreadExecutionService';

const ON_RPC_REQUEST = HandlerType.OnRpcRequest;

const MOCK_BLOCK_NUM = '0xa70e75';

const createService = () => {
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
  const service = new NodeThreadExecutionService({
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
  });
  return { service, messenger, controllerMessenger };
};

describe('NodeThreadExecutionService', () => {
  it('can boot', async () => {
    const { service } = createService();
    expect(service).toBeDefined();
    await service.terminateAllSnaps();
  });

  it('can create a snap worker and start the snap', async () => {
    const { service } = createService();
    const response = await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toStrictEqual('OK');
    await service.terminateAllSnaps();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const { service } = createService();
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
  });

  it('can handle errors in request handler', async () => {
    expect.assertions(1);
    const { service } = createService();
    const snapId = 'TestSnap';
    await service.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = async () => { throw new Error("foobar"); };
      `,
      endowments: [],
    });

    await expect(
      service.handleRpcRequest(snapId, {
        origin: 'fooOrigin',
        handler: ON_RPC_REQUEST,
        request: {
          jsonrpc: '2.0',
          method: 'foo',
          params: {},
          id: 1,
        },
      }),
    ).rejects.toThrow('foobar');
    await service.terminateAllSnaps();
  });

  it('can handle errors out of band', async () => {
    expect.assertions(2);
    const { service, controllerMessenger } = createService();
    const snapId = 'TestSnap';
    await service.executeSnap({
      snapId,
      sourceCode: `
      module.exports.onRpcRequest = async () =>
      {
        new Promise((resolve, _reject) => {
          let num = 0;
          while (num < 100) {
            // eslint-disable-next-line no-plusplus
            num++;
          }
          throw new Error('random error inside');
          resolve(undefined);
        });
        return 'foo';
       };
      `,
      endowments: [],
    });

    const unhandledErrorPromise = new Promise((resolve) => {
      controllerMessenger.subscribe(
        'ExecutionService:unhandledError',
        (_snapId: SnapId, error: SnapErrorJson) => {
          resolve(error);
        },
      );
    });

    expect(
      await service.handleRpcRequest(snapId, {
        origin: 'fooOrigin',
        handler: ON_RPC_REQUEST,
        request: {
          jsonrpc: '2.0',
          method: '',
          params: {},
          id: 1,
        },
      }),
    ).toBe('foo');

    // eslint-disable-next-line jest/prefer-strict-equal
    expect(await unhandledErrorPromise).toEqual({
      code: -32603,
      data: {
        snapName: 'TestSnap',
        stack: expect.any(String),
      },
      message: 'random error inside',
    });

    await service.terminateAllSnaps();
  });

  it('can detect outbound requests', async () => {
    expect.assertions(4);
    const { service, messenger } = createService();
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
      handler: ON_RPC_REQUEST,
      request: {
        jsonrpc: '2.0',
        id: 1,
        method: 'foobar',
        params: [],
      },
    });

    expect(result).toBe(MOCK_BLOCK_NUM);

    expect(publishSpy).toHaveBeenCalledWith(
      'ExecutionService:outboundRequest',
      'TestSnap',
    );

    expect(publishSpy).toHaveBeenCalledWith(
      'ExecutionService:outboundResponse',
      'TestSnap',
    );

    await service.terminateAllSnaps();
  });
});
