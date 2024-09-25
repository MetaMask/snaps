import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { type GetRateResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { GetRateParameters } from './getRate';
import { getRateHandler } from './getRate';

describe('snap_getRate', () => {
  describe('getRateHandler', () => {
    it('has the expected shape', () => {
      expect(getRateHandler).toMatchObject({
        methodNames: ['snap_getRate'],
        implementation: expect.any(Function),
        hookNames: {
          getRate: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getRate` hook', async () => {
      const { implementation } = getRateHandler;

      const getRate = jest.fn().mockReturnValue({
        conversionRate: '1',
        conversionDate: 1,
        usdConversionRate: '1',
      });

      const hooks = {
        getRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetRateParameters>,
          response as PendingJsonRpcResponse<GetRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getRate',
        params: {
          cryptocurrency: 'btc',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          conversionRate: '1',
          conversionDate: 1,
          usdConversionRate: '1',
        },
      });
    });

    it('returns null if there is no rate available', async () => {
      const { implementation } = getRateHandler;

      const getRate = jest.fn().mockReturnValue(undefined);

      const hooks = {
        getRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetRateParameters>,
          response as PendingJsonRpcResponse<GetRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getRate',
        params: {
          cryptocurrency: 'btc',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = getRateHandler;

      const getRate = jest.fn().mockReturnValue({
        conversionRate: '1',
        conversionDate: 1,
        usdConversionRate: '1',
      });

      const hooks = {
        getRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetRateParameters>,
          response as PendingJsonRpcResponse<GetRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getRate',
        params: {
          cryptocurrency: 'eth',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: cryptocurrency -- Expected the value to satisfy a union of `literal`, but received: "eth".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});
