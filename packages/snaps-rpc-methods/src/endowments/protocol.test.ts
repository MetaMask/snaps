import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import {
  getProtocolCaveatChainIds,
  getProtocolCaveatMapper,
  getProtocolCaveatOrigins,
  protocolEndowmentBuilder,
} from './protocol';

describe('endowment:protocol', () => {
  it('builds the expected permission specification', () => {
    const specification = protocolEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.Protocol,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [
        SnapCaveatType.KeyringOrigin,
        SnapCaveatType.ChainIds,
        SnapCaveatType.MaxRequestTime,
      ],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeUndefined();
  });

  describe('validator', () => {
    it('throws if the caveat is not a "keyringOrigin" and "chainIds"', () => {
      const specification = protocolEndowmentBuilder.specificationBuilder({});

      expect(() =>
        specification.validator({
          // @ts-expect-error Missing other required permission types.
          caveats: undefined,
        }),
      ).toThrow('Expected the following caveats: "keyringOrigin", "chainIds".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "keyringOrigin", "chainIds", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'keyringOrigin', value: { allowedOrgins: ['foo.com'] } },
          ],
        }),
      ).toThrow('Expected the following caveats: "keyringOrigin", "chainIds".');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'keyringOrigin', value: { allowedOrgins: ['foo.com'] } },
            { type: 'keyringOrigin', value: { allowedOrgins: ['bar.com'] } },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getProtocolCaveatMapper', () => {
  it('maps a value to a caveat', () => {
    expect(
      getProtocolCaveatMapper({
        allowedOrigins: ['foo.com'],
        chains: ['bip122:000000000019d6689c085ae165831e93'],
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.ChainIds,
          value: ['bip122:000000000019d6689c085ae165831e93'],
        },
        {
          type: SnapCaveatType.KeyringOrigin,
          value: { allowedOrigins: ['foo.com'] },
        },
      ],
    });
  });

  it('returns null if the input is null', () => {
    expect(getProtocolCaveatMapper(null)).toStrictEqual({
      caveats: null,
    });
  });
});

describe('getProtocolCaveatOrigins', () => {
  it('returns the origins from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getProtocolCaveatOrigins({
        caveats: [
          {
            type: SnapCaveatType.KeyringOrigin,
            value: { allowedOrigins: ['foo.com'] },
          },
        ],
      }),
    ).toStrictEqual({ allowedOrigins: ['foo.com'] });
  });
});

describe('getProtocolCaveatChainIds', () => {
  it('returns the chain ids from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getProtocolCaveatChainIds({
        caveats: [
          {
            type: SnapCaveatType.ChainIds,
            value: ['bip122:000000000019d6689c085ae165831e93'],
          },
        ],
      }),
    ).toStrictEqual(['bip122:000000000019d6689c085ae165831e93']);
  });
});
