import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';

import { createJsonRpcEngine } from './engine';
import { createStore } from '../store';
import { getMockOptions, getRootControllerMessenger } from '../test-utils';

describe('createJsonRpcEngine', () => {
  it('creates a JSON-RPC engine', async () => {
    const messenger = getRootControllerMessenger();

    messenger.registerActionHandler(
      'SnapController:getSnapFile',
      async () => 'foo',
    );

    const { store } = createStore(getMockOptions());
    const engine = createJsonRpcEngine({
      store,
      restrictedHooks: {
        getMnemonic: jest.fn(),
        getIsLocked: jest.fn(),
        getClientCryptography: jest.fn(),
        getSimulationState: jest.fn(),
        getSnap: jest.fn(),
        setCurrentChain: jest.fn(),
      },
      permittedHooks: {
        getIsActive: jest.fn(),
        getVersion: jest.fn(),
        getUnlockPromise: jest.fn(),
        trackError: jest.fn(),
        trackEvent: jest.fn(),
        startTrace: jest.fn(),
        endTrace: jest.fn(),
        getAllowedKeyringMethods: jest.fn(),
      },
      multichainHooks: {
        getAccounts: jest.fn(),
        getCaveat: jest.fn(),
        grantPermissions: jest.fn(),
        revokePermission: jest.fn(),
      },
      messenger,
      isMultichain: false,
      snapId: MOCK_SNAP_ID,
    });

    expect(engine).toBeDefined();
    expect(
      await engine.handle({
        jsonrpc: '2.0',
        id: 1,
        method: 'snap_getFile',
        params: {
          path: 'foo.json',
          encoding: 'utf8',
        },
      }),
    ).toStrictEqual({
      jsonrpc: '2.0',
      id: 1,
      result: 'foo',
    });
  });
});
