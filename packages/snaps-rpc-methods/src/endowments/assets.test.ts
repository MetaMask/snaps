import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { assetsEndowmentBuilder, getAssetsCaveatMapper } from './assets';
import { SnapEndowments } from './enum';

describe('endowment:assets', () => {
  describe('specificationBuilder', () => {
    it('builds the expected permission specification', () => {
      const specification = assetsEndowmentBuilder.specificationBuilder({});
      expect(specification).toStrictEqual({
        permissionType: PermissionType.Endowment,
        targetName: SnapEndowments.Assets,
        endowmentGetter: expect.any(Function),
        allowedCaveats: [SnapCaveatType.ChainIds],
        subjectTypes: [SubjectType.Snap],
        validator: expect.any(Function),
      });

      expect(specification.endowmentGetter()).toBeNull();
    });
  });

  describe('getAssetsCaveatMapper', () => {
    it('maps a value to a caveat', () => {
      expect(
        getAssetsCaveatMapper({
          scopes: ['bip122:000000000019d6689c085ae165831e93'],
        }),
      ).toStrictEqual({
        caveats: [
          {
            type: SnapCaveatType.ChainIds,
            value: ['bip122:000000000019d6689c085ae165831e93'],
          },
        ],
      });
    });
  });
});
