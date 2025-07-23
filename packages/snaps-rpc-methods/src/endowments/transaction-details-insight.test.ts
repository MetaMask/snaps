import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { getTransactionDetailsOriginCaveat, SnapEndowments } from '.';
import {
  transactionDetailsInsightEndowmentBuilder,
  transactionDetailsInsightCaveatSpecifications,
  getTransactionDetailsInsightCaveatMapper,
} from './transaction-details-insight';

describe('endowment:transaction-details-insight-insight', () => {
  const specification =
    transactionDetailsInsightEndowmentBuilder.specificationBuilder({});
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.TransactionDetailsInsight,
      allowedCaveats: [
        SnapCaveatType.TransactionDetailsOrigin,
        SnapCaveatType.MaxRequestTime,
      ],
      endowmentGetter: expect.any(Function),
      validator: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeNull();
  });

  describe('validator', () => {
    it('allows no caveats', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).not.toThrow();
    });

    it('throws if the caveat is not a single "transactionDetailsOrigin"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "transactionDetailsOrigin", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'transactionDetailsOrigin', value: [] },
            { type: 'transactionDetailsOrigin', value: [] },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getTransactionDetailsOriginCaveat', () => {
  it('returns the value from a transaction details insight permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.TransactionDetailsOrigin,
          value: true,
        },
      ],
    };

    expect(getTransactionDetailsOriginCaveat(permission)).toBe(true);
  });

  it('returns null if the input is undefined', () => {
    expect(getTransactionDetailsOriginCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getTransactionDetailsOriginCaveat(permission)).toBeNull();
  });

  it('throws if the permission does not have exactly one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.TransactionDetailsOrigin,
          value: true,
        },
        {
          type: SnapCaveatType.TransactionDetailsOrigin,
          value: true,
        },
      ],
    };

    expect(() => getTransactionDetailsOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });

  it('throws if the first caveat is not a "transactionDetailsOrigin" caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.PermittedCoinTypes,
          value: 'foo',
        },
      ],
    };

    expect(() => getTransactionDetailsOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });
});

describe('getTransactionDetailsInsightCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(
      getTransactionDetailsInsightCaveatMapper({
        allowTransactionDetailsOrigin: true,
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'transactionDetailsOrigin',
          value: true,
        },
      ],
    });
  });

  it('does not include caveat if input is empty object', () => {
    expect(getTransactionDetailsInsightCaveatMapper({})).toStrictEqual({
      caveats: null,
    });
  });
});

describe('transactionDetailsInsightCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        transactionDetailsInsightCaveatSpecifications[
          SnapCaveatType.TransactionDetailsOrigin
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.TransactionDetailsOrigin,
          },
        ),
      ).toThrow('Expected a plain object.');

      expect(() =>
        transactionDetailsInsightCaveatSpecifications[
          SnapCaveatType.TransactionDetailsOrigin
        ].validator?.({
          type: SnapCaveatType.TransactionDetailsOrigin,
          value: undefined,
        }),
      ).toThrow('Expected caveat value to have type "boolean"');
    });
  });
});
