import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { ManageStateOperation } from '@metamask/snaps-sdk';
import {
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { webcrypto } from 'crypto';

import {
  getEncryptionEntropy,
  getManageStateImplementation,
  getValidatedParams,
  specificationBuilder,
} from './manageState';

// Encryption key for `MOCK_SNAP_ID`.
const ENCRYPTION_KEY =
  '0xd2f0a8e994b871ba4451ac383bf323cdaad8d554736355f2223e155692fbc446';

describe('getEncryptionEntropy', () => {
  it('returns the encryption entropy for the snap ID', async () => {
    const result = await getEncryptionEntropy({
      mnemonicPhrase: TEST_SECRET_RECOVERY_PHRASE_BYTES,
      snapId: MOCK_SNAP_ID,
    });

    expect(result).toBe(ENCRYPTION_KEY);
  });
});

describe('snap_manageState', () => {
  const MOCK_SMALLER_STORAGE_SIZE_LIMIT = 10; // In bytes

  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        clearSnapState: jest.fn(),
        getSnapState: jest.fn(),
        updateSnapState: jest.fn(),
        getUnlockPromise: jest.fn(),
      };

      expect(
        specificationBuilder({
          allowedCaveats: null,
          methodHooks,
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'snap_manageState',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getManageStateImplementation', () => {
    if (!('CryptoKey' in globalThis)) {
      // We can remove this once we drop Node 18
      Object.defineProperty(globalThis, 'CryptoKey', {
        value: webcrypto.CryptoKey,
      });
    }

    it('gets snap state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(mockSnapState);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      const result = await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.GetState },
      });

      expect(getSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID, true);
      expect(result).toStrictEqual(mockSnapState);
    });

    it('gets unencrypted state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(mockSnapState);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);
      const getUnlockPromise = jest.fn();

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise,
      });

      const result = await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.GetState, encrypted: false },
      });

      expect(getSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID, false);
      expect(getUnlockPromise).not.toHaveBeenCalled();
      expect(result).toStrictEqual(mockSnapState);
    });

    it('supports empty state', async () => {
      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(null);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      const result = await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.GetState },
      });

      expect(getSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID, true);
      expect(result).toBeNull();
    });

    it('clears snap state', async () => {
      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);
      const getUnlockPromise = jest.fn();

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise,
      });

      await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.ClearState },
      });

      expect(clearSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID, true);
      expect(getUnlockPromise).not.toHaveBeenCalled();
    });

    it('clears unencrypted snap state', async () => {
      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);
      const getUnlockPromise = jest.fn();

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise,
      });

      await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.ClearState,
          encrypted: false,
        },
      });

      expect(clearSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID, false);
      expect(getUnlockPromise).not.toHaveBeenCalled();
    });

    it('updates snap state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.UpdateState,
          newState: mockSnapState,
        },
      });

      expect(updateSnapState).toHaveBeenCalledWith(
        MOCK_SNAP_ID,
        mockSnapState,
        true,
      );
    });

    it('updates unencrypted snap state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest
        .fn()
        .mockReturnValueOnce(JSON.stringify(mockSnapState));
      const updateSnapState = jest.fn().mockReturnValueOnce(true);
      const getUnlockPromise = jest.fn();

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise,
      });

      await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.UpdateState,
          newState: mockSnapState,
          encrypted: false,
        },
      });

      expect(updateSnapState).toHaveBeenCalledWith(
        MOCK_SNAP_ID,
        mockSnapState,
        false,
      );
      expect(getUnlockPromise).not.toHaveBeenCalled();
    });

    it('accepts a string as operation', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      expect(async () =>
        manageStateImplementation({
          context: { origin: MOCK_SNAP_ID },
          method: 'snap_manageState',
          params: {
            operation: 'update',
            newState: mockSnapState,
          },
        }),
      ).not.toThrow();
    });

    it('throws an error on update if the new state is not plain object', async () => {
      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      const newState = (a: unknown) => {
        return a;
      };

      await expect(
        manageStateImplementation({
          context: { origin: MOCK_SNAP_ID },
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.UpdateState,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - invalid type for testing purposes
            newState,
          },
        }),
      ).rejects.toThrow(
        'Invalid snap_manageState "updateState" parameter: The new state must be a plain object.',
      );

      expect(updateSnapState).not.toHaveBeenCalledWith(
        MOCK_SNAP_ID,
        newState,
        true,
      );
    });

    it('throws an error on update if the new state is not valid json serializable object', async () => {
      const clearSnapState = jest.fn().mockReturnValueOnce(true);
      const getSnapState = jest.fn().mockReturnValueOnce(true);
      const updateSnapState = jest.fn().mockReturnValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getUnlockPromise: jest.fn(),
      });

      const newState = {
        something: {
          something: {
            invalidJson: () => 'a',
          },
        },
      };

      await expect(
        manageStateImplementation({
          context: { origin: 'snap-origin' },
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.UpdateState,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - invalid type for testing purposes
            newState,
          },
        }),
      ).rejects.toThrow(
        'Invalid snap_manageState "updateState" parameter: The new state must be JSON serializable.',
      );

      expect(updateSnapState).not.toHaveBeenCalledWith(
        'snap-origin',
        newState,
        true,
      );
    });
  });

  describe('getValidatedParams', () => {
    it('throws an error if the params is not an object', () => {
      expect(() => getValidatedParams([], 'snap_manageState')).toThrow(
        'Expected params to be a single object.',
      );
    });

    it('throws an error if the operation type is missing from params object', () => {
      expect(() =>
        getValidatedParams({ operation: undefined }, 'snap_manageState'),
      ).toThrow('Must specify a valid manage state "operation".');
    });

    it('throws an error if the operation type is not valid', () => {
      expect(() =>
        getValidatedParams(
          { operation: 'unspecifiedOperation' },
          'snap_manageState',
        ),
      ).toThrow('Must specify a valid manage state "operation".');
    });

    it('throws an error if encrypted flag is not valid', () => {
      expect(() =>
        getValidatedParams(
          { operation: 'get', encrypted: 'bar' },
          'snap_manageState',
        ),
      ).toThrow('"encrypted" parameter must be a boolean if specified.');
    });

    it('returns valid parameters for get operation', () => {
      expect(
        getValidatedParams({ operation: 'get' }, 'snap_manageState'),
      ).toStrictEqual({
        operation: 'get',
      });
    });

    it('returns valid parameters for clear operation', () => {
      expect(
        getValidatedParams({ operation: 'clear' }, 'snap_manageState'),
      ).toStrictEqual({
        operation: 'clear',
      });
    });

    it('returns valid parameters for update operation', () => {
      expect(
        getValidatedParams(
          {
            operation: 'update',
            newState: { data: 'updated data' },
          },
          'snap_manageState',
        ),
      ).toStrictEqual({
        operation: 'update',
        newState: { data: 'updated data' },
      });
    });

    it('throws an error if the new state object is not valid plain object', () => {
      const mockInvalidNewStateObject = (a: unknown) => {
        return a;
      };

      expect(() =>
        getValidatedParams(
          { operation: 'update', newState: mockInvalidNewStateObject },
          'snap_manageState',
        ),
      ).toThrow(
        'Invalid snap_manageState "updateState" parameter: The new state must be a plain object.',
      );
    });

    it('throws an error if the new state object is not valid JSON serializable object', () => {
      const mockInvalidNewStateObject = {
        something: {
          something: {
            invalidJson: () => 'a',
          },
        },
      };

      expect(() =>
        getValidatedParams(
          { operation: 'update', newState: mockInvalidNewStateObject },
          'snap_manageState',
        ),
      ).toThrow(
        'Invalid snap_manageState "updateState" parameter: The new state must be JSON serializable.',
      );
    });

    it('throws an error if the new state object is exceeding the JSON size limit', () => {
      const mockInvalidNewStateObject = {
        something: {
          something: {
            whatever: 'whatever',
          },
        },
      };

      expect(() =>
        getValidatedParams(
          { operation: 'update', newState: mockInvalidNewStateObject },
          'snap_manageState',
          MOCK_SMALLER_STORAGE_SIZE_LIMIT,
        ),
      ).toThrow(
        `Invalid snap_manageState "updateState" parameter: The new state must not exceed ${MOCK_SMALLER_STORAGE_SIZE_LIMIT} bytes in size.`,
      );
    });
  });
});
