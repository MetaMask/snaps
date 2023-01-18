import { PermissionType } from '@metamask/permission-controller';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
} from '@metamask/snaps-utils/test-utils';

import { getEntropyBuilder } from './getEntropy';

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

describe('getEntropyImplementation', () => {
  it('returns the expected result', async () => {
    const getMnemonic = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);

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

    expect(result).toBe(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );
  });
});
