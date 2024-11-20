import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type {
  GetSupportedDevicesParams,
  GetSupportedDevicesResult,
} from '@metamask/snaps-sdk';
import { DeviceType } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import { getSupportedDevicesHandler } from './getSupportedDevices';

describe('getSupportedDevices', () => {
  describe('getSupportedDevicesHandler', () => {
    it('has the expected shape', () => {
      expect(getSupportedDevicesHandler).toMatchObject({
        methodNames: ['snap_getSupportedDevices'],
        implementation: expect.any(Function),
        hookNames: {},
      });
    });
  });

  describe('implementation', () => {
    beforeEach(() => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          hid: undefined,
        },
        configurable: true,
      });
    });

    it('returns `hid` if HID is supported', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          hid: {},
        },
        configurable: true,
      });

      const { implementation } = getSupportedDevicesHandler;

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetSupportedDevicesParams>,
          response as PendingJsonRpcResponse<GetSupportedDevicesResult>,
          next,
          end,
          {},
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getSupportedDevices',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [DeviceType.HID],
      });
    });

    it('returns an empty array if HID is not supported', async () => {
      const { implementation } = getSupportedDevicesHandler;

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetSupportedDevicesParams>,
          response as PendingJsonRpcResponse<GetSupportedDevicesResult>,
          next,
          end,
          {},
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getSupportedDevices',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: [],
      });
    });
  });
});
