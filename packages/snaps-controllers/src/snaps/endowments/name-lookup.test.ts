import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from '.';
import { nameLookupEndowmentBuilder } from './name-lookup';

describe('endowment:name-lookup', () => {
  const specification = nameLookupEndowmentBuilder.specificationBuilder({});
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.NameLookup,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
