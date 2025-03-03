import { PermissionType, SubjectType } from '@metamask/permission-controller';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
} from '@metamask/snaps-utils/test-utils';

import { getEntropyBuilder } from './getEntropy';

describe('getEntropyBuilder', () => {
  it('has the expected shape', () => {
    expect(getEntropyBuilder).toStrictEqual({
      targetName: 'snap_getEntropy',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getMnemonic: true,
        getUnlockPromise: true,
        getClientCryptography: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getMnemonic: jest.fn(),
      getUnlockPromise: jest.fn(),
      getClientCryptography: jest.fn(),
    };

    expect(
      getEntropyBuilder.specificationBuilder({ methodHooks }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_getEntropy',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('getEntropyImplementation', () => {
  it('returns the expected result', async () => {
    const getMnemonic = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);

    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getMnemonic,
      getUnlockPromise,
      getClientCryptography,
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

  it('calls `getMnemonic` with a different entropy source', async () => {
    const getMnemonic = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_BYTES);

    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getMnemonic,
      getUnlockPromise,
      getClientCryptography,
    };

    const implementation = getEntropyBuilder.specificationBuilder({
      methodHooks,
    }).methodImplementation;

    const result = await implementation({
      method: 'snap_getEntropy',
      params: {
        version: 1,
        salt: 'foo',
        source: 'source-id',
      },
      context: {
        origin: MOCK_SNAP_ID,
      },
    });

    expect(result).toBe(
      '0x6d8e92de419401c7da3cedd5f60ce5635b26059c2a4a8003877fec83653a4921',
    );

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

    const methodHooks = {
      getMnemonic,
      getUnlockPromise,
      getClientCryptography,
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
      '0x9bea47f2180fd874147f2f455a5ccc779826cfeff005605190cf0c568b3de7b5',
    );

    expect(pbkdf2Sha512).toHaveBeenCalledTimes(1);
  });
});
