import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { ReadDeviceParams, ReadDeviceResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { readDeviceHandler } from './readDevice';

describe('readDevice', () => {
  describe('readDeviceHandler', () => {
    it('has the expected shape', () => {
      expect(readDeviceHandler).toMatchObject({
        methodNames: ['snap_readDevice'],
        implementation: expect.any(Function),
        hookNames: {
          readDevice: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result of the `readDevice` hook', async () => {
      const { implementation } = readDeviceHandler;

      const readDevice = jest.fn().mockImplementation(async () => '0x1234');

      const hooks = {
        readDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ReadDeviceParams>,
          response as PendingJsonRpcResponse<ReadDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_readDevice',
        params: {
          type: 'hid',
          id: 'hid:123:456',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: '0x1234',
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = readDeviceHandler;

      const readDevice = jest.fn();

      const hooks = {
        readDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ReadDeviceParams>,
          response as PendingJsonRpcResponse<ReadDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_readDevice',
        params: {
          type: 'bluetooth',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: type -- Expected the literal `"hid"`, but received: "bluetooth".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });

    it('forwards the error if the `readDevice` hook throws an error', async () => {
      const { implementation } = readDeviceHandler;

      const readDevice = jest.fn().mockRejectedValue(new Error('foo'));

      const hooks = {
        readDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ReadDeviceParams>,
          response as PendingJsonRpcResponse<ReadDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_readDevice',
        params: {
          type: 'hid',
          id: 'hid:123:456',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32603,
          message: 'Internal JSON-RPC error.',
          data: {
            cause: expect.objectContaining({
              message: 'foo',
            }),
          },
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});
