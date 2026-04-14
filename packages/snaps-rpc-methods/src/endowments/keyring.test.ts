import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';

import { SnapEndowments } from './enum';
import {
  getKeyringCaveatCapabilities,
  getKeyringCaveatMapper,
  getKeyringCaveatOrigins,
  keyringCaveatSpecifications,
  keyringEndowmentBuilder,
} from './keyring';

describe('endowment:keyring', () => {
  it('builds the expected permission specification', () => {
    const specification = keyringEndowmentBuilder.specificationBuilder({});
    expect(specification).toStrictEqual({
      permissionType: PermissionType.Endowment,
      targetName: SnapEndowments.Keyring,
      endowmentGetter: expect.any(Function),
      allowedCaveats: [
        SnapCaveatType.KeyringOrigin,
        SnapCaveatType.KeyringCapabilities,
        SnapCaveatType.MaxRequestTime,
      ],
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });

    expect(specification.endowmentGetter()).toBeNull();
  });

  describe('validator', () => {
    it('throws if the caveats are invalid', () => {
      const specification = keyringEndowmentBuilder.specificationBuilder({});

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow(
        'Expected the following caveats: "keyringOrigin", "keyringCapabilities", "maxRequestTime", received "foo".',
      );

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'keyringOrigin', value: { allowedOrigins: ['foo.com'] } },
            { type: 'keyringOrigin', value: { allowedOrigins: ['bar.com'] } },
          ],
        }),
      ).toThrow('Duplicate caveats are not allowed.');
    });
  });
});

describe('getKeyringCaveatMapper', () => {
  it.each([null, undefined, false, 0, '', [], {}])(
    'returns null caveats for %p',
    (value) => {
      expect(getKeyringCaveatMapper(value as never)).toStrictEqual({
        caveats: null,
      });
    },
  );

  it('maps a value to a caveat without capabilities', () => {
    expect(
      getKeyringCaveatMapper({ allowedOrigins: ['foo.com'] }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.KeyringOrigin,
          value: { allowedOrigins: ['foo.com'] },
        },
      ],
    });
  });

  it('maps a value to caveats including capabilities', () => {
    expect(
      getKeyringCaveatMapper({
        allowedOrigins: ['foo.com'],
        capabilities: {
          scopes: ['bip122:000000000019d6689c085ae165831e93'],
          bip44: { derivePath: true },
        },
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.KeyringOrigin,
          value: { allowedOrigins: ['foo.com'] },
        },
        {
          type: SnapCaveatType.KeyringCapabilities,
          value: {
            capabilities: {
              scopes: ['bip122:000000000019d6689c085ae165831e93'],
              bip44: { derivePath: true },
            },
          },
        },
      ],
    });
  });
});

describe('getKeyringCaveatOrigins', () => {
  it('returns the origins from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getKeyringCaveatOrigins({
        caveats: [
          {
            type: SnapCaveatType.KeyringOrigin,
            value: { allowedOrigins: ['foo.com'] },
          },
        ],
      }),
    ).toStrictEqual({ allowedOrigins: ['foo.com'] });
  });

  it('returns the origins when multiple caveats exist', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getKeyringCaveatOrigins({
        caveats: [
          {
            type: SnapCaveatType.KeyringOrigin,
            value: { allowedOrigins: ['foo.com'] },
          },
          {
            type: SnapCaveatType.MaxRequestTime,
            value: 1000,
          },
        ],
      }),
    ).toStrictEqual({ allowedOrigins: ['foo.com'] });
  });

  it('returns an empty array when no origins are provided', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getKeyringCaveatOrigins({
        caveats: null,
      }),
    ).toStrictEqual({ allowedOrigins: [] });
  });
});

describe('getKeyringCaveatCapabilities', () => {
  it('returns the capabilities from the caveat', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getKeyringCaveatCapabilities({
        caveats: [
          {
            type: SnapCaveatType.KeyringCapabilities,
            value: {
              capabilities: {
                scopes: ['bip122:000000000019d6689c085ae165831e93'],
                bip44: { derivePath: true },
              },
            },
          },
        ],
      }),
    ).toStrictEqual({
      capabilities: {
        scopes: ['bip122:000000000019d6689c085ae165831e93'],
        bip44: { derivePath: true },
      },
    });
  });

  it('returns null when the capabilities caveat is absent', () => {
    expect(
      // @ts-expect-error Missing other required permission types.
      getKeyringCaveatCapabilities({
        caveats: [
          {
            type: SnapCaveatType.KeyringOrigin,
            value: { allowedOrigins: ['foo.com'] },
          },
        ],
      }),
    ).toBeNull();
  });

  it('returns null when permission is undefined', () => {
    expect(getKeyringCaveatCapabilities(undefined)).toBeNull();
  });
});

describe('keyringCaveatSpecifications', () => {
  describe('keyringOrigin validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        keyringCaveatSpecifications[SnapCaveatType.KeyringOrigin].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.KeyringOrigin,
          },
        ),
      ).toThrow('Invalid keyring origins: Expected a plain object.');

      expect(() =>
        keyringCaveatSpecifications[SnapCaveatType.KeyringOrigin].validator?.({
          type: SnapCaveatType.KeyringOrigin,
          value: {
            foo: 'bar',
          },
        }),
      ).toThrow(
        'Invalid keyring origins: At path: foo -- Expected a value of type `never`, but received: `"bar"`.',
      );
    });
  });

  describe('keyringCapabilities validator', () => {
    it('throws if the caveat value is not a plain object', () => {
      expect(() =>
        keyringCaveatSpecifications[
          SnapCaveatType.KeyringCapabilities
        ].validator?.(
          // @ts-expect-error Missing value type.
          {
            type: SnapCaveatType.KeyringCapabilities,
          },
        ),
      ).toThrow('Invalid keyring capabilities: Expected a plain object.');
    });

    it('throws if the caveat value has invalid fields', () => {
      expect(() =>
        keyringCaveatSpecifications[
          SnapCaveatType.KeyringCapabilities
        ].validator?.({
          type: SnapCaveatType.KeyringCapabilities,
          value: { foo: 'bar' },
        }),
      ).toThrow('Invalid keyring capabilities');
    });

    it('throws if scopes is missing', () => {
      expect(() =>
        keyringCaveatSpecifications[
          SnapCaveatType.KeyringCapabilities
        ].validator?.({
          type: SnapCaveatType.KeyringCapabilities,
          value: { capabilities: { bip44: { derivePath: true } } },
        }),
      ).toThrow('Invalid keyring capabilities');
    });

    it('does not throw for a valid capabilities value', () => {
      expect(() =>
        keyringCaveatSpecifications[
          SnapCaveatType.KeyringCapabilities
        ].validator?.({
          type: SnapCaveatType.KeyringCapabilities,
          value: {
            capabilities: {
              scopes: ['bip122:000000000019d6689c085ae165831e93'],
              bip44: {
                derivePath: true,
                deriveIndex: true,
                deriveIndexRange: true,
                discover: true,
              },
              privateKey: {
                importFormats: [
                  {
                    encoding: 'base58',
                    type: 'bip122:p2pkh',
                  },
                ],
                exportFormats: [{ encoding: 'base58' }],
              },
            },
          },
        }),
      ).not.toThrow();
    });
  });
});
