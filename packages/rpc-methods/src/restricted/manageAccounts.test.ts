import { PermissionType } from '@metamask/permission-controller';
import {
  MANAGE_ACCOUNT_PERMISSION_KEY,
  manageAccountsBuilder,
  manageAccountsCaveatSpecification,
  // validateCaveatManageAccounts,
  // specificationBuilder,
  // manageAccountsCaveatMapper,
  manageAccountsImplementation,
  ManageAccountsOperation,
} from './manageAccounts';
import { SnapCaveatType } from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

// To Do:
// Move the class SnapKeyring to it's own module
// add mock the method in this test instead of the entire class
class SnapKeyringMock {
  static type = 'Snap Keyring';

  accounts: string[] = [];

  listAccounts = async (_origin: string): Promise<string[]> => this.accounts;

  createAccount = async (_origin: string, _address: string) => true;

  readAccount = async () => undefined;

  updateAccount = async () => undefined;

  removeAccount = async (): Promise<boolean> => true;
}

// describe('validateCaveatManageAccounts', () => {});

// describe('specificationBuilder', () => {});

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
      },
    });

    expect(listAccoutnSpy).toBeCalledTimes(1);
    expect(listAccoutnSpy).toBeCalledWith(mockSnapId);
    expect(accountList).toStrictEqual([mockCAIP10Account]);
  });

  it('should create an account', async () => {});

  it('should fail to create an account if the address is not CAIP10', async () => {});

  it('should read an account', async () => {});

  it('should remove account', async () => {});

  it("should not remove account that isn't in the keyring", async () => {});
});
