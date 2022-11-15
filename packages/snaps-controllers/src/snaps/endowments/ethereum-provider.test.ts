import { PermissionType } from '@metamask/controllers';
import { SnapEndowments } from './enum';
import { ethereumProviderEndowmentBuilder } from './ethereum-provider';

describe('endowment:eip1193', () => {
  it('builds the expected permission specification', () => {
    const specification = ethereumProviderEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.EthereumProvider,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toStrictEqual(['ethereum']);
  });
});
