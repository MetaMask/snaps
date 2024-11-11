import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { WriteDeviceParams, WriteDeviceResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { writeDeviceHandler } from './writeDevice';

describe('writeDevice', () => {
  describe('writeDeviceHandler', () => {
    it('has the expected shape', () => {
      expect(writeDeviceHandler).toMatchObject({
        methodNames: ['snap_writeDevice'],
        implementation: expect.any(Function),
        hookNames: {
          writeDevice: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result of the `writeDevice` hook', async () => {
      const { implementation } = writeDeviceHandler;

      const writeDevice = jest.fn();

      const hooks = {
        writeDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<WriteDeviceParams>,
          response as PendingJsonRpcResponse<WriteDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_writeDevice',
        params: {
          type: 'hid',
          id: 'hid:123:456',
          data: '0x1234',
        },
      });

      expect(response).toStrictEqual({ jsonrpc: '2.0', id: 1, result: null });
    });

    it('throws on invalid params', async () => {
      const { implementation } = writeDeviceHandler;

      const writeDevice = jest.fn();

      const hooks = {
        writeDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<WriteDeviceParams>,
          response as PendingJsonRpcResponse<WriteDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_writeDevice',
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
  });
});
