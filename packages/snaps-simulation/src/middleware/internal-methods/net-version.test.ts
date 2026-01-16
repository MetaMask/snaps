import type { PendingJsonRpcResponse } from '@metamask/utils';

import { getNetworkVersionHandler } from './net-version';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getNetworkVersionHandler', () => {
  it('returns the network version', async () => {
    const { store } = createStore(getMockOptions());
    const end = jest.fn();
    const result: PendingJsonRpcResponse = {
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
      { getSimulationState: store.getState },
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toBe('1');
  });

  it('returns the network version using the scope if provided', async () => {
    const { store } = createStore(getMockOptions());
    const end = jest.fn();
    const result: PendingJsonRpcResponse = {
      jsonrpc: '2.0' as const,
      id: 1,
    };

    await getNetworkVersionHandler(
      {
        scope: 'eip155:2',
        jsonrpc: '2.0',
        id: 1,
        method: 'net_version',
        params: [],
      },
      result,
      jest.fn(),
      end,
      { getSimulationState: store.getState },
    );

    expect(end).toHaveBeenCalled();
    expect(result.result).toBe('2');
  });
});
