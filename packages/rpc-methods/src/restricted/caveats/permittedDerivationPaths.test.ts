import { SnapCaveatType, SIP_6_MAGIC_VALUE } from '@metamask/snaps-utils';

import {
  permittedDerivationPathsCaveatMapper,
  validateBIP32CaveatPaths,
  PermittedDerivationPathsCaveatSpecification,
} from './permittedDerivationPaths';

describe('permittedDerivationPathsCaveatMapper', () => {
  it('returns a caveat value for an array of paths', () => {
    expect(
      permittedDerivationPathsCaveatMapper([
        { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        { path: ['m', "0'", "0'"], curve: 'ed25519' },
      ]),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [
            { path: ['m', "44'", "60'"], curve: 'secp256k1' },
            { path: ['m', "0'", "0'"], curve: 'ed25519' },
          ],
        },
      ],
    });
  });
});

describe('validateBIP32CaveatPaths', () => {
  it.each([[], null, undefined, 'foo'])(
    'throws if the value is not an array or empty',
    (value) => {
      expect(() =>
        validateBIP32CaveatPaths({
          type: SnapCaveatType.PermittedDerivationPaths,
          value,
        }),
      ).toThrow(
        /^Invalid BIP-32 entropy caveat: At path: value -- Expected an? array/u,
      ); // Different error messages for different types
    },
  );

  it('throws if any of the paths is invalid', () => {
    expect(() =>
      validateBIP32CaveatPaths({
        type: SnapCaveatType.PermittedDerivationPaths,
        value: [{ path: ['foo'], curve: 'secp256k1' }],
      }),
    ).toThrow('At path: value.0.path -- Path must start with "m".');
  });
});

describe('PermittedDerivationPathsCaveatSpecification', () => {
  describe('decorator', () => {
    const params = { path: ['m', "44'", "1'"], curve: 'secp256k1' };

    it('returns the result of the method implementation', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      expect(
        await PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params }),
      ).toBe('foo');
    });

    it('allows deriving child nodes', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      expect(
        await PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toBe('foo');
    });

    it('allows deriving deep nodes', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      expect(
        await PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: [
              'm',
              "44'",
              "1'",
              "0'",
              '0',
              '1',
              '2',
              '3',
              '4',
              '5',
              '6',
              '7',
              '8',
              '9',
              '10',
            ],
            curve: 'secp256k1',
          },
        }),
      ).toBe('foo');
    });

    it('ignores unknown fields', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      expect(
        await PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", '0', '1'],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toBe('foo');
    });

    it('throws if the path is invalid', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      await expect(
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params: { ...params, path: [] } }),
      ).rejects.toThrow(
        'At path: path -- Path must be a non-empty BIP-32 derivation path array',
      );
    });

    it('throws if the path is not specified in the caveats', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      await expect(
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params: { ...params, path: ['m', "44'", "0'"] } }),
      ).rejects.toThrow(
        'The requested path is not permitted. Allowed paths must be specified in the snap manifest.',
      );
    });

    it('throws if the purpose is not allowed', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      await expect(
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [params],
          // @ts-expect-error Missing other required properties.
        })({ params: { ...params, path: ['m', SIP_6_MAGIC_VALUE, "0'"] } }),
      ).rejects.toThrow(
        'Invalid BIP-32 entropy path definition: At path: path -- The purpose "1399742832\'" is not allowed for entropy derivation.',
      );
    });

    it('throws if the path is not allowed', async () => {
      const fn = jest.fn().mockImplementation(() => 'foo');
      await expect(
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].decorator(fn, {
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['m', "44'", "60'"], curve: 'secp256k1' }],
          // @ts-expect-error Missing other required properties.
        })({ params: { ...params, path: ['m', "44'", "60'"] } }),
      ).rejects.toThrow(
        'Invalid BIP-32 entropy path definition: At path: path -- The path "m/44\'/60\'" is not allowed for entropy derivation.',
      );
    });
  });

  describe('validator', () => {
    it('throws if the caveat values are invalid', () => {
      expect(() =>
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].validator?.({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['foo'], curve: 'secp256k1' }],
        }),
      ).toThrow('At path: value.0.path -- Path must start with "m".');
    });

    it('throws if the caveat values contain forbidden paths', () => {
      expect(() =>
        PermittedDerivationPathsCaveatSpecification[
          SnapCaveatType.PermittedDerivationPaths
        ].validator?.({
          type: SnapCaveatType.PermittedDerivationPaths,
          value: [{ path: ['m', SIP_6_MAGIC_VALUE, "0'"], curve: 'secp256k1' }],
        }),
      ).toThrow(
        'Invalid BIP-32 entropy caveat: At path: value.0.path -- The purpose "1399742832\'" is not allowed for entropy derivation.',
      );
    });
  });
});
