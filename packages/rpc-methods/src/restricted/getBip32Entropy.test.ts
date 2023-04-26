import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { TEST_SECRET_RECOVERY_PHRASE_BYTES } from '@metamask/snaps-utils/test-utils';

import {
  getBip32EntropyBuilder,
  getBip32EntropyImplementation,
} from './getBip32Entropy';

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
  };

  const specification = getBip32EntropyBuilder.specificationBuilder({
    methodHooks,
  });

  it('outputs expected specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetKey: 'snap_getBip32Entropy',
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

describe('getBip32EntropyImplementation', () => {
  describe('getBip32Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: { path: ['m', "44'", "60'"], curve: 'secp256k1' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0xc4d424c253ca0eab92de6d8c819a37889e15a11bbf1cb6a48ffca2faef1f4d4d",
          "curve": "secp256k1",
          "depth": 2,
          "index": 2147483708,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 1829122711,
          "privateKey": "0xca8d3571710e2b08628926f0ec14983aded0fd039518c59522c004e0e7eb4f5a",
          "publicKey": "0x041e31e8432aab932fe18b5f9798b7252394ff0b943920b40c50a79301062df5ece2b884a45c456241e35000137e6dbd92c9119ccd5f46cc92ba9568ca661b994b",
        }
      `);
    });

    it('derives a BIP-44 path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: {
            path: ['m', "44'", "60'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x6265b647bc0e70480f29856be102fe866ea6a8ec9e2926c198c2e9c4cd268a43",
          "curve": "secp256k1",
          "depth": 5,
          "index": 1,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 942995271,
          "privateKey": "0x4adb19cafa5fdf467215fa30b56a50facac2dee40a7015063c6a7a0f1f4e2576",
          "publicKey": "0x04b21938e18aec1e2e7478988ccae5b556597d771c8e46ac2c8ea2a4a1a80619679230a109cd30e8af15856b15799e38991e45e55f406a8a24d5605ba0757da53c",
        }
      `);
    });

    it('derives a path using ed25519', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      expect(
        // @ts-expect-error Missing other required properties.
        await getBip32EntropyImplementation({ getUnlockPromise, getMnemonic })({
          params: {
            path: ['m', "44'", "60'", "0'", "0'", "1'"],
            curve: 'ed25519',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0xc258fb2565397094f6fbc5b21b5a51a2dd573748ba752b192babadcd21426015",
          "curve": "ed25519",
          "depth": 5,
          "index": 2147483649,
          "masterFingerprint": 650419359,
          "parentFingerprint": 497597606,
          "privateKey": "0x4ef4bf3da2c6a47495d24303b7c463dca03fe164ca1550f2d60aa68e5134d6c1",
          "publicKey": "0x009e76714baba27091db7a5abee8e1cd8416a5d78580e8dde15d68fb78ed930097",
        }
      `);
    });
  });
});
