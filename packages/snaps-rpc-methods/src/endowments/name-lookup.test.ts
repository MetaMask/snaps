import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  nameLookupEndowmentBuilder,
  getChainIdsCaveat,
  getLookupMatchersCaveat,
  getNameLookupCaveatMapper,
  nameLookupCaveatSpecifications,
} from './name-lookup';

describe('endowment:name-lookup', () => {
  const specification = nameLookupEndowmentBuilder.specificationBuilder({});
  it('builds the expected permission specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.NameLookup,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [
        SnapCaveatType.ChainIds,
        SnapCaveatType.LookupMatchers,
        SnapCaveatType.MaxRequestTime,
      ],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
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

    it('throws if the caveats are not one or both of "chainIds" and "lookupMatchers".', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "chainIds", "lookupMatchers", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'chainIds', value: ['foo'] },
            { type: 'chainIds', value: ['bar'] },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getChainIdsCaveat', () => {
  it('returns the value from a name-lookup permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.ChainIds,
          value: ['eip155:1'],
        },
      ],
    };
    expect(getChainIdsCaveat(permission)).toStrictEqual(['eip155:1']);
  });

  it('returns null if the input is undefined', () => {
    expect(getChainIdsCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getChainIdsCaveat(permission)).toBeNull();
  });

  it('returns null if there is not a "chainIds" caveat', () => {
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

    expect(getChainIdsCaveat(permission)).toBeNull();
  });
});

describe('getLookupMatchersCaveat', () => {
  it('returns the value from a name-lookup permission', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: [
        {
          type: SnapCaveatType.LookupMatchers,
          value: { tlds: ['lens'] },
        },
      ],
    };
    expect(getLookupMatchersCaveat(permission)).toStrictEqual({
      tlds: ['lens'],
    });
  });

  it('returns null if the input is undefined', () => {
    expect(getLookupMatchersCaveat(undefined)).toBeNull();
  });

  it('returns null if the permission does not have caveats', () => {
    const permission: PermissionConstraint = {
      date: 0,
      parentCapability: 'foo',
      invoker: 'bar',
      id: 'baz',
      caveats: null,
    };

    expect(getLookupMatchersCaveat(permission)).toBeNull();
  });

  it('returns null if there is not a "matchers" caveat', () => {
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

    expect(getLookupMatchersCaveat(permission)).toBeNull();
  });
});

describe('getNameLookupCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(getNameLookupCaveatMapper({ chains: ['eip155:1'] })).toStrictEqual({
      caveats: [
        {
          type: 'chainIds',
          value: ['eip155:1'],
        },
      ],
    });

    expect(
      getNameLookupCaveatMapper({ matchers: { tlds: ['lens'] } }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'lookupMatchers',
          value: { tlds: ['lens'] },
        },
      ],
    });

    expect(
      getNameLookupCaveatMapper({
        matchers: { tlds: ['lens'], schemes: ['fio'] },
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: 'lookupMatchers',
          value: { tlds: ['lens'], schemes: ['fio'] },
        },
      ],
    });
  });

  it('does not include caveat if input is empty object', () => {
    expect(getNameLookupCaveatMapper({})).toStrictEqual({
      caveats: null,
    });
  });

  it('throws if caveat is not the correct type', () => {
    expect(() => getNameLookupCaveatMapper({ foo: 'bar' })).toThrow('');
  });
});

describe('nameLookupCaveatSpecifications', () => {
  describe('validator', () => {
    it('throws if the caveat is missing a value key or is not an object', () => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.ChainIds,
          },
        ),
      ).toThrow('Expected a plain object.');
    });

    it('throws if the caveat type is invalid', () => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.({
          type: 'foo',
          value: ['eip155:1'],
        }),
      ).toThrow(
        'Invalid caveat type, must be one of the following: "chainIds", "matchers".',
      );
    });

    it('throws if the caveat values are invalid for the "chainIds" caveat', () => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.({
          type: SnapCaveatType.ChainIds,
          value: ['eip155'],
        }),
      ).toThrow(
        'Assertion failed: At path: 0 -- Expected a Chain ID matching `/^(?<namespace>[-a-z0-9]{3,8}):(?<reference>[-a-zA-Z0-9]{1,32})$/` but received "eip155".',
      );

      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.({
          type: SnapCaveatType.ChainIds,
          value: undefined,
        }),
      ).toThrow(
        'Assertion failed: Expected an array value, but received: undefined.',
      );
    });

    it('throws if the caveat values are invalid for the "matchers" caveat', () => {
      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: undefined,
        }),
      ).toThrow(
        'Assertion failed: Expected the value to satisfy a union of `object | object | object`, but received: undefined.',
      );

      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: { foo: 'bar', tlds: ['lens'], schemes: ['fio'] },
        }),
      ).toThrow(
        'Assertion failed: Expected the value to satisfy a union of `object | object | object`, but received: [object Object]',
      );

      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: { foo: 'bar' },
        }),
      ).toThrow(
        'Assertion failed: Expected the value to satisfy a union of `object | object | object`, but received: [object Object].',
      );

      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: { tlds: ['lens'], schemes: [1, 2] },
        }),
      ).toThrow(
        'Assertion failed: Expected the value to satisfy a union of `object | object | object`, but received: [object Object]',
      );

      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: { tlds: [1, 2], schemes: ['fio'] },
        }),
      ).toThrow(
        'Assertion failed: Expected the value to satisfy a union of `object | object | object`, but received: [object Object].',
      );
    });

    it('will not throw with a valid caveat value', () => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.({
          type: SnapCaveatType.ChainIds,
          value: ['eip155:1'],
        }),
      ).not.toThrow();

      expect(() =>
        nameLookupCaveatSpecifications[
          SnapCaveatType.LookupMatchers
        ].validator?.({
          type: SnapCaveatType.LookupMatchers,
          value: { tlds: ['lens'], schemes: ['fio'] },
        }),
      ).not.toThrow();
    });
  });
});
