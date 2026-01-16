import { getSessionHandler } from './get-session';
import { MOCK_CAVEAT } from './test-utils';

describe('getSessionHandler', () => {
  it('returns granted session', () => {
    const getCaveat = jest.fn().mockReturnValue(MOCK_CAVEAT);

    const result = getSessionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_getSession',
        params: {},
      },
      { getCaveat },
    );

    expect(result).toStrictEqual({
      sessionScopes: {
        'eip155:1': {
          accounts: ['eip155:1:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf'],
          methods: expect.arrayContaining([
            'personal_sign',
            'eth_signTypedData_v4',
          ]),
          notifications: ['eth_subscription'],
        },
        'eip155:11155111': {
          accounts: [
            'eip155:11155111:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
          ],
          methods: expect.arrayContaining([
            'personal_sign',
            'eth_signTypedData_v4',
          ]),
          notifications: ['eth_subscription'],
        },
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
          accounts: [],
          methods: expect.arrayContaining(['signMessage', 'getGenesisHash']),
          notifications: [],
        },
      },
    });
  });

  it('handles an empty caveat', () => {
    const getCaveat = jest.fn();

    const result = getSessionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_getSession',
        params: {},
      },
      { getCaveat },
    );

    expect(result).toStrictEqual({
      sessionScopes: {},
    });
  });
});
