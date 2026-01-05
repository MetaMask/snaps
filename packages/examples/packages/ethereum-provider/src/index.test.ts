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

  describe('getGenesisBlock', () => {
    // Ethereum Mainnet
    const GENESIS_BLOCK = {
      difficulty: '0x400000000',
      extraData:
        '0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa',
      gasLimit: '0x1388',
      gasUsed: '0x0',
      hash: '0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3',
      logsBloom:
        '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
      miner: '0x0000000000000000000000000000000000000000',
      mixHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      nonce: '0x0000000000000042',
      number: '0x0',
      parentHash:
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      receiptsRoot:
        '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      sha3Uncles:
        '0x1dcc4de8dec75d7aab85b567b6ccd41ad312451b948a7413f0a142fd40d49347',
      size: '0x21c',
      stateRoot:
        '0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544',
      timestamp: '0x0',
      transactions: [],
      transactionsRoot:
        '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
      uncles: [],
    };

    it('returns the genesis block', async () => {
      const { request, mockJsonRpc } = await installSnap();

      // To avoid relying on the network, we mock the response from the Ethereum
      // provider.
      mockJsonRpc({
        method: 'eth_getBlockByNumber',
        result: GENESIS_BLOCK,
      });

      const response = await request({
        method: 'getGenesisBlock',
      });

      expect(response).toRespondWith(GENESIS_BLOCK);
    });
  });

  describe('getChainId', () => {
    const MOCK_CHAIN_ID = '0x1'; // Ethereum Mainnet

    it('returns the current network version', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getChainId',
      });

      expect(response).toRespondWith(MOCK_CHAIN_ID);
    });
  });

  describe('getAccounts', () => {
    it('returns the addresses granted access to by the user', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getAccounts',
      });

      // Currently, snaps-jest will always return this account.
      expect(response).toRespondWith([
        '0xc6d5a3c98ec9073b54fa0969957bd582e8d874bf',
      ]);
    });
  });

  describe('personalSign', () => {
    const MOCK_SIGNATURE =
      '0x16f672a12220dc4d9e27671ef580cfc1397a9a4d5ee19eadea46c0f350b2f72a4922be7c1f16ed9b03ef1d3351eac469e33accf5a36194b1d88923701c2b163f1b';

    it('returns a signature', async () => {
      const { request, mockJsonRpc } = await installSnap();

      // We can mock the signature request with the response we want.
      mockJsonRpc({
        method: 'personal_sign',
        result: MOCK_SIGNATURE,
      });

      const response = await request({
        method: 'personalSign',
        params: { message: 'foo' },
      });

      expect(response).toRespondWith(MOCK_SIGNATURE);
    });
  });

  describe('signTypedData', () => {
    const MOCK_SIGNATURE =
      '0x01b37713300d99fecf0274bcb0dfb586a23d56c4bf2ed700c5ecf4ada7a2a14825e7b1212b1cc49c9440c375337561f2b7a6e639ba25be6a6f5a16f60e6931d31c';

    it('returns a signature', async () => {
      const { request, mockJsonRpc } = await installSnap();

      // We can mock the signature request with the response we want.
      mockJsonRpc({
        method: 'eth_signTypedData_v4',
        result: MOCK_SIGNATURE,
      });

      const response = await request({
        method: 'signTypedData',
        params: { message: 'foo' },
      });

      expect(response).toRespondWith(MOCK_SIGNATURE);
    });
  });
});
