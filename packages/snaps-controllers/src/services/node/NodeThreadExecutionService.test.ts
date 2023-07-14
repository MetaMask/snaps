import {
  createService,
  MOCK_BLOCK_NUMBER,
} from '@metamask/snaps-controllers/test-utils';
import type { SnapId } from '@metamask/snaps-utils';
import { HandlerType } from '@metamask/snaps-utils';

import type { SnapErrorJson } from '../ExecutionService';
import { NodeThreadExecutionService } from './NodeThreadExecutionService';

const ON_RPC_REQUEST = HandlerType.OnRpcRequest;

describe('NodeThreadExecutionService', () => {
  it('can boot', async () => {
    const { service } = createService(NodeThreadExecutionService);
    expect(service).toBeDefined();
    await service.terminateAllSnaps();
  });

  it('can create a snap worker and start the snap', async () => {
    const { service } = createService(NodeThreadExecutionService);
    const response = await service.executeSnap({
      snapId: 'TestSnap',
      sourceCode: `
        console.log('foo');
      `,
      endowments: ['console'],
    });
    expect(response).toBe('OK');
    await service.terminateAllSnaps();
  });

  it('can handle a crashed snap', async () => {
    expect.assertions(1);
    const { service } = createService(NodeThreadExecutionService);
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
    const { service } = createService(NodeThreadExecutionService);
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
    const { service, controllerMessenger } = createService(
      NodeThreadExecutionService,
    );
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
        snapId: 'TestSnap',
        stack: expect.any(String),
      },
      message: 'random error inside',
    });

    await service.terminateAllSnaps();
  });

  it('can detect outbound requests', async () => {
    expect.assertions(4);
    const { service, messenger } = createService(NodeThreadExecutionService);
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

    expect(result).toBe(MOCK_BLOCK_NUMBER);

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
