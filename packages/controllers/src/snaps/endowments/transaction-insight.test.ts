import { PermissionType } from '@metamask/controllers';
import { transactionInsightEndowmentBuilder } from './transaction-insight';
import { SnapEndowments } from '.';

describe('endowment:transaction-insight', () => {
  it('builds the expected permission specification', () => {
    const specification =
      transactionInsightEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.transactionInsight,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
