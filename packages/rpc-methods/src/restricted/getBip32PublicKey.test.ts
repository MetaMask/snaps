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
            path: ['m', "44'", "60'", "0'", '0', '1'],
            curve: 'secp256k1',
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x04b21938e18aec1e2e7478988ccae5b556597d771c8e46ac2c8ea2a4a1a80619679230a109cd30e8af15856b15799e38991e45e55f406a8a24d5605ba0757da53c"`,
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
            path: ['m', "44'", "60'", '1', '2', '3'],
            curve: 'secp256k1',
            compressed: true,
          },
        }),
      ).toMatchInlineSnapshot(
        `"0x03a797bad3e493c256dc3064a8dd9f214f246e3ef954c767d8c6548040eee645b7"`,
      );
    });
  });
});
