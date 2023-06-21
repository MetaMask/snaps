import { SubjectType, PermissionType } from '@metamask/permission-controller';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import {
  methodName,
  manageAccountsBuilder,
  manageAccountsImplementation,
  specificationBuilder,
  validateParams,
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
    // eslint-disable-next-line @typescript-eslint/ban-types
    _saveSnapKeyring: Function,
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
        // @ts-expect-error Error expected.
        params: {},
      }),
    ).rejects.toThrow(
      'Invalid ManageAccount Arguments: An array of type SnapMessage was expected',
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
          origin: mockSnapId,
        },
        // @ts-expect-error Error expected.
        params: [123, {}],
      }),
    ).rejects.toThrow(
      'Invalid ManageAccount Arguments: The parameter "method" should be a non-empty string',
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
        origin: mockSnapId,
      },
      params: ['mock-method', { accountId: mockCAIP10Account }],
    });

    expect(createAccountSpy).toHaveBeenCalledTimes(1);
    expect(createAccountSpy).toHaveBeenCalledWith(mockSnapId, [
      'mock-method',
      { accountId: mockCAIP10Account },
    ]);
    expect(requestResponse).toBe(true);
    createAccountSpy.mockClear();
  });
});

describe('validateParams', () => {
  it('should throw an error if message is not an array', () => {
    expect(() => {
      validateParams('not an array');
    }).toThrow(
      'Invalid ManageAccount Arguments: An array of type SnapMessage was expected',
    );
  });

  it('should throw an error if method is not a string or is an empty string', () => {
    expect(() => {
      validateParams([123]);
    }).toThrow(
      'Invalid ManageAccount Arguments: The parameter "method" should be a non-empty string',
    );

    expect(() => {
      validateParams(['']);
    }).toThrow(
      'Invalid ManageAccount Arguments: The parameter "method" should be a non-empty string',
    );
  });

  it('should not throw an error if message is an array and method is a non-empty string', () => {
    expect(() => {
      validateParams(['validMethod']);
    }).not.toThrow();
  });
});
