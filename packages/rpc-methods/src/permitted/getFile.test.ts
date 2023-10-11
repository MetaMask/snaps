import type {
  JsonRpcRequest,
  PendingJsonRpcResponse,
  JsonRpcFailure,
  JsonRpcSuccess,
} from '@metamask/types';
import { stringToBytes, bytesToHex } from '@metamask/utils';
import { JsonRpcEngine } from 'json-rpc-engine';

import type { GetFileHooks } from './getFile';
import { getFileHandler } from './getFile';

describe('snap_getFile', () => {
  describe('getFileHandler', () => {
    it('has the expected shape', () => {
      expect(getFileHandler).toMatchObject({
        methodNames: ['snap_getFile'],
        implementation: expect.any(Function),
        hookNames: {
          getSnapFile: true,
        },
      });
    });
  });

  describe('implementation', () => {
    const getMockHooks = () =>
      ({
        getSnapFile: jest.fn(),
      } as GetFileHooks);

    it('returns the result received from the getSnapFile hook', async () => {
      const { implementation } = getFileHandler;

      const hooks = getMockHooks();

      const hexadecimal = bytesToHex(
        stringToBytes(JSON.stringify({ foo: 'bar' })),
      );
      (
        hooks.getSnapFile as jest.MockedFunction<typeof hooks.getSnapFile>
      ).mockImplementation(async (_path: string) => hexadecimal);

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<JsonRpcRequest<unknown>>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getFile',
        params: {
          path: './src/foo.json',
        },
      })) as JsonRpcSuccess<string>;

      expect(response.result).toBe(hexadecimal);
      expect(hooks.getSnapFile).toHaveBeenCalledWith('./src/foo.json');
    });

    it('ends with error if hook throws', async () => {
      const { implementation } = getFileHandler;

      const hooks = getMockHooks();

      (
        hooks.getSnapFile as jest.MockedFunction<typeof hooks.getSnapFile>
      ).mockImplementation(async (_path: string) => {
        throw new Error('foo bar');
      });

      const engine = new JsonRpcEngine();
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequest<JsonRpcRequest<unknown>>,
          res as PendingJsonRpcResponse<unknown>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getFile',
        params: {
          path: './src/foo.json',
        },
      })) as JsonRpcFailure;

      expect(response.error.message).toBe('foo bar');
      expect(hooks.getSnapFile).toHaveBeenCalledWith('./src/foo.json');
    });
  });
});
