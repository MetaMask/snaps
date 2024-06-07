import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  getSignatureInsightCaveatMapper,
  getSignatureOriginCaveat,
  signatureInsightCaveatSpecifications,
  signatureInsightEndowmentBuilder,
} from './signature-insight';

describe('endowment:signature-insight', () => {
  const specification = signatureInsightEndowmentBuilder.specificationBuilder(
    {},
  );
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.SignatureInsight,
      allowedCaveats: [SnapCaveatType.SignatureOrigin],
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

    it('throws if the caveat is not a single "signatureOrigin"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "signatureOrigin", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'signatureOrigin', value: [] },
            { type: 'signatureOrigin', value: [] },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getSignatureOriginCaveat', () => {
  it('returns the value from a signature insight permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.SignatureOrigin,
          value: true,
        },
      ],
    };

    expect(getSignatureOriginCaveat(permission)).toBe(true);
  });

  it('returns null if the input is undefined', () => {
    expect(getSignatureOriginCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getSignatureOriginCaveat(permission)).toBeNull();
  });

  it('throws if the permission does not have exactly one caveat', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.SignatureOrigin,
          value: true,
        },
        {
          type: SnapCaveatType.SignatureOrigin,
          value: true,
        },
      ],
    };

    expect(() => getSignatureOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });

  it('throws if the first caveat is not a "signatureOrigin" caveat', () => {
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

    expect(() => getSignatureOriginCaveat(permission)).toThrow(
      'Assertion failed',
    );
  });
});

describe('getSignatureInsightCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(
      getSignatureInsightCaveatMapper({
        allowSignatureOrigin: true,
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'signatureOrigin',
          value: true,
        },
      ],
    });
  });

  it('does not include caveat if input is empty object', () => {
    expect(getSignatureInsightCaveatMapper({})).toStrictEqual({
      caveats: null,
    });
  });
});

describe('signatureInsightCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        signatureInsightCaveatSpecifications[
          SnapCaveatType.SignatureOrigin
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.SignatureOrigin,
          },
        ),
      ).toThrow('Expected a plain object.');

      expect(() =>
        signatureInsightCaveatSpecifications[
          SnapCaveatType.SignatureOrigin
        ].validator?.({
          type: SnapCaveatType.SignatureOrigin,
          value: undefined,
        }),
      ).toThrow('Expected caveat value to have type "boolean"');
    });
  });
});
