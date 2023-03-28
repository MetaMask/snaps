import { SnapCaveatType } from '@metamask/snaps-utils';

import {
  permittedDerivationPathsCaveatMapper,
  validateBIP32CaveatPaths,
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
