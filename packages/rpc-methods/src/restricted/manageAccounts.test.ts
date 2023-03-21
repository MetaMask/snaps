import { PermissionType, OriginString } from '@metamask/permission-controller';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID, MOCK_ORIGIN } from '@metamask/snaps-utils/test-utils';

import {
  AccountType,
  MANAGE_ACCOUNT_PERMISSION_KEY,
  manageAccountsBuilder,
  validateCaveatManageAccounts,
  manageAccountsCaveatMapper,
  manageAccountsImplementation,
  ManageAccountsOperation,
  manageAccountsCaveatSpecification,
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

describe('validateCaveatManageAccounts', () => {
  it.each([[], null, undefined, 'foo', {}])(
    'throws if the value is not an object containing accountType and chainId',
    (value) => {
      expect(() =>
        validateCaveatManageAccounts({
          type: SnapCaveatType.ManageAccounts,
          value,
        }),
      ).toThrow('Expect object containing CAIP-2 chainId and accountType.');
    },
  );

  it('should not throw if caveat struct is correct', () => {
    expect(() =>
      validateCaveatManageAccounts({
        type: SnapCaveatType.ManageAccounts,
        value: {
          chainId: 'eip155:1',
          accountType: AccountType.EOA,
        },
      }),
    ).not.toThrow();
  });
});

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

      expect(() =>
        // @ts-expect-error Missing other required permission types.
        specification.validator({
          caveats: [
            { type: 'manageAccounts', value: [] },
            { type: 'manageAccounts', value: [] },
          ],
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

describe('manageAccountsCaveatMapper', () => {
  it('returns a caveat value for an object containing chainId and accountType', () => {
    expect(
      manageAccountsCaveatMapper({
        chainId: 'eip155:1',
        accountType: 'externally-owned-account',
      }),
    ).toStrictEqual({
      caveats: [
        {
          type: SnapCaveatType.ManageAccounts,
          value: {
            chainId: 'eip155:1',
            accountType: 'externally-owned-account',
          },
        },
      ],
    });
  });
});

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

  it('should throw if account type is not correct', async () => {
    const mockKeyring = new SnapKeyringMock();
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
          accountType: 'bad account type' as AccountType,
          accountId: mockCAIP10Account,
        },
      }),
    ).rejects.toThrow(
      'Invalid ManageAccount Arguments: Account Type bad account type is not supported',
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

describe('manageAccountsCaveatSpecification', () => {
  describe('validator', () => {
    it('throws for an invalid caveat object', () => {
      expect(() => {
        manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].validator?.({
          type: SnapCaveatType.ManageAccounts,
          value: {},
        });
      }).toThrow('Expect object containing CAIP-2 chainId and accountType.');
    });

    it('validates the chainId and account type', () => {
      expect(() => {
        manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].validator?.({
          type: SnapCaveatType.ManageAccounts,
          value: {
            chainId: 'eip155:1',
            accountType: AccountType.EOA,
          },
        });
      }).not.toThrow();
    });

    it("fails if the chainId doesn't use CAIP2", () => {
      expect(() => {
        manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].validator?.({
          type: SnapCaveatType.ManageAccounts,
          value: {
            chainId: 'fake chain id',
            accountType: AccountType.EOA,
          },
        });
      }).toThrow('Expect object containing CAIP-2 chainId and accountType.');
    });

    it('fails if account type is not EOA', () => {
      expect(() => {
        manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].validator?.({
          type: SnapCaveatType.ManageAccounts,
          value: {
            chainId: 'eip155:1',
            accountType: 'unknown type',
          },
        });
      }).toThrow('Expect object containing CAIP-2 chainId and accountType.');
    });
  });

  describe('decorator', () => {
    const params = {};
    const context: { origin: OriginString } = { origin: MOCK_ORIGIN };
    it('returns the result of the method implementation', async () => {
      const caveat = {
        type: SnapCaveatType.ManageAccounts,
        value: {
          chainId: 'eip155:1',
          accountType: AccountType.EOA,
        },
      };
      const method = jest.fn().mockImplementation(() => 'foo');
      expect(
        await manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].decorator(
          method,
          caveat,
        )({ method: 'listAccounts', params, context }),
      ).toBe('foo');
    });

    it('throws if the keyring method is incorrect', async () => {
      const method = jest.fn().mockImplementation(() => 'foo');
      const caveat = {
        type: SnapCaveatType.ManageAccounts,
        value: { foo: {} },
      };
      await expect(
        manageAccountsCaveatSpecification[
          SnapCaveatType.ManageAccounts
        ].decorator(
          method,
          caveat,
        )({ method: 'signCoolTx', params, context }),
      ).rejects.toThrow(`Invalid Keyring Method signCoolTx`);
    });
  });
});
