import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import { type GetCurrencyRateResult } from '@metamask/snaps-sdk';
import type { JsonRpcRequest, PendingJsonRpcResponse } from '@metamask/utils';

import type { GetCurrencyRateParameters } from './getCurrencyRate';
import { getCurrencyRateHandler } from './getCurrencyRate';

describe('snap_getCurrencyRate', () => {
  describe('getCurrencyRateHandler', () => {
    it('has the expected shape', () => {
      expect(getCurrencyRateHandler).toMatchObject({
        methodNames: ['snap_getCurrencyRate'],
        implementation: expect.any(Function),
        hookNames: {
          getCurrencyRate: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result from the `getCurrencyRate` hook', async () => {
      const { implementation } = getCurrencyRateHandler;

      const getCurrencyRate = jest.fn().mockReturnValue({
        currency: 'usd',
        conversionRate: 1,
        conversionDate: 1,
        usdConversionRate: 1,
      });

      const hooks = {
        getCurrencyRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetCurrencyRateParameters>,
          response as PendingJsonRpcResponse<GetCurrencyRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getCurrencyRate',
        params: {
          currency: 'btc',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          currency: 'usd',
          conversionRate: 1,
          conversionDate: 1,
          usdConversionRate: 1,
        },
      });
    });

    it('returns null if there is no rate available', async () => {
      const { implementation } = getCurrencyRateHandler;

      const getCurrencyRate = jest.fn().mockReturnValue(undefined);

      const hooks = {
        getCurrencyRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetCurrencyRateParameters>,
          response as PendingJsonRpcResponse<GetCurrencyRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getCurrencyRate',
        params: {
          currency: 'btc',
        },
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
      });
    });

    it('throws on invalid params', async () => {
      const { implementation } = getCurrencyRateHandler;

      const getCurrencyRate = jest.fn().mockReturnValue({
        currency: 'usd',
        conversionRate: 1,
        conversionDate: 1,
        usdConversionRate: 1,
      });

      const hooks = {
        getCurrencyRate,
      };

      const engine = new JsonRpcEngine();

      engine.push((request, response, next, end) => {
        const result = implementation(
          request as JsonRpcRequest<GetCurrencyRateParameters>,
          response as PendingJsonRpcResponse<GetCurrencyRateResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getCurrencyRate',
        params: {
          currency: 'eth',
        },
      });

      expect(response).toStrictEqual({
        error: {
          code: -32602,
          message:
            'Invalid params: At path: currency -- Expected the value to satisfy a union of `literal | literal`, but received: "eth".',
          stack: expect.any(String),
        },
        id: 1,
        jsonrpc: '2.0',
      });
    });
  });
});
