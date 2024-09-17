import type { Json, PendingJsonRpcResponse } from '@metamask/utils';

import { getProviderStateHandler } from './provider-state';

describe('getProviderStateHandler', () => {
  it('returns the provider state', async () => {
    const end = jest.fn();
    const result: PendingJsonRpcResponse<Json> = {
      jsonrpc: '2.0' as const,
      id: 1,
    };

    await getProviderStateHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'metamask_getProviderState',
        params: [],
      },
      result,
      jest.fn(),
      end,
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toStrictEqual({
      isUnlocked: true,
      chainId: '0x01',
      networkVersion: '0x01',
      accounts: [],
    });
  });
});
