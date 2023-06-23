import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  methodName,
  manageAccountsBuilder,
  manageAccountsImplementation,
  specificationBuilder,
} from './manageAccounts';

// To Do:
// Move the class SnapKeyring to it's own module
// add mock the method in this test instead of the entire class
class SnapKeyringMock {
  static type = 'Snap Keyring';

  accounts: string[] = [];

  handleKeyringSnapMessage = async (
    _origin: string,
    _params: any,
    _saveSnapKeyring: () => void,
  ): Promise<any> => {
    return true;
  };
}

describe('specification', () => {
  it('builds specification', () => {
    const methodHooks = {
      getSnapKeyring: jest.fn(),
      saveSnapKeyring: jest.fn(),
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
      targetName: methodName,
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('builder', () => {
  it('has the expected shape', () => {
    expect(manageAccountsBuilder).toMatchObject({
      targetName: methodName,
      specificationBuilder: expect.any(Function),
      methodHooks: {
        getSnapKeyring: true,
        saveSnapKeyring: true,
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      manageAccountsBuilder.specificationBuilder({
        methodHooks: {
          getSnapKeyring: jest.fn(),
          saveSnapKeyring: jest.fn(),
        },
      }),
    ).toMatchObject({
      permissionType: PermissionType.RestrictedMethod,
      targetName: methodName,
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
    });
  });
});

describe('manageAccountsImplementation', () => {
  const MOCK_CAIP_10_ACCOUNT =
    'eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb';

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw params are not set', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: MOCK_SNAP_ID,
        },
        // @ts-expect-error Error expected.
        params: {},
      }),
    ).rejects.toThrow(
      'At path: method -- Expected a string, but received: undefined',
    );
  });

  it('should throw params accountId is not set', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: MOCK_SNAP_ID,
        },
        // @ts-expect-error Error expected.
        params: { method: 123, params: {} },
      }),
    ).rejects.toThrow(
      'At path: method -- Expected a string, but received: 123',
    );
  });

  it('should route request to snap keyring', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const createAccountSpy = jest
      .spyOn(mockKeyring, 'handleKeyringSnapMessage')
      .mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const requestResponse = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: MOCK_SNAP_ID,
      },
      params: {
        method: 'deleteAccount',
        params: { accountId: MOCK_CAIP_10_ACCOUNT },
      },
    });

    expect(createAccountSpy).toHaveBeenCalledTimes(1);
    expect(createAccountSpy).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      method: 'deleteAccount',
      params: { accountId: MOCK_CAIP_10_ACCOUNT },
    });
    expect(requestResponse).toBe(true);
    createAccountSpy.mockClear();
  });
});
