import {
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

  listAccounts = (_origin: string) => this.accounts;

  createAccount = (_origin: string, _address: string) => true;

  readAccount = () => undefined;

  updateAccount = () => undefined;

  removeAccount = () => undefined;
}

// describe('validateCaveatManageAccounts', () => {});

// describe('specificationBuilder', () => {});

// describe('manageAccountsCaveatMapper', () => {});

describe('manageAccountsImplementation', () => {
  let mockKeyring: SnapKeyringMock;

  beforeEach(() => {
    mockKeyring = new SnapKeyringMock();
  });

  it('should', () => {
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    const saveSnapKeyring = jest.fn().mockResolvedValue(undefined);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      saveSnapKeyring,
    });

    const accountList = manageAccounts({
      method: ManageAccountsOperation.ListAccounts,
      context: {
        origin: '',
        params: {},
      },
    });

    expect(accountList).toBe([]);
  });
});
