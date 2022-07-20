import { PermissionType } from '@metamask/controllers';
import { networkAccessEndowmentBuilder } from './network-access';
import { SnapEndowments } from './enum';

describe('endowment:network-access', () => {
  it('builds the expected permission specification', () => {
    const specification = networkAccessEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.networkAccess,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toStrictEqual([
      'fetch',
      'WebSocket',
      'Request',
      'Headers',
      'Response',
    ]);
  });
});
