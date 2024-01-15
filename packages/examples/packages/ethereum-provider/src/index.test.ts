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
});
