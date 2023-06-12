import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

const MOCK_GAS_PRICE = '0x387c64b64';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Internal JSON-RPC error.',
      data: {
        cause: {
          message: 'The method does not exist / is not available.',
          stack: expect.any(String),
        },
      },
    });

    await close();
  });

  describe('getGasPrice', () => {
    it('returns the current gas price', async () => {
      const { request, close, mockJsonRpc } = await installSnap();

      // To avoid relying on the network, we mock the response from the Ethereum
      // provider.
      await mockJsonRpc({
        method: 'eth_gasPrice',
        result: MOCK_GAS_PRICE,
      });

      const response = await request({
        method: 'getGasPrice',
      });

      expect(response).toRespondWith(MOCK_GAS_PRICE);

      await close();
    });
  });
});
