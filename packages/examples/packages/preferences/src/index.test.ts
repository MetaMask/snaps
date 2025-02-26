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

  describe('getPreferences', () => {
    it('returns the result from snap_getPreferences', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'getPreferences',
      });

      expect(response).toRespondWith({
        currency: 'usd',
        locale: 'en',
        hideBalances: false,
        useSecurityAlerts: true,
        simulateOnChainActions: true,
        useTokenDetection: true,
        batchCheckBalances: true,
        displayNftMedia: true,
        useNftDetection: true,
        useExternalPricingData: true,
      });
    });

    it('returns the result from snap_getPreferences with set options', async () => {
      const { request } = await installSnap({
        options: {
          locale: 'foo',
          useTokenDetection: false,
          useNftDetection: false,
          useExternalPricingData: false,
        },
      });

      const response = await request({
        method: 'getPreferences',
      });

      expect(response).toRespondWith({
        currency: 'usd',
        locale: 'foo',
        hideBalances: false,
        useSecurityAlerts: true,
        simulateOnChainActions: true,
        useTokenDetection: false,
        batchCheckBalances: true,
        displayNftMedia: true,
        useNftDetection: false,
        useExternalPricingData: false,
      });
    });
  });
});
