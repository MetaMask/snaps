import type { Json, PendingJsonRpcResponse } from '@metamask/utils';

import { getNetworkVersionHandler } from './net-version';

describe('getNetworkVersionHandler', () => {
  it('returns the network version', async () => {
    const end = jest.fn();
    const result: PendingJsonRpcResponse<Json> = {
      jsonrpc: '2.0' as const,
      id: 1,
    };

    await getNetworkVersionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'net_version',
        params: [],
      },
      result,
      jest.fn(),
      end,
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toBe('1');
  });
});
