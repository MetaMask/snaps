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

  describe('getGasPrice', () => {
    const MOCK_GAS_PRICE = '0x387c64b64';

    it('returns the current gas price', async () => {
      const { request, mockJsonRpc } = await installSnap();

      // To avoid relying on the network, we mock the response from the Ethereum
      // provider.
      mockJsonRpc({
        method: 'eth_gasPrice',
        result: MOCK_GAS_PRICE,
      });

      const response = await request({
        method: 'getGasPrice',
      });

      expect(response).toRespondWith(MOCK_GAS_PRICE);
    });
  });

  describe('getVersion', () => {
    const MOCK_VERSION = '1'; // Ethereum Mainnet

    it('returns the current network version', async () => {
      const { request, mockJsonRpc } = await installSnap();

      // To avoid relying on the network, we mock the response from the Ethereum
      // provider.
      mockJsonRpc({
        method: 'net_version',
        result: MOCK_VERSION,
      });

      const response = await request({
        method: 'getVersion',
      });

      expect(response).toRespondWith(MOCK_VERSION);
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
