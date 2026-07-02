import {
  Caip25CaveatType,
  Caip25EndowmentPermissionName,
} from '@metamask/chain-agnostic-permission';
import { mnemonicPhraseToBytes, mnemonicToSeed } from '@metamask/key-tree';
import { PermissionDoesNotExistError } from '@metamask/permission-controller';
import {
  NodeProcessExecutionService,
  NodeThreadExecutionService,
} from '@metamask/snaps-controllers/node';
import { DIALOG_APPROVAL_TYPES } from '@metamask/snaps-rpc-methods';
import type { CaipAssetType, CaipChainId } from '@metamask/snaps-sdk';
import { AuxiliaryFileEncoding } from '@metamask/snaps-sdk';
import { VirtualFile } from '@metamask/snaps-utils';
import {
  getSnapManifest,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';
import { stringToBytes } from '@metamask/utils';

import { DEFAULT_ALTERNATIVE_SRP, DEFAULT_SRP } from './constants';
import { MOCK_CAVEAT } from './middleware/multichain/test-utils';
import {
  getMultichainHooks,
  getPermittedHooks,
  getRestrictedHooks,
  installSnap,
  registerActions,
} from './simulation';
import { createStore, setInterface } from './store';
import {
  getMockOptions,
  getMockServer,
  getRootControllerMessenger,
} from './test-utils';
import { addSnapMetadataToAccount } from './utils/account';

describe('installSnap', () => {
  it('installs a Snap and returns the execution service', async () => {
    const { snapId, close } = await getMockServer();
    const installedSnap = await installSnap(snapId);

    expect(installedSnap.executionService).toBeInstanceOf(
      NodeThreadExecutionService,
    );

    await close();
  });

  it('installs a Snap into a custom execution environment', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    const { request, close } = await installSnap(snapId, {
      executionService: NodeProcessExecutionService,
      options: {
        locale: 'nl',
      },
    });

    const response = await request({
      method: 'hello',
      params: {
        foo: 'bar',
      },
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'Hello, world!',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('allows specifying the locale', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return await snap.request({
            method: 'snap_getLocale',
          });
        };
      `,
      manifest: getSnapManifest({
        initialPermissions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_getLocale: {},
        },
      }),
    });

    const { request, close } = await installSnap(snapId, {
      options: {
        locale: 'nl',
      },
    });

    const response = await request({
      method: 'hello',
      params: {
        foo: 'bar',
      },
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'nl',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('allows specifying initial state', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return await snap.request({
            method: 'snap_manageState',
            params: {
              operation: 'get',
            },
          });
        };
      `,
      manifest: getSnapManifest({
        initialPermissions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_manageState: {},
        },
      }),
    });

    const { request, close } = await installSnap(snapId, {
      options: {
        state: {
          foo: 'bar',
        },
      },
    });

    const response = await request({
      method: 'hello',
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: {
            foo: 'bar',
          },
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });

  it('works without options', async () => {
    jest.spyOn(console, 'log').mockImplementation();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    const { request, close } = await installSnap(snapId);

    const response = await request({
      method: 'hello',
    });

    expect(response).toStrictEqual(
      expect.objectContaining({
        response: {
          result: 'Hello, world!',
        },
      }),
    );

    // `close` is deprecated because the Jest environment will automatically
    // close the Snap when the test finishes. However, we still need to close
    // the Snap in this test because it's run outside the Jest environment.
    await close();
    await closeServer();
  });
});

describe('getRestrictedHooks', () => {
  const options = getMockOptions();
  const { runSaga, store } = createStore(getMockOptions());

  it('returns the `getMnemonic` hook', async () => {
    const { getMnemonic } = getRestrictedHooks(options, store, runSaga);
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );
  });

  it('returns the `getIsLocked` hook', async () => {
    const { getIsLocked } = getRestrictedHooks(options, store, runSaga);
    expect(getIsLocked()).toBe(false);
  });

  it('returns the `getClientCryptography` hook', async () => {
    const { getClientCryptography } = getRestrictedHooks(
      options,
      store,
      runSaga,
    );

    expect(getClientCryptography()).toStrictEqual({});
  });

  it('returns the `getSimulationState` hook', async () => {
    const { getSimulationState } = getRestrictedHooks(options, store, runSaga);

    expect(getSimulationState()).toStrictEqual(store.getState());
  });
});

describe('getPermittedHooks', () => {
  const { runSaga } = createStore(getMockOptions());

  let controllerMessenger = getRootControllerMessenger();

  beforeEach(() => {
    controllerMessenger = getRootControllerMessenger();
  });

  it('returns the `getUnlockPromise` hook', async () => {
    const { getUnlockPromise } = getPermittedHooks(
      MOCK_SNAP_ID,
      controllerMessenger,
      runSaga,
    );

    expect(await getUnlockPromise(true)).toBeUndefined();
  });

  it('returns the `getIsActive` hook', async () => {
    const { getIsActive } = getPermittedHooks(
      MOCK_SNAP_ID,
      controllerMessenger,
      runSaga,
    );

    expect(getIsActive()).toBe(true);
  });

  it('returns the `getVersion` hook', async () => {
    const { getVersion } = getPermittedHooks(
      MOCK_SNAP_ID,
      controllerMessenger,
      runSaga,
    );

    expect(getVersion()).toBe('13.6.0-flask.0');
  });

  it('returns the `getAllowedKeyringMethods` hook', async () => {
    const { getAllowedKeyringMethods } = getPermittedHooks(
      MOCK_SNAP_ID,
      controllerMessenger,
      runSaga,
    );

    expect(getAllowedKeyringMethods()).toStrictEqual([]);
  });

  it('returns the `getMessenger` hook', () => {
    const { getMessenger } = getPermittedHooks(
      MOCK_SNAP_ID,
      controllerMessenger,
      runSaga,
    );

    const messenger = getMessenger({
      actions: ['PhishingController:testOrigin'],
    });

    expect(
      messenger.call('PhishingController:testOrigin', 'https://example.com'),
    ).toStrictEqual({
      result: false,
      type: 'all',
    });
  });
});

describe('getMultichainHooks', () => {
  let controllerMessenger = getRootControllerMessenger();

  beforeEach(() => {
    controllerMessenger = getRootControllerMessenger();
  });

  it('returns `getMnemonic`', () => {
    const options = getMockOptions();
    const hooks = getMultichainHooks(
      MOCK_SNAP_ID,
      options,
      controllerMessenger,
    );

    const result = hooks.getAccounts();
    expect(result).toStrictEqual(options.accounts);
  });

  it('returns `grantPermissions`', () => {
    const grantPermissions = jest.fn();
    controllerMessenger.registerActionHandler(
      'PermissionController:grantPermissions',
      grantPermissions,
    );

    const hooks = getMultichainHooks(
      MOCK_SNAP_ID,
      getMockOptions(),
      controllerMessenger,
    );

    hooks.grantPermissions({
      [Caip25EndowmentPermissionName]: { caveats: [MOCK_CAVEAT] },
    });

    expect(grantPermissions).toHaveBeenCalledWith({
      subject: { origin: MOCK_SNAP_ID },
      approvedPermissions: {
        [Caip25EndowmentPermissionName]: { caveats: [MOCK_CAVEAT] },
      },
    });
  });

  it('returns `revokePermission`', () => {
    const revokePermissions = jest.fn().mockImplementation((permissions) => {
      throw new PermissionDoesNotExistError(
        MOCK_SNAP_ID,
        permissions[MOCK_SNAP_ID],
      );
    });
    controllerMessenger.registerActionHandler(
      'PermissionController:revokePermissions',
      revokePermissions,
    );

    const hooks = getMultichainHooks(
      MOCK_SNAP_ID,
      getMockOptions(),
      controllerMessenger,
    );

    hooks.revokePermission(Caip25EndowmentPermissionName);

    expect(revokePermissions).toHaveBeenCalledWith({
      [MOCK_SNAP_ID]: [Caip25EndowmentPermissionName],
    });
  });

  it('returns `getCaveat`', () => {
    const getCaveat = jest.fn().mockImplementation((permissions) => {
      throw new PermissionDoesNotExistError(
        MOCK_SNAP_ID,
        permissions[MOCK_SNAP_ID],
      );
    });
    controllerMessenger.registerActionHandler(
      'PermissionController:getCaveat',
      getCaveat,
    );

    const hooks = getMultichainHooks(
      MOCK_SNAP_ID,
      getMockOptions(),
      controllerMessenger,
    );

    expect(
      hooks.getCaveat(Caip25EndowmentPermissionName, Caip25CaveatType),
    ).toBeUndefined();

    expect(getCaveat).toHaveBeenCalledWith(
      MOCK_SNAP_ID,
      Caip25EndowmentPermissionName,
      Caip25CaveatType,
    );
  });
});

describe('registerActions', () => {
  const mockedAssets = {
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105': {
      name: 'Solana',
      symbol: 'SOL',
    },
    'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
      {
        name: 'USDC',
        symbol: 'USDC',
      },
  };

  const mockedAccounts = [
    {
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      selected: true,
      address: '7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      name: 'My Solana Account',
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipChainId[],
      assets: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/slip44:105',
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ] as CaipAssetType[],
    },
    {
      id: '4748765d-4e55-4a8a-ace1-fc0316f6cbeb',
      address: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
      name: 'My Solana Account 2',
      scopes: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'] as CaipChainId[],
    },
  ];

  const options = getMockOptions({
    accounts: mockedAccounts,
    assets: mockedAssets,
  });

  const { runSaga, store } = createStore(options);
  const controllerMessenger = getRootControllerMessenger(false);

  it('registers `PhishingController:testOrigin`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call('PhishingController:testOrigin', 'foo'),
    ).toStrictEqual({ result: false, type: 'all' });
  });

  it('registers `ApprovalController:hasRequest`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    store.dispatch(
      setInterface({ type: DIALOG_APPROVAL_TYPES.default, id: 'foo' }),
    );

    expect(
      controllerMessenger.call('ApprovalController:hasRequest', { id: 'foo' }),
    ).toBe(true);
  });

  it('registers `ApprovalController:acceptRequest`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    store.dispatch(
      setInterface({ type: DIALOG_APPROVAL_TYPES.default, id: 'foo' }),
    );

    expect(
      await controllerMessenger.call(
        'ApprovalController:acceptRequest',
        'foo',
        'bar',
      ),
    ).toStrictEqual({ value: 'bar' });
  });

  it('registers `AccountsController:getAccountByAddress`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call(
        'AccountsController:getAccountByAddress',
        mockedAccounts[0].address,
      ),
    ).toStrictEqual(addSnapMetadataToAccount(mockedAccounts[0], MOCK_SNAP_ID));

    expect(
      controllerMessenger.call('AccountsController:getAccountByAddress', 'foo'),
    ).toBeUndefined();
  });

  it('registers `AccountsController:getSelectedMultichainAccount`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call(
        'AccountsController:getSelectedMultichainAccount',
      ),
    ).toStrictEqual(addSnapMetadataToAccount(mockedAccounts[0], MOCK_SNAP_ID));
  });

  it('returns `undefined` in `AccountsController:getSelectedMultichainAccount` if no account is selected', async () => {
    registerActions(
      controllerMessenger,
      runSaga,
      { ...options, accounts: [] },
      MOCK_SNAP_ID,
      [],
    );

    expect(
      controllerMessenger.call(
        'AccountsController:getSelectedMultichainAccount',
      ),
    ).toBeUndefined();
  });

  it('registers `AccountsController:listMultichainAccounts`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call('AccountsController:listMultichainAccounts'),
    ).toStrictEqual(
      mockedAccounts.map((account) =>
        addSnapMetadataToAccount(account, MOCK_SNAP_ID),
      ),
    );
  });

  it('registers `MultichainAssetsController:getState`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call('MultichainAssetsController:getState'),
    ).toStrictEqual({
      assetsMetadata: mockedAssets,
      accountsAssets: {
        [mockedAccounts[0].id]: mockedAccounts[0].assets,
        [mockedAccounts[1].id]: [],
      },
    });
  });

  it('registers `KeyringController:withKeyringV2Unsafe`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      await controllerMessenger.call(
        'KeyringController:withKeyringV2Unsafe',
        { type: 'hd' },
        ({ keyring }) => keyring,
      ),
    ).toStrictEqual({
      type: 'hd',
      mnemonic: mnemonicPhraseToBytes(DEFAULT_SRP),
      seed: await mnemonicToSeed(DEFAULT_SRP),
    });

    expect(
      await controllerMessenger.call(
        'KeyringController:withKeyringV2Unsafe',
        { id: 'alternative' },
        ({ keyring }) => keyring,
      ),
    ).toStrictEqual({
      type: 'hd',
      mnemonic: mnemonicPhraseToBytes(DEFAULT_ALTERNATIVE_SRP),
      seed: await mnemonicToSeed(DEFAULT_ALTERNATIVE_SRP),
    });
  });

  it('registers `RateLimitController:call`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      await controllerMessenger.call(
        'RateLimitController:call',
        MOCK_SNAP_ID,
        'showNativeNotification',
        MOCK_SNAP_ID,
        { message: 'Hello world!' },
      ),
    ).toBeNull();

    expect(
      await controllerMessenger.call(
        'RateLimitController:call',
        MOCK_SNAP_ID,
        'showInAppNotification',
        MOCK_SNAP_ID,
        { message: 'Hello world!' },
      ),
    ).toBeNull();
  });

  it('registers `KeyringController:getState`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, []);

    expect(
      controllerMessenger.call('KeyringController:getState'),
    ).toStrictEqual({
      isUnlocked: true,
      keyrings: [
        {
          type: 'HD Key Tree',
          metadata: {
            id: 'default',
            name: 'Default Secret Recovery Phrase',
          },
        },
        {
          type: 'HD Key Tree',
          metadata: {
            id: 'alternative',
            name: 'Alternative Secret Recovery Phrase',
          },
        },
      ],
    });
  });

  it('registers `SnapController:getSnapFile`', async () => {
    registerActions(controllerMessenger, runSaga, options, MOCK_SNAP_ID, [
      new VirtualFile({ value: stringToBytes('bar'), path: 'foo.txt' }),
    ]);

    expect(
      await controllerMessenger.call(
        'SnapController:getSnapFile',
        MOCK_SNAP_ID,
        'foo.txt',
        AuxiliaryFileEncoding.Utf8,
      ),
    ).toBe('bar');
  });
});
