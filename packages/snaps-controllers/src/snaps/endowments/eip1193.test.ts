import { PermissionType } from '@metamask/controllers';
import { SnapEndowments } from './enum';
import { eip1193EndowmentBuilder } from './eip1193';

describe('endowment:eip1193', () => {
  it('builds the expected permission specification', () => {
    const specification = eip1193EndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.EIP1193,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toStrictEqual(['ethereum']);
  });
});
