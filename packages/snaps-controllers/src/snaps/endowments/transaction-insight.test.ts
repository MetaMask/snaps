import { PermissionType } from '@metamask/controllers';
import { SnapCaveatType } from '@metamask/snap-utils';
import { transactionInsightEndowmentBuilder } from './transaction-insight';
import { SnapEndowments } from '.';

describe('endowment:transaction-insight', () => {
  it('builds the expected permission specification', () => {
    const specification =
      transactionInsightEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetKey: SnapEndowments.TransactionInsight,
      allowedCaveats: [SnapCaveatType.SnapTransactionInsight],
      endowmentGetter: expect.any(Function),
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });
});
