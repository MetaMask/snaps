import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { GetSnapsResult } from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getAllSnapsHandler } from './getAllSnaps';

describe('wallet_getAllSnaps', () => {
  describe('getAllSnapsHandler', () => {
    it('has the expected shape', () => {
      expect(getAllSnapsHandler).toMatchObject({
        methodNames: ['wallet_getAllSnaps'],
        implementation: expect.any(Function),
        hookNames: {
          getAllSnaps: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result received from the `getAllSnaps` hook', async () => {
      const { implementation } = getAllSnapsHandler;

      const getAllSnaps = jest.fn().mockResolvedValue(['foo', 'bar']);
      const hooks = {
        getAllSnaps,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          // @ts-expect-error - `origin` is not part of the type, but in practice
          // it is added by the MetaMask middleware stack.
          { ...request, origin: 'https://snaps.metamask.io' },
          response as PendingJsonRpcResponse<GetSnapsResult>,
          next,
          end,
          hooks,
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
        result: ['foo', 'bar'],
      });
    });

    it('returns an error if the origin is not allowed', async () => {
      const { implementation } = getAllSnapsHandler;

      const getAllSnaps = jest.fn().mockResolvedValue(['foo', 'bar']);
      const hooks = {
        getAllSnaps,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          // @ts-expect-error - `origin` is not part of the type, but in practice
          // it is added by the MetaMask middleware stack.
          { ...request, origin: 'https://example.com' },
          response as PendingJsonRpcResponse<GetSnapsResult>,
          next,
          end,
          hooks,
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
