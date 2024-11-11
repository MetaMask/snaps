import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  RequestDeviceParams,
  RequestDeviceResult,
} from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { requestDeviceHandler } from './requestDevice';

describe('requestDevice', () => {
  describe('requestDeviceHandler', () => {
    it('has the expected shape', () => {
      expect(requestDeviceHandler).toMatchObject({
        methodNames: ['snap_requestDevice'],
        implementation: expect.any(Function),
        hookNames: {
          requestDevice: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result of the `requestDevice` hook', async () => {
      const { implementation } = requestDeviceHandler;

      const requestDevice = jest.fn().mockImplementation(async () => []);

      const hooks = {
        requestDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestDeviceParams>,
          response as PendingJsonRpcResponse<RequestDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestDevice',
        params: {
          type: 'hid',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [],
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = requestDeviceHandler;

      const requestDevice = jest.fn();

      const hooks = {
        requestDevice,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<RequestDeviceParams>,
          response as PendingJsonRpcResponse<RequestDeviceResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_requestDevice',
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
