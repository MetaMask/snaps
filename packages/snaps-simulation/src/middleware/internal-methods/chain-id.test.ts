import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getChainIdHandler } from './chain-id';

describe('getChainIdHandler', () => {
  it('returns the chain id', async () => {
    const end = jest.fn();
    const result: PendingJsonRpcResponse = {
      jsonrpc: '2.0' as const,
      id: 1,
    };

    await getChainIdHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_chainId',
        params: [],
      },
      result,
      jest.fn(),
      end,
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toBe('0x01');
  });
});
