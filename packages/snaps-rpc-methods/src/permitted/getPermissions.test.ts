import { JsonRpcEngine } from '@metamask/json-rpc-engine';
import type { GetPermissionsResult } from '@metamask/snaps-sdk';
import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getPermissionsHandler } from './getPermissions';

describe('getPermissionsHandler', () => {
  it('has the expected shape', () => {
    expect(getPermissionsHandler).toMatchObject({
      methodNames: ['snap_getPermissions'],
      implementation: expect.any(Function),
      hookNames: {
        getPermissions: true,
      },
    });
  });

  describe('implementation', () => {
    it('returns the result received from the `getPermissions` hook', async () => {
      const { implementation } = getPermissionsHandler;
      const getPermissions = jest.fn().mockReturnValueOnce({
        'endowment:network-access': {},
      });

      const hooks = {
        getPermissions,
      };

      const engine = new JsonRpcEngine();
      engine.push((request, response, next, end) => {
        const result = implementation(
          request as never,
          response as PendingJsonRpcResponse<GetPermissionsResult>,
          next,
          end,
          hooks,
        );

        result?.catch(end);
      });

      const response = await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getPermissions',
      });

      expect(response).toStrictEqual({
        jsonrpc: '2.0',
        id: 1,
        result: {
          'endowment:network-access': {},
        },
      });
    });
  });
});
