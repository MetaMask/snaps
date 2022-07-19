import { PermissionType } from '@metamask/controllers';
import { txInsightEndowmentBuilder } from './tx-insight';

describe('endowment:tx-insight', () => {
  it('builds the expected permission specification', () => {
    const specification = txInsightEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: 'endowment:tx-insight',
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
