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
import {
  getPermittedHooks,
  getRestrictedHooks,
  installSnap,
  registerActions,
} from './simulation';
import { createStore, setInterface, setState } from './store';
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

describe('getRestrictedHooks', () => {
  it('returns the `getMnemonic` hook', async () => {
    const { getMnemonic } = getRestrictedHooks(getMockOptions());
    expect(await getMnemonic()).toStrictEqual(
      mnemonicPhraseToBytes(DEFAULT_SRP),
    );
  });

  it('returns the `getIsLocked` hook', async () => {
    const { getIsLocked } = getRestrictedHooks(getMockOptions());
    expect(getIsLocked()).toBe(false);
  });

  it('returns the `getClientCryptography` hook', async () => {
    const { getClientCryptography } = getRestrictedHooks(getMockOptions());

    expect(getClientCryptography()).toStrictEqual({});
  });
});

describe('getPermittedHooks', () => {
  const { runSaga, store } = createStore(getMockOptions());
  const controllerMessenger = getRootControllerMessenger();

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

    const { getSnapFile } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
    );

    const file = await getSnapFile('foo.json', AuxiliaryFileEncoding.Utf8);
    expect(file).toStrictEqual(value);

    await close();
  });

  it('returns the `getSnapState` hook', async () => {
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });

    const snapFiles = await fetchSnap(snapId, location);

    const { getSnapState } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
    );

    store.dispatch(
      setState({ state: JSON.stringify({ foo: 'bar' }), encrypted: true }),
    );

    expect(await getSnapState(true)).toStrictEqual({ foo: 'bar' });

    await close();
  });

  it('returns the `updateSnapState` hook', async () => {
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });

    const snapFiles = await fetchSnap(snapId, location);

    const { updateSnapState } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
    );

    store.dispatch(
      setState({ state: JSON.stringify({ foo: 'bar' }), encrypted: true }),
    );

    await updateSnapState({ bar: 'baz' }, true);

    expect(store.getState().state.encrypted).toStrictEqual(
      JSON.stringify({ bar: 'baz' }),
    );

    await close();
  });

  it('returns the `clearSnapState` hook', async () => {
    const { snapId, close } = await getMockServer({
      manifest: getSnapManifest(),
    });

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });

    const snapFiles = await fetchSnap(snapId, location);

    const { clearSnapState } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
    );

    store.dispatch(
      setState({ state: JSON.stringify({ foo: 'bar' }), encrypted: true }),
    );

    await clearSnapState(true);

    expect(store.getState().state.encrypted).toBeNull();

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

    const { createInterface } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
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

    const { createInterface, updateInterface } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
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

    const { createInterface, getInterfaceState } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
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

    const { createInterface, getInterfaceContext } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
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

    const location = detectSnapLocation(snapId, {
      allowLocal: true,
    });

    const snapFiles = await fetchSnap(snapId, location);

    const id = await snapInterfaceController.createInterface(
      snapId,
      text('foo'),
    );

    const { resolveInterface } = getPermittedHooks(
      snapId,
      snapFiles,
      controllerMessenger,
      runSaga,
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
