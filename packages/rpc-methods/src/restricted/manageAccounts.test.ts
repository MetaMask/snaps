import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  methodName,
  manageAccountsBuilder,
  manageAccountsImplementation,
  ManageAccountsOperation,
  specificationBuilder,
} from './manageAccounts';

// To Do:
// Move the class SnapKeyring to it's own module
// add mock the method in this test instead of the entire class
class SnapKeyringMock {
  static type = 'Snap Keyring';

  accounts: string[] = [];

  listAccounts = async (_origin: string): Promise<string[]> => this.accounts;

  createAccount = async (_origin: string, _address: string) => true;

  readAccount = async () => {
    return {};
  };

  updateAccount = async () => {
    return {};
  };

  removeAccount = async (): Promise<boolean> => true;
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
      subjectTypes: [SubjectType.Internal, SubjectType.Snap],
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
  const mockCAIP10Account =
    'eip155:1:0xab16a96D359eC26a11e2C2b3d8f8B8942d5Bfcdb';
  const mockSnapId = MOCK_SNAP_ID;

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
          origin: mockSnapId,
        },
        // @ts-expect-error Missing other required permission types.
        params: {},
      }),
    ).rejects.toThrow('Invalid ManageAccount Arguments');
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
          origin: mockSnapId,
        },
        // @ts-expect-error Missing other required permission types.
        params: {},
      }),
    ).rejects.toThrow('Invalid ManageAccount Arguments');

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: mockSnapId,
        },
        params: {
          action: ManageAccountsOperation.CreateAccount,
        },
      }),
    ).rejects.toThrow('Invalid ManageAccount Arguments: Missing accountId');
  });

  it('should list accounts', async () => {
    // TODO: Change to use actual snapKeyring and mock the methods
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const listAccoutnSpy = jest
      .spyOn(mockKeyring, 'listAccounts')
      .mockResolvedValue([mockCAIP10Account]);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const accountList = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: mockSnapId, // snap id origin
      },
      params: {
        action: ManageAccountsOperation.ListAccounts,
        accountId: mockCAIP10Account,
      },
    });

    expect(listAccoutnSpy).toHaveBeenCalledTimes(1);
    expect(listAccoutnSpy).toHaveBeenCalledWith(mockSnapId);
    expect(accountList).toStrictEqual([mockCAIP10Account]);
  });

  it('should create an account', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const createAccountSpy = jest
      .spyOn(mockKeyring, 'createAccount')
      .mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const createAccountSuccessResponse = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: mockSnapId,
      },
      params: {
        action: ManageAccountsOperation.CreateAccount,
        accountId: mockCAIP10Account,
      },
    });

    expect(createAccountSpy).toHaveBeenCalledTimes(1);
    expect(createAccountSpy).toHaveBeenCalledWith(
      mockSnapId,
      mockCAIP10Account,
    );
    expect(createAccountSuccessResponse).toBe(true);
    createAccountSpy.mockClear();
  });

  it('should throw if CAIP10 accounts is not correct', async () => {
    const mockKeyring = new SnapKeyringMock();
    const mockBadCAIP10Account = 'bad account';
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const createAccountSpy = jest.spyOn(mockKeyring, 'createAccount');

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: mockSnapId,
        },
        params: {
          action: ManageAccountsOperation.CreateAccount,
          accountId: mockBadCAIP10Account,
        },
      }),
    ).rejects.toThrow('Invalid CAIP10 Account bad account');
    expect(createAccountSpy).toHaveBeenCalledTimes(0);
  });

  it('should read an account', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const readAccountSpy = jest
      .spyOn(mockKeyring, 'readAccount')
      .mockResolvedValue({
        caip20Account: mockCAIP10Account,
        data: 'mockdata',
      });

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const account = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: mockSnapId,
      },
      params: {
        action: ManageAccountsOperation.ReadAccount,
        accountId: mockCAIP10Account,
      },
    });

    expect(readAccountSpy).toHaveBeenCalledTimes(1);
    expect(readAccountSpy).toHaveBeenCalledWith(mockSnapId, mockCAIP10Account);
    expect(account).toStrictEqual({
      caip20Account: mockCAIP10Account,
      data: 'mockdata',
    });
  });

  it('should update account', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const updateAccountSpy = jest
      .spyOn(mockKeyring, 'updateAccount')
      .mockResolvedValue({
        account: mockCAIP10Account,
        data: 'mockdata',
      });

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const account = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: mockSnapId,
      },
      params: {
        action: ManageAccountsOperation.UpdateAccount,
        accountId: mockCAIP10Account,
      },
    });

    expect(updateAccountSpy).toHaveBeenCalledTimes(1);
    expect(updateAccountSpy).toHaveBeenCalledWith(
      mockSnapId,
      mockCAIP10Account,
    );
    expect(account).toStrictEqual({
      account: mockCAIP10Account,
      data: 'mockdata',
    });
  });

  it('should remove account', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const removeAccountSpy = jest
      .spyOn(mockKeyring, 'removeAccount')
      .mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const account = await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: mockSnapId,
      },
      params: {
        action: ManageAccountsOperation.RemoveAccount,
        accountId: mockCAIP10Account,
      },
    });

    expect(removeAccountSpy).toHaveBeenCalledTimes(1);
    expect(removeAccountSpy).toHaveBeenCalledWith(
      mockSnapId,
      mockCAIP10Account,
    );
    expect(account).toBe(true);
  });

  it("should not remove account that isn't in the keyring", async () => {
    const mockUnknownCAIP10Account = 'eip155:1:0xunknown';
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    jest.spyOn(mockKeyring, 'removeAccount').mockResolvedValue(false);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: mockSnapId,
        },
        params: {
          action: ManageAccountsOperation.RemoveAccount,
          accountId: mockUnknownCAIP10Account,
        },
      }),
    ).rejects.toThrow(
      `Invalid ManageAccount Request: Unknown account ${mockUnknownCAIP10Account}`,
    );
  });

  it('should throw if when it is an invalid action', async () => {
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
          origin: mockSnapId,
        },
        params: {
          action: 'unknown action' as ManageAccountsOperation,
          accountId: mockCAIP10Account,
        },
      }),
    ).rejects.toThrow(
      'Invalid ManageAccount Request: The request unknown action is not supported',
    );
  });
});
