import {
  getManageStateImplementation,
  getValidatedParams,
  ManageStateOperation,
  specificationBuilder,
} from './manageState';

describe('snap_manageState', () => {
  const MOCK_SMALLER_STORAGE_SIZE_LIMIT = 10; // In bytes
  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        clearSnapState: jest.fn(),
        getSnapState: jest.fn(),
        updateSnapState: jest.fn(),
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
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(mockSnapState);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
      });

      const result = await manageStateImplementation({
        context: { origin: 'snap-origin' },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.getState },
      });

      expect(getSnapState).toHaveBeenCalledWith('snap-origin');
      expect(result).toStrictEqual(mockSnapState);
    });

    it('clears snap state', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
      });

      await manageStateImplementation({
        context: { origin: 'snap-origin' },
        method: 'snap_manageState',
        params: { operation: ManageStateOperation.clearState },
      });

      expect(clearSnapState).toHaveBeenCalledWith('snap-origin');
    });

    it('updates snap state', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
      });
      const newState = { data: 'updated data' };

      await manageStateImplementation({
        context: { origin: 'snap-origin' },
        method: 'snap_manageState',
        params: {
          operation: ManageStateOperation.updateState,
          newState,
        },
      });

      expect(updateSnapState).toHaveBeenCalledWith('snap-origin', newState);
    });

    it('throws an error on update if the new state is not plain object', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
      });
      const newState = (a: unknown) => {
        return a;
      };

      await expect(
        manageStateImplementation({
          context: { origin: 'snap-origin' },
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.updateState,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error - invalid type for testing purposes
            newState,
          },
        }),
      ).rejects.toThrow(
        'Invalid snap_manageState "updateState" parameter: The new state must be a plain object.',
      );

      expect(updateSnapState).not.toHaveBeenCalledWith('snap-origin', newState);
    });

    it('throws an error on update if the new state is not valid json serializable object', async () => {
      const clearSnapState = jest.fn().mockResolvedValueOnce(true);
      const getSnapState = jest.fn().mockResolvedValueOnce(true);
      const updateSnapState = jest.fn().mockResolvedValueOnce(true);

      const manageStateImplementation = getManageStateImplementation({
        clearSnapState,
        getSnapState,
        updateSnapState,
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
            operation: ManageStateOperation.updateState,
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
