import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import { homePageEndowmentBuilder } from './home-page';

describe('endowment:page-home', () => {
  it('builds the expected permission specification', () => {
    const specification = homePageEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.HomePage,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [SnapCaveatType.MaxRequestTime],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeNull();
  });
});
