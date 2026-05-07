import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
} from '@metamask/json-rpc-engine';
import { rpcErrors } from '@metamask/rpc-errors';
import type { InvokeSnapParams } from '@metamask/snaps-sdk';
import { MockControllerMessenger } from '@metamask/snaps-utils/test-utils';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';
import { assertIsJsonRpcSuccess, jsonrpc2 } from '@metamask/utils';

import type { InvokeSnapSugarMethodActions } from './invokeSnapSugar';
import { getValidatedParams, invokeSnapSugar } from './invokeSnapSugar';

describe('wallet_invokeSnap', () => {
  describe('invokeSnapSugar', () => {
    const getMockRpcRequest = (params: InvokeSnapParams) =>
      ({
        id: 'some-id',
        jsonrpc: jsonrpc2,
        method: 'wallet_invokeSnap',
        params,
        origin: 'https://example.com',
      }) as JsonRpcRequest<InvokeSnapParams> & { origin: string };

    const getMockRpcResponse = () =>
      ({
        id: 'some-id',
        jsonrpc: jsonrpc2,
      }) as PendingJsonRpcResponse;

    const getMessenger = () => {
      const messenger = new MockControllerMessenger<
        InvokeSnapSugarMethodActions,
        never
      >();

      messenger.registerActionHandler(
        'PermissionController:executeRestrictedMethod',
        async () => true,
      );

      jest.spyOn(messenger, 'call');

      return messenger;
    };

    it('invokes snap via the messenger', async () => {
      const params = {
        snapId: 'npm:@metamask/example-snap',
        request: { method: 'hello' },
      };
      const req = getMockRpcRequest({ ...params });
      const res = getMockRpcResponse();
      const next: JsonRpcEngineNextCallback = jest.fn();
      const end: JsonRpcEngineEndCallback = jest.fn();

      const messenger = getMessenger();

      await invokeSnapSugar(req, res, next, end, {} as never, messenger);

      assertIsJsonRpcSuccess(res);
      expect(next).not.toHaveBeenCalled();
      expect(messenger.call).toHaveBeenCalledWith(
        'PermissionController:executeRestrictedMethod',
        'https://example.com',
        'wallet_snap',
        params,
      );
      expect(end).toHaveBeenCalledTimes(1);
    });

    it('ends with an error if params are invalid', async () => {
      const req = getMockRpcRequest({
        // @ts-expect-error Intentional destructive testing
        snapId: undefined,
        // @ts-expect-error Intentional destructive testing
        request: [],
      });
      const res = getMockRpcResponse();
      const next: JsonRpcEngineNextCallback = jest.fn();
      const end: JsonRpcEngineEndCallback = jest.fn();

      const messenger = getMessenger();

      await invokeSnapSugar(req, res, next, end, {} as never, messenger);

      expect(next).not.toHaveBeenCalled();
      expect(end).toHaveBeenCalledTimes(1);
      expect(end).toHaveBeenCalledWith(
        rpcErrors.invalidParams({
          message: 'Must specify a valid snap ID.',
        }),
      );
      expect(messenger.call).not.toHaveBeenCalled();
    });
  });

  describe('getValidatedParams', () => {
    it('throws an error if the params is not an object', () => {
      expect(() => getValidatedParams([])).toThrow(
        'Expected params to be a single object.',
      );
    });

    it('throws an error if the snap ID is missing from params object', () => {
      expect(() =>
        getValidatedParams({ snapId: undefined, request: {} }),
      ).toThrow('Must specify a valid snap ID.');
    });

    it('throws an error if the request is not a plain object', () => {
      expect(() =>
        getValidatedParams({ snapId: 'snap-id', request: [] }),
      ).toThrow('Expected request to be a single object.');
    });

    it('returns valid parameters', () => {
      expect(
        getValidatedParams({
          snapId: 'npm:@metamask/example-snap',
          request: { method: 'hello' },
        }),
      ).toStrictEqual({
        snapId: 'npm:@metamask/example-snap',
        request: { method: 'hello' },
      });
    });
  });
});
