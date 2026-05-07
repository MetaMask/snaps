import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import {
  MockControllerMessenger,
  createOriginMiddleware,
  getTruncatedSnap,
} from '@metamask/snaps-utils/test-utils';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import type {
  GetAllSnapsMethodActions,
  GetAllSnapsResult,
} from './getAllSnaps';
import { getAllSnapsHandler } from './getAllSnaps';

describe('wallet_getAllSnaps', () => {
  describe('getAllSnapsHandler', () => {
    it('has the expected shape', () => {
      expect(getAllSnapsHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: ['SnapController:getAllSnaps'],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetAllSnapsMethodActions,
        never
      >();

      messenger.registerActionHandler('SnapController:getAllSnaps', () => [
        getTruncatedSnap(),
      ]);

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the result received from the `SnapController:getAllSnaps` action', async () => {
      const { implementation } = getAllSnapsHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();
      engine.push(createOriginMiddleware('https://snaps.metamask.io'));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as Parameters<typeof implementation>[0],
          response as PendingJsonRpcResponse<GetAllSnapsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_getAllSnaps',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [getTruncatedSnap()],
      });
    });

    it('returns an error if the origin is not allowed', async () => {
      const { implementation } = getAllSnapsHandler;

      const messenger = getMessenger();

      const engine = new JsonRpcEngine();
      engine.push(createOriginMiddleware('https://example.com'));
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as Parameters<typeof implementation>[0],
          response as PendingJsonRpcResponse<GetAllSnapsResult>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_getAllSnaps',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: expect.objectContaining({
          code: -32601,
          message: 'The method does not exist / is not available.',
        }),
      });
    });
  });
});
