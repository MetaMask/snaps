import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { getActivityItemOriginCaveat, SnapEndowments } from '.';
import {
  activityItemInsightEndowmentBuilder,
  activityItemInsightCaveatSpecifications,
  getActivityItemInsightCaveatMapper,
} from './activity-item-insight';

describe('endowment:activity-item-insight-insight', () => {
  const specification =
    activityItemInsightEndowmentBuilder.specificationBuilder({});
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.ActivityItemInsight,
      allowedCaveats: [
        SnapCaveatType.ActivityItemOrigin,
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

    it('throws if the caveat is not a single "activityItemOrigin"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "activityItemOrigin", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'activityItemOrigin', value: [] },
            { type: 'activityItemOrigin', value: [] },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getActivityItemOriginCaveat', () => {
  it('returns the value from a activity item insight permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.ActivityItemOrigin,
          value: true,
        },
      ],
    };

    expect(getActivityItemOriginCaveat(permission)).toBe(true);
  });

  it('returns null if the input is undefined', () => {
    expect(getActivityItemOriginCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getActivityItemOriginCaveat(permission)).toBeNull();
  });

  it('throws if the permission does not have exactly one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.ActivityItemOrigin,
          value: true,
        },
        {
          type: SnapCaveatType.ActivityItemOrigin,
          value: true,
        },
      ],
    };

    expect(() => getActivityItemOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });

  it('throws if the first caveat is not a "activityItemOrigin" caveat', () => {
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

    expect(() => getActivityItemOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });
});

describe('getActivityItemInsightCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(
      getActivityItemInsightCaveatMapper({
        allowActivityItemOrigin: true,
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'activityItemOrigin',
          value: true,
        },
      ],
    });
  });

  it('does not include caveat if input is empty object', () => {
    expect(getActivityItemInsightCaveatMapper({})).toStrictEqual({
      caveats: null,
    });
  });
});

describe('activityItemInsightCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        activityItemInsightCaveatSpecifications[
          SnapCaveatType.ActivityItemOrigin
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.ActivityItemOrigin,
          },
        ),
      ).toThrow('Expected a plain object.');

      expect(() =>
        activityItemInsightCaveatSpecifications[
          SnapCaveatType.ActivityItemOrigin
        ].validator?.({
          type: SnapCaveatType.ActivityItemOrigin,
          value: undefined,
        }),
      ).toThrow('Expected caveat value to have type "boolean"');
    });
  });
});
