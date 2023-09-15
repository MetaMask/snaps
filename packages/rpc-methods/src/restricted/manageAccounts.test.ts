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
  ): Promise<any> => {
    return true;
  };
}

describe('specification', () => {
  it('builds specification', () => {
    const methodHooks = {
      getSnapKeyring: jest.fn(),
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
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      manageAccountsBuilder.specificationBuilder({
        methodHooks: {
          getSnapKeyring: jest.fn(),
          startApprovalFlow: jest.fn(),
          requestUserApproval: jest.fn(),
          endApprovalFlow: jest.fn(),
          showApprovalError: jest.fn(),
          showApprovalSuccess: jest.fn(),
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

  const startApprovalFlow = jest.fn().mockReturnValue({ id: 'approvalId' });
  const requestUserApproval = jest.fn();
  const endApprovalFlow = jest.fn();
  const showApprovalSuccess = jest.fn();
  const showApprovalError = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw params are not set', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
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
      'Expected the value to satisfy a union of `object | object`, but received: [object Object]',
    );
  });

  it('should start and end approval flow correctly', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    requestUserApproval.mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
    });

    await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: MOCK_SNAP_ID,
      },
      // @ts-expect-error Error expected.
      params: {
        params: {
          method: 'addAccount',
          params: {},
        },
      },
    });

    expect(startApprovalFlow).toHaveBeenCalledTimes(1);
    expect(endApprovalFlow).toHaveBeenCalledTimes(1);
    expect(endApprovalFlow).toHaveBeenCalledWith({ id: 'approvalId' });
  });

  it('should handle user approval correctly', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    requestUserApproval.mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
    });

    await manageAccounts({
      method: 'snap_manageAccounts',
      context: {
        origin: MOCK_SNAP_ID,
      },
      // @ts-expect-error Error expected.
      params: {
        params: {
          method: 'addAccount',
          params: {},
        },
      },
    });

    expect(showApprovalSuccess).toHaveBeenCalledTimes(1);
    expect(showApprovalSuccess).toHaveBeenCalledWith({
      flowToEnd: 'approvalId',
      message: 'Your account is ready!',
    });
  });

  it('should handle user denial correctly and throw error', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);
    requestUserApproval.mockResolvedValue(false);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
    });

    await expect(
      manageAccounts({
        method: 'snap_manageAccounts',
        context: {
          origin: MOCK_SNAP_ID,
        },
        // @ts-expect-error Error expected.
        params: {
          params: {
            method: 'addAccount',
            params: {},
          },
        },
      }),
    ).rejects.toThrow('User denied account addition');

    expect(showApprovalError).not.toHaveBeenCalled();
    expect(endApprovalFlow).toHaveBeenCalledTimes(1);
  });

  it('should throw params accountId is not set', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
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
      'Expected the value to satisfy a union of `object | object`, but received: [object Object]',
    );
  });

  it('should route request to snap keyring', async () => {
    const mockKeyring = new SnapKeyringMock();
    const getSnapKeyring = jest.fn().mockResolvedValue(mockKeyring);

    const createAccountSpy = jest
      .spyOn(mockKeyring, 'handleKeyringSnapMessage')
      .mockResolvedValue(true);

    const manageAccounts = manageAccountsImplementation({
      getSnapKeyring,
      startApprovalFlow,
      requestUserApproval,
      endApprovalFlow,
      showApprovalSuccess,
      showApprovalError,
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
