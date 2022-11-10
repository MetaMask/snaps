import { PermissionType } from '@metamask/controllers';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import { deriveEntropy, getEntropyBuilder } from './getEntropy';
import { ENTROPY_VECTORS } from './__fixtures__';

const TEST_SECRET_RECOVERY_PHRASE =
  'test test test test test test test test test test test ball';

describe('getEntropyBuilder', () => {
  it('has the expected shape', () => {
    expect(getEntropyBuilder).toStrictEqual({
      targetKey: 'snap_getEntropy',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getMnemonic: true,
        getUnlockPromise: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getMnemonic: jest.fn(),
      getUnlockPromise: jest.fn(),
    };

    expect(
      getEntropyBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetKey: 'snap_getEntropy',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
    });
  });
});

describe('deriveEntropy', () => {
  it.each(ENTROPY_VECTORS)(
    'derives entropy from the given parameters',
    async () => {
      const { snapId, salt, entropy } = ENTROPY_VECTORS[0];

      expect(
        await deriveEntropy(snapId, TEST_SECRET_RECOVERY_PHRASE, salt ?? ''),
      ).toStrictEqual(entropy);
    },
  );
});

describe('getEntropyImplementation', () => {
  it('returns the expected result', async () => {
    const getMnemonic = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE);

    const getUnlockPromise = jest.fn();

    const methodHooks = {
      getMnemonic,
      getUnlockPromise,
    };

    const implementation = getEntropyBuilder.specificationBuilder({
      methodHooks,
    }).methodImplementation;

    const result = await implementation({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'foo',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toStrictEqual(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );
  });
});
