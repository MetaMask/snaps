import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
} from '@metamask/snaps-utils/test-utils';

import {
  getBip44EntropyBuilder,
  getBip44EntropyImplementation,
} from './getBip44Entropy';

describe('specificationBuilder', () => {
  const methodHooks = {
    getMnemonic: jest.fn(),
    getUnlockPromise: jest.fn(),
    getClientCryptography: jest.fn(),
  };

  const specification = getBip44EntropyBuilder.specificationBuilder({
    methodHooks,
  });

  it('outputs expected specification', () => {
    expect(specification).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getBip44Entropy',
      allowedCaveats: [SnapCaveatType.PermittedCoinTypes],
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
      validator: expect.any(Function),
    });
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "permittedCoinTypes"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'permittedCoinTypes', value: [] },
            { type: 'permittedCoinTypes', value: [] },
          ],
        }),
      ).toThrow('Expected a single "permittedCoinTypes" caveat.');
    });
  });
});

describe('getBip44EntropyImplementation', () => {
  describe('getBip44Entropy', () => {
    it('derives the entropy from the path', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip44EntropyImplementation({
          getUnlockPromise,
          getMnemonic,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: { coinType: 1 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "network": "mainnet",
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);
    });

    it('calls `getMnemonic` with a different entropy source', async () => {
      const getMnemonic = jest
        .fn()
        .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);

      const getUnlockPromise = jest.fn();
      const getClientCryptography = jest.fn().mockReturnValue({});

      expect(
        await getBip44EntropyImplementation({
          getUnlockPromise,
          getMnemonic,
          getClientCryptography,
        })({
          method: 'snap_getBip44Entropy',
          context: { origin: MOCK_SNAP_ID },
          params: { coinType: 1, source: 'source-id' },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x50ccfa58a885b48b5eed09486b3948e8454f34856fb81da5d7b8519d7997abd1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 1404659567,
          "network": "mainnet",
          "parentFingerprint": 1829122711,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0xc73cedb996e7294f032766853a8b7ba11ab4ce9755fc052f2f7b9000044c99af",
          "publicKey": "0x048e129862c1de5ca86468add43b001d32fd34b8113de716ecd63fa355b7f1165f0e76f5dc6095100f9fdaa76ddf28aa3f21406ac5fda7c71ffbedb45634fe2ceb",
        }
      `);

      expect(getMnemonic).toHaveBeenCalledWith('source-id');
    });

    it('uses custom client cryptography functions', async () => {
      const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
      const getMnemonic = jest
        .fn()
        .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES);

      const pbkdf2Sha512 = jest.fn().mockResolvedValue(new Uint8Array(64));
      const getClientCryptography = jest.fn().mockReturnValue({
        pbkdf2Sha512,
      });

      expect(
        await getBip44EntropyImplementation({
          getUnlockPromise,
          getMnemonic,
          getClientCryptography,
          // @ts-expect-error Missing other required properties.
        })({
          params: { coinType: 1 },
        }),
      ).toMatchInlineSnapshot(`
        {
          "chainCode": "0x8472428420c7fd8ef7280545bb6d2bde1d7c6b490556ccd59895f242716388d1",
          "coin_type": 1,
          "depth": 2,
          "index": 2147483649,
          "masterFingerprint": 3276136937,
          "network": "mainnet",
          "parentFingerprint": 1981505209,
          "path": "m / bip32:44' / bip32:1'",
          "privateKey": "0x71d945aba22cd337ff26a107073ae2606dee5dbf7ecfe5c25870b8eaf62b9f1b",
          "publicKey": "0x0491c4b234ca9b394f40d90f09092e04fd3bca2aa68c57e1311b25acfd972c5a6fc7ffd19e7812127473aa2bd827917b6ec7b57bec73cf022fc1f1fa0593f48770",
        }
      `);

      expect(pbkdf2Sha512).toHaveBeenCalledTimes(1);
    });
  });
});
