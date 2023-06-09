import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { TEST_SECRET_RECOVERY_PHRASE_BYTES } from '@metamask/snaps-utils/test-utils';

import {
  getBip32PublicKeyBuilder,
  getBip32PublicKeyImplementation,
} from './getBip32PublicKey';

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
  };

  const specification = getBip32PublicKeyBuilder.specificationBuilder({
    methodHooks,
  });

  it('outputs expected specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getBip32PublicKey',
      allowedCaveats: [SnapCaveatType.PermittedDerivationPaths],
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "permittedDerivationPaths"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'permittedDerivationPaths', value: [] },
            { type: 'permittedDerivationPaths', value: [] },
          ],
        }),
      ).toThrow('Expected a single "permittedDerivationPaths" caveat.');
    });
  });
});

describe('getBip32PublicKeyImplementation', () => {
  describe('getBip32PublicKey', () => {
    it('derives the public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x0467f3cac111f47782b6c2d8d0984d51e22c128d24ec3eaca044509a386771d17206c740c7337c399d8ade8f52a60029340f288e11de82fffd3b69c5b863f6a515"`,
      );
    });

    it('derives the compressed public key from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        await getBip32PublicKeyImplementation({
          getUnlockPromise,
          getMnemonic,
          // @ts-expect-error Missing other required properties.
        })({
          params: {
            path: ['m', "44'", "1'", '1', '2', '3'],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x022de17487a660993177ce2a85bb73b6cd9ad436184d57bdf5a93f5db430bea914"`,
      );
    });
  });
});
