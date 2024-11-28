import { mnemonicPhraseToBytes } from '@metamask/key-tree';
import {
  detectSnapLocation,
  fetchSnap,
  NodeProcessExecutionService,
  NodeThreadExecutionService,
  SnapInterfaceController,
} from '@metamask/snaps-controllers/node';
import { DIALOG_APPROVAL_TYPES } from '@metamask/snaps-rpc-methods';
import { AuxiliaryFileEncoding, text } from '@metamask/snaps-sdk';
import { VirtualFile } from '@metamask/snaps-utils';
import { getSnapManifest } from '@metamask/snaps-utils/test-utils';

import { DEFAULT_SRP } from './constants';
import { getHooks, installSnap, registerActions } from './simulation';
import { createStore, setInterface } from './store';
import {
  getMockOptions,
  getMockServer,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from './test-utils';

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

describe('getHooks', () => {
  const controllerMessenger = getRootControllerMessenger();

  it('returns the `getMnemonic` hook', async () => {
    const { snapId, close } = await getMockServer();

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { getMnemonic } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );

    await close();
  });

  it('returns the `getSnapFile` hook', async () => {
    const value = JSON.stringify({ bar: 'baz' });
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest({
        files: ['foo.json'],
      }),
      auxiliaryFiles: [
        new VirtualFile({
          path: 'foo.json',
          value,
        }),
      ],
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { getSnapFile } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );
    const file = await getSnapFile('foo.json', AuxiliaryFileEncoding.Utf8);
    expect(file).toStrictEqual(value);

    await close();
  });

  it('returns the `createInterface` hook', async () => {
    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const content = text('foo');
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { createInterface } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );
    await createInterface(content);

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      snapId,
      content,
    );

    await close();
  });

  it('returns the `updateInterface` hook', async () => {
    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const content = text('bar');
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { createInterface, updateInterface } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );

    const id = await createInterface(text('foo'));

    await updateInterface(id, content);

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      3,
      'SnapInterfaceController:updateInterface',
      snapId,
      id,
      content,
    );

    await close();
  });

  it('returns the `getInterfaceState` hook', async () => {
    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { createInterface, getInterfaceState } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );

    const id = await createInterface(text('foo'));

    const result = getInterfaceState(id);

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      3,
      'SnapInterfaceController:getInterface',
      snapId,
      id,
    );

    expect(result).toStrictEqual({});
    await close();
  });

  it('returns the `getInterfaceContext` hook', async () => {
    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { createInterface, getInterfaceContext } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );

    const id = await createInterface(text('foo'), { bar: 'baz' });

    const result = getInterfaceContext(id);

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      3,
      'SnapInterfaceController:getInterface',
      snapId,
      id,
    );

    expect(result).toStrictEqual({ bar: 'baz' });
    await close();
  });

  it('returns the `resolveInterface` hook', async () => {
    // eslint-disable-next-line no-new
    const snapInterfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    jest.spyOn(controllerMessenger, 'call');

    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });
    const id = await snapInterfaceController.createInterface(
      snapId,
      text('foo'),
    );

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { resolveInterface } = getHooks(
      getMockOptions({
        state: {
          ui: {
            current: {
              id,
              type: DIALOG_APPROVAL_TYPES.default,
            },
          },
        },
      }),
      snapFiles,
      snapId,
      controllerMessenger,
    );

    await resolveInterface(id, 'foobar');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      2,
      'SnapInterfaceController:resolveInterface',
      snapId,
      id,
      'foobar',
    );

    await close();
  });

  it('returns the `getIsLocked` hook', async () => {
    const { snapId, close } = await getMockServer();

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { getIsLocked } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );
    expect(getIsLocked()).toBe(false);

    await close();
  });

  it('returns the `getClientCryptography` hook', async () => {
    const { snapId, close } = await getMockServer();

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });
    const snapFiles = await fetchSnap(snapId, location);

    const { getClientCryptography } = getHooks(
      getMockOptions(),
      snapFiles,
      snapId,
      controllerMessenger,
    );

    expect(getClientCryptography()).toStrictEqual({});

    await close();
  });
});

describe('registerActions', () => {
  const { runSaga, store } = createStore(getMockOptions());
  const controllerMessenger = getRootControllerMessenger(false);

  it('registers `PhishingController:maybeUpdateState`', async () => {
    registerActions(controllerMessenger, runSaga);

    expect(
      await controllerMessenger.call('PhishingController:maybeUpdateState'),
    ).toBeUndefined();
  });

  it('registers `PhishingController:testOrigin`', async () => {
    registerActions(controllerMessenger, runSaga);

    expect(
      controllerMessenger.call('PhishingController:testOrigin', 'foo'),
    ).toStrictEqual({ result: false, type: 'all' });
  });

  it('registers `ApprovalController:hasRequest`', async () => {
    registerActions(controllerMessenger, runSaga);

    store.dispatch(
      setInterface({ type: DIALOG_APPROVAL_TYPES.default, id: 'foo' }),
    );

    expect(
      controllerMessenger.call('ApprovalController:hasRequest', { id: 'foo' }),
    ).toBe(true);
  });

  it('registers `ApprovalController:acceptRequest`', async () => {
    registerActions(controllerMessenger, runSaga);

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
});
