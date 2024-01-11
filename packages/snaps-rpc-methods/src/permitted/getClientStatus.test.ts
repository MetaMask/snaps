import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { GetClientStatusResult } from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getClientStatusHandler } from './getClientStatus';

describe('snap_getClientStatus', () => {
  describe('getClientStatusHandler', () => {
    it('has the expected shape', () => {
      expect(getClientStatusHandler).toMatchObject({
        methodNames: ['snap_getClientStatus'],
        implementation: expect.any(Function),
        hookNames: {
          getIsLocked: true,
        },
      });
    });
  });

  describe('implementation', () => {
    it('returns the result', async () => {
      const { implementation } = getClientStatusHandler;

      const getIsLocked = jest.fn().mockReturnValue(true);
      const hooks = {
        getIsLocked,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request,
          response as PendingJsonRpcResponse<GetClientStatusResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getClientStatus',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: { locked: true },
      });
    });
  });
});
