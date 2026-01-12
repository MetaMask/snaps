import { mnemonicPhraseToBytes } from '@metamask/key-tree';

import { createSessionHandler } from './create-session';
import { DEFAULT_SRP } from '../../constants';

describe('createSessionHandler', () => {
  it('returns granted session', async () => {
    const grantPermissions = jest.fn();
    const getMnemonic = jest
      .fn()
      .mockResolvedValue(mnemonicPhraseToBytes(DEFAULT_SRP));

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
              accounts: [],
            },
          },
        },
      },
      { grantPermissions, getMnemonic },
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
          accounts: [],
          methods: expect.arrayContaining(['signMessage', 'getGenesisHash']),
          notifications: [],
        },
      },
    });
  });

  it('throws if invalid params are passed', async () => {
    const grantPermissions = jest.fn();
    const getMnemonic = jest.fn();

    await expect(
      createSessionHandler(
        {
          jsonrpc: '2.0',
          id: 1,
          method: 'wallet_createSession',
          params: [],
        },
        { grantPermissions, getMnemonic },
      ),
    ).rejects.toThrow('Invalid method parameter(s).');
  });
});
