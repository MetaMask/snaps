import { PermissionType, SubjectType } from '@metamask/permission-controller';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { hmac } from '@noble/hashes/hmac';
import { sha512 } from '@noble/hashes/sha512';

import { getEntropyBuilder } from './getEntropy';

describe('getEntropyBuilder', () => {
  it('has the expected shape', () => {
    expect(getEntropyBuilder).toStrictEqual({
      targetName: 'snap_getEntropy',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getMnemonicSeed: true,
        getUnlockPromise: true,
        getClientCryptography: true,
      },
    });
  });

  it('returns the expected specification', () => {
    const methodHooks = {
      getMnemonicSeed: jest.fn(),
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
    const getMnemonicSeed = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getMnemonicSeed,
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
    const getMnemonicSeed = jest
      .fn()
      .mockImplementation(() => TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

    const getUnlockPromise = jest.fn();
    const getClientCryptography = jest.fn().mockReturnValue({});

    const methodHooks = {
      getMnemonicSeed,
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

    expect(getMnemonicSeed).toHaveBeenCalledWith('source-id');
  });

  it('uses custom client cryptography functions', async () => {
    const getUnlockPromise = jest.fn().mockResolvedValue(undefined);
    const getMnemonicSeed = jest
      .fn()
      .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_SEED_BYTES);

    const hmacSha512 = jest
      .fn()
      .mockImplementation((key: Uint8Array, data: Uint8Array) =>
        hmac(sha512, key, data),
      );
    const getClientCryptography = jest.fn().mockReturnValue({
      hmacSha512,
    });

    const methodHooks = {
      getMnemonicSeed,
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

    expect(hmacSha512).toHaveBeenCalledTimes(10);
  });
});
