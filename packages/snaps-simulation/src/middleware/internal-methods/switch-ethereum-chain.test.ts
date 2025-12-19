import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getSwitchEthereumChainHandler } from './switch-ethereum-chain';

describe('getSwitchEthereumChainHandler', () => {
  it('returns `null`', async () => {
    const end = jest.fn();
    const result: PendingJsonRpcResponse = {
      jsonrpc: '2.0' as const,
      id: 1,
    };
    const hooks = { setCurrentChain: jest.fn().mockResolvedValue(undefined) };
    const chainId = '0xaa36a7';

    await getSwitchEthereumChainHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_switchEthereumChain',
        params: [{ chainId }],
      },
      result,
      jest.fn(),
      end,
      hooks,
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toBeNull();
    expect(hooks.setCurrentChain).toHaveBeenCalledWith(chainId);
  });
});
