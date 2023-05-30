import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from '.';
import { longRunningEndowmentBuilder } from './long-running';

describe('endowment:long-running', () => {
  it('builds the expected permission specification', () => {
    const specification = longRunningEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.LongRunning,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
