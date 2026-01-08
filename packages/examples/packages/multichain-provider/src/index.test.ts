import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('createSession', () => {
    it('returns the established session', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'createSession',
      });

      expect(response).toRespondWith({
        sessionScopes: {
          'eip155:1': {
            accounts: ['eip155:1:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf'],
            methods: expect.any(Array),
            notifications: expect.any(Array),
          },
          'eip155:11155111': {
            accounts: [
              'eip155:11155111:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
            ],
            methods: expect.any(Array),
            notifications: expect.any(Array),
          },
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': {
            accounts: [],
            methods: expect.any(Array),
            notifications: expect.any(Array),
          },
        },
      });
    });
  });

  describe('getChainId', () => {
    const ETHEREUM_CHAIN_ID = '0x1';
    const SEPOLIA_CHAIN_ID = '0xaa36a7';

    it('returns the Ethereum Mainnet chain ID', async () => {
      const { request } = await installSnap();

      await request({ method: 'createSession' });

      const response = await request({
        method: 'getChainId',
      });

      expect(response).toRespondWith(ETHEREUM_CHAIN_ID);
    });

    it('returns the Sepolia chain ID', async () => {
      const { request } = await installSnap();

      await request({ method: 'createSession' });

      const response = await request({
        method: 'getChainId',
        params: {
          scope: 'eip155:11155111',
        },
      });

      expect(response).toRespondWith(SEPOLIA_CHAIN_ID);
    });
  });

  describe('getAccounts', () => {
    it('returns the addresses granted access to by the user', async () => {
      const { request } = await installSnap();

      await request({ method: 'createSession' });

      const response = await request({
        method: 'getAccounts',
      });

      expect(response).toRespondWith([
        'eip155:1:0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
      ]);
    });
  });

  describe('signMessage', () => {
    const MOCK_SIGNATURE =
      '0x16f672a12220dc4d9e27671ef580cfc1397a9a4d5ee19eadea46c0f350b2f72a4922be7c1f16ed9b03ef1d3351eac469e33accf5a36194b1d88923701c2b163f1b';

    it('returns a signature for Ethereum', async () => {
      const { request, mockJsonRpc } = await installSnap();

      await request({ method: 'createSession' });

      // We can mock the signature request with the response we want.
      mockJsonRpc({
        method: 'personal_sign',
        result: MOCK_SIGNATURE,
      });

      const response = await request({
        method: 'signMessage',
        params: { scope: 'eip155:1', message: 'foo' },
      });

      expect(response).toRespondWith(MOCK_SIGNATURE);
    });
  });

  describe('signTypedData', () => {
    const MOCK_SIGNATURE =
      '0x01b37713300d99fecf0274bcb0dfb586a23d56c4bf2ed700c5ecf4ada7a2a14825e7b1212b1cc49c9440c375337561f2b7a6e639ba25be6a6f5a16f60e6931d31c';

    it('returns a signature for Ethereum', async () => {
      const { request, mockJsonRpc } = await installSnap();

      await request({ method: 'createSession' });

      // We can mock the signature request with the response we want.
      mockJsonRpc({
        method: 'eth_signTypedData_v4',
        result: MOCK_SIGNATURE,
      });

      const response = await request({
        method: 'signTypedData',
        params: { scope: 'eip155:1', message: 'foo' },
      });

      expect(response).toRespondWith(MOCK_SIGNATURE);
    });
  });

  describe('getGenesisHash', () => {
    it('returns the Ethereum Mainnet hash', async () => {
      const { request } = await installSnap();

      await request({ method: 'createSession' });

      const response = await request({
        method: 'getGenesisHash',
        params: { scope: 'eip155:1' },
      });

      expect(response).toRespondWith(
        '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      );
    });

    it('returns the Solana Mainnet hash', async () => {
      const SOLANA_GENESIS_HASH = 'abc';
      const { request, mockJsonRpc } = await installSnap();

      await request({ method: 'createSession' });

      mockJsonRpc({ method: 'getGenesisHash', result: SOLANA_GENESIS_HASH });

      const response = await request({
        method: 'getGenesisHash',
        params: { scope: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' },
      });

      expect(response).toRespondWith(SOLANA_GENESIS_HASH);
    });
  });
});
