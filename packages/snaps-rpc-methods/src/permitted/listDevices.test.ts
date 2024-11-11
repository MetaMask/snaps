import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { ListDevicesParams, ListDevicesResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { listDevicesHandler } from './listDevices';

describe('listDevices', () => {
  describe('listDevicesHandler', () => {
    it('has the expected shape', () => {
      expect(listDevicesHandler).toMatchObject({
        methodNames: ['snap_listDevices'],
        implementation: expect.any(Function),
        hookNames: {
          listDevices: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result of the `listDevices` hook', async () => {
      const { implementation } = listDevicesHandler;

      const listDevices = jest.fn().mockImplementation(async () => []);

      const hooks = {
        listDevices,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListDevicesParams>,
          response as PendingJsonRpcResponse<ListDevicesResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listDevices',
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
      const { implementation } = listDevicesHandler;

      const listDevices = jest.fn();

      const hooks = {
        listDevices,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<ListDevicesParams>,
          response as PendingJsonRpcResponse<ListDevicesResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_listDevices',
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
