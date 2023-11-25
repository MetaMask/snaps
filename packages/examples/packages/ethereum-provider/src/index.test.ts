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
    it('returns the current gas price', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getGasPrice',
      });

      expect(response).toRespondWith(expect.any(String));
    });
  });

  describe('getVersion', () => {
    it('returns the current network version', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getVersion',
      });

      expect(response).toRespondWith('1');
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
