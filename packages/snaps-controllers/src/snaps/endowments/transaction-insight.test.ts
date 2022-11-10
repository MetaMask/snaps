import { PermissionType } from '@metamask/controllers';

import { SnapEndowments } from '.';
import { transactionInsightEndowmentBuilder } from './transaction-insight';

describe('endowment:transaction-insight', () => {
  it('builds the expected permission specification', () => {
    const specification =
      transactionInsightEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.TransactionInsight,
      endowmentGetter: expect.any(Function),
      allowedCaveats: null,
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
