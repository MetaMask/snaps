import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { homePageEndowmentBuilder } from './home-page';

describe('endowment:page-home', () => {
  it('builds the expected permission specification', () => {
    const specification = homePageEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.HomePage,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
