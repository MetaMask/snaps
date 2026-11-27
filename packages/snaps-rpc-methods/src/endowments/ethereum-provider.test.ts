import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { SnapEndowments } from './enum';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';

describe('endowment:eip1193', () => {
  it('builds the expected permission specification', () => {
    const specification = ethereumProviderEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.EthereumProvider,
      globals: ['ethereum'],
      allowedCaveats: null,
      subjectTypes: [SubjectType.Snap],
    });
  });
});
