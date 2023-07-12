import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  getTransactionInsightCaveatMapper,
  getTransactionOriginCaveat,
  transactionInsightCaveatSpecifications,
  transactionInsightEndowmentBuilder,
} from './transaction-insight';

describe('endowment:transaction-insight', () => {
  const specification = transactionInsightEndowmentBuilder.specificationBuilder(
    {},
  );
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.TransactionInsight,
      allowedCaveats: [SnapCaveatType.TransactionOrigin],
      endowmentGetter: expect.any(Function),
      validator: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('allows no caveats', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).not.toThrow();
    });

    it('throws if the caveat is not a single "transactionOrigin"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "transactionOrigin" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'transactionOrigin', value: [] },
            { type: 'transactionOrigin', value: [] },
          ],
        }),
      ).toThrow('Expected a single "transactionOrigin" caveat.');
    });
  });
});

describe('getTransactionOriginCaveat', () => {
  it('returns the value from a transaction insight permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.TransactionOrigin,
          value: true,
        },
      ],
    };

    expect(getTransactionOriginCaveat(permission)).toBe(true);
  });

  it('returns null if the input is undefined', () => {
    expect(getTransactionOriginCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getTransactionOriginCaveat(permission)).toBeNull();
  });

  it('throws if the permission does not have exactly one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.TransactionOrigin,
          value: true,
        },
        {
          type: SnapCaveatType.TransactionOrigin,
          value: true,
        },
      ],
    };

    expect(() => getTransactionOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });

  it('throws if the first caveat is not a "permittedCoinTypes" caveat', () => {
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

    expect(() => getTransactionOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });
});

describe('getTransactionInsightCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(
      getTransactionInsightCaveatMapper({
        allowTransactionOrigin: true,
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'transactionOrigin',
          value: true,
        },
      ],
    });
  });

  it('does not include caveat if input is empty object', () => {
    expect(getTransactionInsightCaveatMapper({})).toStrictEqual({
      caveats: null,
    });
  });
});

describe('transactionInsightCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        transactionInsightCaveatSpecifications[
          SnapCaveatType.TransactionOrigin
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.TransactionOrigin,
          },
        ),
      ).toThrow('Expected a plain object.');

      expect(() =>
        transactionInsightCaveatSpecifications[
          SnapCaveatType.TransactionOrigin
        ].validator?.({
          type: SnapCaveatType.TransactionOrigin,
          value: undefined,
        }),
      ).toThrow('Expected caveat value to have type "boolean"');
    });
  });
});
