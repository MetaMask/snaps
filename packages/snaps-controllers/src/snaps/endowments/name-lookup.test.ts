import type { PermissionConstraint } from '@metamask/permission-controller';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from '.';
import {
  nameLookupEndowmentBuilder,
  getChainIdsCaveat,
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
      allowedCaveats: [SnapCaveatType.ChainIds],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('disallows no caveats', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "chainIds" caveat.');
    });

    it('throws if the caveat is not a single "chainIds"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "chainIds" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'chainIds', value: ['foo'] },
            { type: 'chainIds', value: ['bar'] },
          ],
        }),
      ).toThrow('Expected a single "chainIds" caveat.');
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

  it('throws if the permission does not have exactly one caveat', () => {
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
        {
          type: SnapCaveatType.ChainIds,
          value: ['eip155:2'],
        },
      ],
    };

    expect(() => getChainIdsCaveat(permission)).toThrow('Assertion failed');
  });

  it('throws if the first caveat is not a "chainIds" caveat', () => {
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

    expect(() => getChainIdsCaveat(permission)).toThrow('Assertion failed');
  });
});

describe('getNameLookupCaveatMapper', () => {
  it('maps input to a caveat', () => {
    expect(getNameLookupCaveatMapper(['eip155:1'])).toStrictEqual({
      caveats: [
        {
          type: 'chainIds',
          value: ['eip155:1'],
        },
      ],
    });
  });

  it('does not include caveat if input is empty array', () => {
    expect(getNameLookupCaveatMapper([])).toStrictEqual({
      caveats: null,
    });
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

    it.each([
      {
        type: SnapCaveatType.ChainIds,
        value: ['eip155'],
      },
      {
        type: SnapCaveatType.ChainIds,
        value: undefined,
      },
    ])('throws if the caveat values are invalid types', (val) => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.(
          val,
        ),
      ).toThrow('Expected caveat value to have type "string array"');
    });

    it('will not throw with a valid caveat value', () => {
      expect(() =>
        nameLookupCaveatSpecifications[SnapCaveatType.ChainIds].validator?.({
          type: SnapCaveatType.ChainIds,
          value: ['eip155:1'],
        }),
      ).not.toThrow();
    });
  });
});
