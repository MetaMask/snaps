import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { getImplementation, specificationBuilder } from './getPreferences';

describe('snap_getPreferences', () => {
  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        getPreferences: jest.fn(),
      };

      expect(
        specificationBuilder({
          methodHooks,
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'snap_getPreferences',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getImplementation', () => {
    it('returns the preferences', async () => {
      const methodHooks = {
        getPreferences: jest.fn().mockReturnValue({
          locale: 'en',
          currency: 'usd',
          hideBalances: false,
          useSecurityAlerts: true,
          simulateOnChainActions: true,
          useTokenDetection: true,
          batchCheckBalances: true,
          displayNftMedia: false,
          useNftDetection: false,
          useExternalPricingData: true,
        }),
      };

      const implementation = getImplementation(methodHooks);

      expect(
        await implementation({
          context: {
            origin: 'npm:@metamask/example-snap',
          },
          method: 'snap_getPreferences',
        }),
      ).toStrictEqual({
        locale: 'en',
        currency: 'usd',
        hideBalances: false,
        useSecurityAlerts: true,
        simulateOnChainActions: true,
        useTokenDetection: true,
        batchCheckBalances: true,
        displayNftMedia: false,
        useNftDetection: false,
        useExternalPricingData: true,
      });
    });
  });
});
