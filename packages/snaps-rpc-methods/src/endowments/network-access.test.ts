import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { networkAccessEndowmentBuilder } from './network-access';

describe('endowment:network-access', () => {
  it('builds the expected permission specification', () => {
    const specification = networkAccessEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.NetworkAccess,
      globals: ['fetch', 'Request', 'Headers', 'Response'],
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });
  });
});
