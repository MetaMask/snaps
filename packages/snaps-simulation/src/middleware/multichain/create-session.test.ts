import { createSessionHandler } from './create-session';
import { DEFAULT_ACCOUNTS } from '../../constants';

describe('createSessionHandler', () => {
  it('returns granted session', async () => {
    const grantPermissions = jest.fn();
    const getAccounts = jest.fn().mockReturnValue(DEFAULT_ACCOUNTS);

    const result = await createSessionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_createSession',
        params: {
          optionalScopes: {
            'eip155:1': {
              methods: ['personal_sign', 'eth_signTypedData_v4'],
              notifications: [],
              accounts: [],
            },
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
              methods: ['signMessage', 'getGenesisHash'],
              notifications: [],
              accounts: [
                'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
              ],
            },
          },
        },
      },
      { grantPermissions, getAccounts },
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
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
          accounts: [
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ],
          methods: expect.arrayContaining(['signMessage', 'getGenesisHash']),
          notifications: [],
        },
      },
      sessionProperties: {},
    });
  });

  it('returns granted session using requiredScopes', async () => {
    const grantPermissions = jest.fn();
    const getAccounts = jest.fn().mockReturnValue(DEFAULT_ACCOUNTS);

    const result = await createSessionHandler(
      {
        jsonrpc: '2.0',
        id: 1,
        method: 'wallet_createSession',
        params: {
          requiredScopes: {
            'eip155:1': {
              methods: ['personal_sign', 'eth_signTypedData_v4'],
              notifications: [],
              accounts: [],
            },
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
              methods: ['signMessage', 'getGenesisHash'],
              notifications: [],
              accounts: [],
            },
          },
        },
      },
      { grantPermissions, getAccounts },
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
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
          accounts: [
            'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
          ],
          methods: expect.arrayContaining(['signMessage', 'getGenesisHash']),
          notifications: [],
        },
      },
      sessionProperties: {},
    });
  });

  it('throws if invalid params are passed', async () => {
    const grantPermissions = jest.fn();
    const getAccounts = jest.fn();

    await expect(
      createSessionHandler(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'wallet_createSession',
          params: { optionalScopes: { foo: {} } },
        },
        { grantPermissions, getAccounts },
      ),
    ).rejects.toThrow('Invalid method parameter(s).');
  });
});
