import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { extendRuntimeEndowmentBuilder } from './extend-runtime';

describe('endowment:extend-runtime', () => {
  it('builds the expected permission specification', () => {
    const specification = extendRuntimeEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.ExtendRuntime,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toStrictEqual(['extendRuntime']);
  });
});
