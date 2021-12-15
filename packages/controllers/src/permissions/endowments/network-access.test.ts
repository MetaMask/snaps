import { PermissionType } from '../Permission';
import { networkAccessEndowmentBuilder } from './network-access';

describe('endowment:network-access', () => {
  it('builds the expected permission specification', () => {
    const specification = networkAccessEndowmentBuilder.specificationBuilder(
      {},
    );
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: 'endowment:network-access',
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toStrictEqual(['fetch']);
  });
});
