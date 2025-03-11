import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  ListEntropySourcesParams,
  ListEntropySourcesResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { listEntropySourcesHandler } from './listEntropySources';

describe('snap_listEntropySources', () => {
  describe('listEntropySourcesHandler', () => {
    it('has the expected shape', () => {
      expect(listEntropySourcesHandler).toMatchObject({
        methodNames: ['snap_listEntropySources'],
        implementation: expect.any(Function),
        hookNames: {
          hasPermission: true,
          getEntropySources: true,
          getUnlockPromise: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getEntropySources` hook', async () => {
      const { implementation } = listEntropySourcesHandler;

      const getUnlockPromise = jest.fn();
      const getEntropySources = jest.fn().mockReturnValue([
        {
          name: 'Secret recovery phrase 1',
          id: 'foo',
          type: 'mnemonic',
          primary: false,
        },
        {
          name: 'Secret recovery phrase 2',
          id: 'bar',
          type: 'mnemonic',
          primary: false,
        },
        {
          name: 'Primary secret recovery phrase',
          id: 'baz',
          type: 'mnemonic',
          primary: true,
        },
      ]);

      const hooks = {
        hasPermission: jest.fn().mockReturnValue(true),
        getEntropySources,
        getUnlockPromise,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListEntropySourcesParams>,
          response as PendingJsonRpcResponse<ListEntropySourcesResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listEntropySources',
      });

      expect(getUnlockPromise).toHaveBeenCalledWith(true);
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [
          {
            name: 'Secret recovery phrase 1',
            id: 'foo',
            type: 'mnemonic',
            primary: false,
          },
          {
            name: 'Secret recovery phrase 2',
            id: 'bar',
            type: 'mnemonic',
            primary: false,
          },
          {
            name: 'Primary secret recovery phrase',
            id: 'baz',
            type: 'mnemonic',
            primary: true,
          },
        ],
      });
    });

    it('returns an unauthorized error if the requesting origin does not have the required permission', async () => {
      const { implementation } = listEntropySourcesHandler;

      const getUnlockPromise = jest.fn();
      const hooks = {
        hasPermission: jest.fn().mockReturnValue(false),
        getEntropySources: jest.fn(),
        getUnlockPromise,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListEntropySourcesParams>,
          response as PendingJsonRpcResponse<ListEntropySourcesResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listEntropySources',
      });

      expect(getUnlockPromise).not.toHaveBeenCalled();
      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        error: {
          code: 4100,
          message:
            'The requested account and/or method has not been authorized by the user.',
          stack: expect.any(String),
        },
      });
    });
  });
});
