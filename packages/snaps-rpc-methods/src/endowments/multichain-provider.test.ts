import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { multichainProviderEndowmentBuilder } from './multichain-provider';

describe('endowment:multichain-provider', () => {
  it('builds the expected permission specification', () => {
    const specification =
      multichainProviderEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.MultichainProvider,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeNull();
  });
});
