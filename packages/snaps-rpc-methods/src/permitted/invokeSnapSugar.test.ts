import type {
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback,
  JsonRpcRequest,
} from '@metamask/types';
import { ethErrors } from 'eth-rpc-errors';

import { getValidatedParams, invokeSnapSugar } from './invokeSnapSugar';

describe('wallet_invokeSnap', () => {
  describe('invokeSnapSugar', () => {
    it('invokes snap with next()', () => {
      const req: JsonRpcRequest<unknown> = {
        id: 'some-id',
        jsonrpc: '2.0',
        method: 'wallet_invokeSnap',
        params: {
          snapId: 'npm:@metamask/example-snap',
          request: { method: 'hello' },
        },
      };
      const _res: unknown = {};
      const next: JsonRpcEngineNextCallback = jest
        .fn()
        .mockResolvedValueOnce(true);
      const end: JsonRpcEngineEndCallback = jest.fn();

      invokeSnapSugar(req, _res, next, end);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('ends with an error if params are invalid', () => {
      const req: JsonRpcRequest<unknown> = {
        id: 'some-id',
        jsonrpc: '2.0',
        method: 'wallet_invokeSnap',
        params: {
          snapId: undefined,
          request: [],
        },
      };
      const _res: unknown = {};
      const next: JsonRpcEngineNextCallback = jest
        .fn()
        .mockResolvedValueOnce(true);
      const end: JsonRpcEngineEndCallback = jest.fn();

      invokeSnapSugar(req, _res, next, end);

      expect(end).toHaveBeenCalledWith(
        ethErrors.rpc.invalidParams({
          message: 'Must specify a valid snap ID.',
        }),
      );
      expect(next).not.toHaveBeenCalled();
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
