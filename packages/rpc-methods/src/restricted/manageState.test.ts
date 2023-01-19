import { encrypt } from '@metamask/browser-passworder';
import {
  MOCK_LOCAL_SNAP_ID,
  MOCK_SNAP_ID,
  TEST_SECRET_RECOVERY_PHRASE_BYTES,
} from '@metamask/snaps-utils/test-utils';
import { ethErrors } from 'eth-rpc-errors';

import {
  getManageStateImplementation,
  getValidatedParams,
  ManageStateOperation,
  specificationBuilder,
} from './manageState';

Object.defineProperty(global, 'crypto', {
  value: {
    /* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
    ...require('crypto').webcrypto,
    subtle: require('crypto').webcrypto.subtle,
    /* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
    getRandomValues: (input: Uint8Array) => input.fill(0),
  },
});

// Encryption key for `MOCK_SNAP_ID`.
const ENCRYPTION_KEY =
  '0xd2f0a8e994b871ba4451ac383bf323cdaad8d554736355f2223e155692fbc446';

// Encryption key for `MOCK_LOCAL_SNAP_ID`.
const OTHER_ENCRYPTION_KEY =
  '0x7cd340349a41e0f7af62a9d97c76e96b12485e0206791d6b5638dd59736af8f5';

describe('snap_manageState', () => {
  const MOCK_SMALLER_STORAGE_SIZE_LIMIT = 10; // In bytes

  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        clearSnapState: jest.fn(),
        getSnapState: jest.fn(),
        updateSnapState: jest.fn(),
        getMnemonic: jest.fn(),
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
        permissionType: 'RestrictedMethod',
        targetKey: 'snap_manageState',
      });
    });
  });

  describe('getManageStateImplementation', () => {
    it('gets snap state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const mockEncryptedState = encrypt(ENCRYPTION_KEY, mockSnapState);

      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(mockEncryptedState);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
        getUnlockPromise: jest.fn(),
      });

      const result = await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.GetState },
      });

      expect(getSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID);
      expect(result).toStrictEqual(mockSnapState);
    });

    it('supports empty state', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(null);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
        getUnlockPromise: jest.fn(),
      });

      const result = await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.GetState },
      });

      expect(getSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID);
      expect(result).toBeNull();
    });

    it('clears snap state', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
        getUnlockPromise: jest.fn(),
      });

      await manageStateImplementation({
        context: { origin: MOCK_SNAP_ID },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.ClearState },
      });

      expect(clearSnapState).toHaveBeenCalledWith(MOCK_SNAP_ID);
    });

    it('updates snap state', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const mockEncryptedState = await encrypt(ENCRYPTION_KEY, mockSnapState);

      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
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
        mockEncryptedState,
      );
    });

    it('uses different encryption for different snap IDs', async () => {
      const mockSnapState = {
        some: {
          data: 'for a snap state',
        },
      };

      const mockEncryptedState = await encrypt(ENCRYPTION_KEY, mockSnapState);
      const mockOtherEncryptedState = await encrypt(
        OTHER_ENCRYPTION_KEY,
        mockSnapState,
      );

      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
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

      await manageStateImplementation({
        context: { origin: MOCK_LOCAL_SNAP_ID },
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.UpdateState,
          newState: mockSnapState,
        },
      });

      expect(updateSnapState).toHaveBeenCalledTimes(2);
      expect(updateSnapState).toHaveBeenNthCalledWith(
        1,
        MOCK_SNAP_ID,
        mockEncryptedState,
      );

      expect(updateSnapState).toHaveBeenNthCalledWith(
        2,
        MOCK_LOCAL_SNAP_ID,
        mockOtherEncryptedState,
      );
    });

    it('throws an error if the state is corrupt', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce('foo');
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
        getUnlockPromise: jest.fn(),
      });

      await expect(
        manageStateImplementation({
          context: { origin: MOCK_SNAP_ID },
          method: 'snap_manageState',
          params: { operation: ManageStateOperation.GetState },
        }),
      ).rejects.toThrow(
        ethErrors.rpc.internal({
          message: 'Failed to decrypt snap state, the state must be corrupted.',
        }),
      );
    });

    it('throws an error on update if the new state is not plain object', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
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

      expect(updateSnapState).not.toHaveBeenCalledWith(MOCK_SNAP_ID, newState);
    });

    it('throws an error on update if the new state is not valid json serializable object', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
        getMnemonic: jest
          .fn()
          .mockResolvedValue(TEST_SECRET_RECOVERY_PHRASE_BYTES),
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

      expect(updateSnapState).not.toHaveBeenCalledWith('snap-origin', newState);
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
