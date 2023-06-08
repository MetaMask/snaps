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
      targetName: 'snap_getBip32Entropy',
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
          params: { path: ['m', "44'", "1'"], curve: 'secp256k1' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "curve": "secp256k1",
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 1829122711,
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
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
            path: ['m', "44'", "1'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0xd2c83ffffa5266913c849306eaf3a095e779218c67fed620c6ab630d416692e9",
          "curve": "secp256k1",
          "depth": 5,
          "index": 1,
          "masterFingerprint": 1404659567,
          "parentFingerprint": 3495658567,
          "privateKey": "0x43a9353dfebf7209c3feb1843510299e2b0f4fa09151dccc3824df88451be37c",
          "publicKey": "0x0467f3cac111f47782b6c2d8d0984d51e22c128d24ec3eaca044509a386771d17206c740c7337c399d8ade8f52a60029340f288e11de82fffd3b69c5b863f6a515",
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
            path: ['m', "44'", "1'", "0'", "0'", "1'"],
            curve: 'ed25519',
          },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x79344d249ed667aa7dcdfac0830822e1b3a99832c11926f9e69ca6e3c5014b5f",
          "curve": "ed25519",
          "depth": 5,
          "index": 2147483649,
          "masterFingerprint": 650419359,
          "parentFingerprint": 660188756,
          "privateKey": "0x5e6ebe8f5c33833e6c86f8769da173daa206b9dfd1956efcd2b115d82376bb5e",
          "publicKey": "0x0012affaf55babdfb59b76adcf00f69442f019974124639108470409d47e25e19f",
        }
      `);
    });
  });
});
