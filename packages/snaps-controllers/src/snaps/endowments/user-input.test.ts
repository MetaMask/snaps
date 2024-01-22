import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapEndowments } from '@metamask/snaps-utils';

import { userInputEndowmentBuilder } from './user-input';

describe('endowment:user-input', () => {
  const specification = userInputEndowmentBuilder.specificationBuilder({});
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.UserInput,
      allowedCaveats: null,
      endowmentGetter: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
