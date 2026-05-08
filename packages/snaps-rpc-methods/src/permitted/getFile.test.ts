import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { GetFileParams } from '@metamask/snaps-sdk';
import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { VirtualFile } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  MockControllerMessenger,
  createOriginMiddleware,
} from '@metamask/snaps-utils/test-utils';
import type {
  PendingJsonRpcResponse,
  JsonRpcFailure,
  JsonRpcSuccess,
} from '@metamask/utils';
import { stringToBytes } from '@metamask/utils';

import type { GetFileMethodActions } from './getFile';
import { getFileHandler } from './getFile';
import type { JsonRpcRequestWithOrigin } from '../types';

describe('snap_getFile', () => {
  describe('getFileHandler', () => {
    it('has the expected shape', () => {
      expect(getFileHandler).toMatchObject({
        implementation: expect.any(Function),
        actionNames: ['SnapController:getSnapFile'],
      });
    });
  });

  describe('implementation', () => {
    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        GetFileMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'SnapController:getSnapFile',
        async () => null,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('returns the result received from the `SnapController:getSnapFile` action', async () => {
      const { implementation } = getFileHandler;

      const messenger = getMessenger();

      const vfile = new VirtualFile(
        stringToBytes(JSON.stringify({ foo: 'bar' })),
      );
      const base64 = vfile.toString('base64');

      messenger.registerActionHandler(
        'SnapController:getSnapFile',
        async () => base64,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequestWithOrigin<GetFileParams>,
          res as PendingJsonRpcResponse<string>,
          next,
          end,
          {} as never,
          messenger,
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

      expect(response.result).toBe(base64);
      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapFile',
        MOCK_SNAP_ID,
        './src/foo.json',
        AuxiliaryFileEncoding.Base64,
      );
    });

    it('supports hex in encoding parameter', async () => {
      const { implementation } = getFileHandler;

      const messenger = getMessenger();

      const vfile = new VirtualFile(
        stringToBytes(JSON.stringify({ foo: 'bar' })),
      );
      const hexadecimal = vfile.toString('hex');

      messenger.registerActionHandler(
        'SnapController:getSnapFile',
        async () => hexadecimal,
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequestWithOrigin<GetFileParams>,
          res as PendingJsonRpcResponse<string>,
          next,
          end,
          {} as never,
          messenger,
        );

        result?.catch(end);
      });

      const response = (await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getFile',
        params: {
          path: './src/foo.json',
          encoding: 'hex',
        },
      })) as JsonRpcSuccess<string>;

      expect(response.result).toBe(hexadecimal);
      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapFile',
        MOCK_SNAP_ID,
        './src/foo.json',
        AuxiliaryFileEncoding.Hex,
      );
    });

    it('ends with error if action throws', async () => {
      const { implementation } = getFileHandler;

      const messenger = getMessenger();

      messenger.registerActionHandler(
        'SnapController:getSnapFile',
        async () => {
          throw new Error('foo bar');
        },
      );

      const engine = new JsonRpcEngine();

      engine.push(createOriginMiddleware(MOCK_SNAP_ID));
      engine.push((req, res, next, end) => {
        const result = implementation(
          req as JsonRpcRequestWithOrigin<GetFileParams>,
          res as PendingJsonRpcResponse<string>,
          next,
          end,
          {} as never,
          messenger,
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

      expect(response.error).toStrictEqual({
        code: -32603,
        message: 'foo bar',
        data: {
          cause: {
            message: 'foo bar',
            stack: expect.any(String),
          },
        },
      });

      expect(messenger.call).toHaveBeenCalledWith(
        'SnapController:getSnapFile',
        MOCK_SNAP_ID,
        './src/foo.json',
        AuxiliaryFileEncoding.Base64,
      );
    });
  });
});
