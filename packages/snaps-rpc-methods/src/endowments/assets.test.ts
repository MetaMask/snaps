import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { assetsEndowmentBuilder } from './assets';
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
});
