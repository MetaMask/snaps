import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import { lifecycleHooksEndowmentBuilder } from './lifecycle-hooks';

describe('endowment:lifecycle-hooks', () => {
  it('builds the expected permission specification', () => {
    const specification = lifecycleHooksEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.LifecycleHooks,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [SnapCaveatType.MaxRequestTime],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeNull();
  });
});
