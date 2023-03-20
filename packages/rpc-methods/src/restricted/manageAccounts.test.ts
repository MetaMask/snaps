import { PermissionType } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  AccountType,
  MANAGE_ACCOUNT_PERMISSION_KEY,
  manageAccountsBuilder,
  // manageAccountsCaveatSpecification,
  // validateCaveatManageAccounts,
  // specificationBuilder,
  // manageAccountsCaveatMapper,
  manageAccountsImplementation,
  ManageAccountsOperation,
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

  updateAccount = async () => undefined;

  removeAccount = async (): Promise<boolean> => true;
}

// describe('validateCaveatManageAccounts', () => {});

describe('specificationBuilder', () => {
  const methodHooks = {
    getSnapKeyring: jest.fn(),
    saveSnapKeyring: jest.fn(),
  };

  const specification = manageAccountsBuilder.specificationBuilder({
    methodHooks,
  });

  describe('validator', () => {
    it('throws if the caveat is not a single "manageAccounts"', () => {
      expect(() =>
        // @ts-expect-error Missing required permission types.
        specification.validator({}),
      ).toThrow('Expected a single "manageAccounts" caveat.');

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [{ type: 'foo', value: 'bar' }],
        }),
      ).toThrow('Expected a single "manageAccounts" caveat.');
    });

    it('should not throw and error if have the caveat has the correct form values for "manageAccounts"', () => {
      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            {
              type: 'manageAccounts',
              value: { chainId: 'foo', accountType: 'bar' },
            },
          ],
        }),
      ).not.toThrow();
    });
  });
});

// describe('manageAccountsCaveatMapper', () => {});

describe('builder', () => {
  it('has the expected shape', () => {
    expect(manageAccountsBuilder).toMatchObject({
      targetKey: MANAGE_ACCOUNT_PERMISSION_KEY,
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
      targetKey: MANAGE_ACCOUNT_PERMISSION_KEY,
      allowedCaveats: [SnapCaveatType.ManageAccounts],
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

    expect(listAccoutnSpy).toBeCalledTimes(1);
    expect(listAccoutnSpy).toBeCalledWith(mockSnapId);
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
        origin: mockSnapId, // snap id origin
      },
      params: {
        action: ManageAccountsOperation.CreateAccount,
        accountType: AccountType.EOA,
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
          accountType: AccountType.EOA,
          accountId: mockBadCAIP10Account,
        },
      }),
    ).rejects.toThrow('Invalid CAIP10 Account bad account');
    expect(createAccountSpy).toHaveBeenCalledTimes(0);
  });

  it('should throw error if caip10 network is not ethereum', async () => {
    const mockKeyring = new SnapKeyringMock();
    const mockInvalidNetowrkCAIP10Account =
      'bip122:000000000019d6689c085ae165831e93:128Lkh3S7CkDTBZ8W7BbpsN3YYizJMp8p6';
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const createAccountSpy = jest
      .spyOn(mockKeyring, 'createAccount')
      .mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: mockSnapId,
        },
        params: {
          action: ManageAccountsOperation.CreateAccount,
          accountType: AccountType.EOA,
          accountId: mockInvalidNetowrkCAIP10Account,
        },
      }),
    ).rejects.toThrow(
      `Invalid ManageAccount Arguments: Only ethereum EOA are supported.`,
    );

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

    expect(readAccountSpy).toBeCalledTimes(1);
    expect(readAccountSpy).toBeCalledWith(mockSnapId, mockCAIP10Account);
    expect(account).toStrictEqual({
      caip20Account: mockCAIP10Account,
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

    expect(removeAccountSpy).toBeCalledTimes(1);
    expect(removeAccountSpy).toBeCalledWith(mockSnapId, mockCAIP10Account);
    expect(account).toBe(true);
  });

  // it("should not remove account that isn't in the keyring", async () => {
  //   const mockUnknownCAIP10Account = 'eip155:1:0xunknown';
  //   const mockKeyring = new SnapKeyringMock();
  //   const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
  //   const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

  //   const removeAccountSpy = jest
  //     .spyOn(mockKeyring, 'removeAccount')
  //     .mockImplementation(false);

  //   const manageAccounts = manageAccountsImplementation({
  //     getSnapKeyring,
  //     saveSnapKeyring,
  //   });

  //   const account = await manageAccounts({
  //     method: 'snap_manageAccounts',
  //     context: {
  //       origin: mockSnapId,
  //     },
  //     params: {
  //       action: ManageAccountsOperation.RemoveAccount,
  //       accountId: mockUnknownCAIP10Account,
  //     },
  //   });

  //   expect(removeAccountSpy).toBeCalledTimes(1);
  //   expect(removeAccountSpy).toBeCalledWith(
  //     mockSnapId,
  //     mockUnknownCAIP10Account,
  //   );
  //   expect(account).toBe(false);
  // });

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
