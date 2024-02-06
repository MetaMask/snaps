import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { DialogType, text } from '@metamask/snaps-sdk';
import { assert } from '@metamask/utils';
import type { SagaIterator } from 'redux-saga';
import { take } from 'redux-saga/effects';

import {
  getMockOptions,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from '../../test-utils';
import { getInterface, getInterfaceResponse } from './interface';
import type { RunSagaFunction } from './store';
import { createStore, resolveInterface, setInterface } from './store';

/**
 * Wait for the `resolveInterface` action to be dispatched and return the
 * resolved value.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns The resolved value.
 */
async function getResolve(runSaga: RunSagaFunction) {
  return runSaga(function* (): SagaIterator {
    const { payload } = yield take(resolveInterface);
    return payload;
  }).toPromise();
}

describe('getInterfaceResponse', () => {
  it('returns an `ok` function that resolves the user interface with `null` for alert dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Alert,
      text('foo'),
    );

    expect(response).toStrictEqual({
      type: DialogType.Alert,
      content: text('foo'),
      ok: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBeNull();
  });

  it('returns an `ok` function that resolves the user interface with `true` for confirmation dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Confirmation,
      text('foo'),
    );

    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: text('foo'),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBe(true);
  });

  it('returns a `cancel` function that resolves the user interface with `false` for confirmation dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Confirmation,
      text('foo'),
    );

    assert(response.type === DialogType.Confirmation);
    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: text('foo'),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.cancel();
    expect(await promise).toBe(false);
  });

  it('returns an `ok` function that resolves the user interface with the input value for prompt dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      text('foo'),
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok('bar');
    expect(await promise).toBe('bar');
  });

  it('returns an `ok` function that resolves the user interface with an empty string for prompt dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      text('foo'),
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBe('');
  });

  it('returns a `cancel` function that resolves the user interface with `null` for prompt dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      text('foo'),
    );

    assert(response.type === DialogType.Prompt);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.cancel();
    expect(await promise).toBeNull();
  });

  it('throws an error for unknown dialog types', () => {
    const { runSaga } = createStore('password', getMockOptions());

    expect(() => {
      // @ts-expect-error - Invalid dialog type.
      getInterfaceResponse(runSaga, 'Foo', text('foo'));
    }).toThrow('Unknown or unsupported dialog type: "Foo".');
  });
});

describe('getInterface', () => {
  const rootControllerMessenger = getRootControllerMessenger();
  const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
    rootControllerMessenger,
  );

  const interfaceController = new SnapInterfaceController({
    messenger: controllerMessenger,
  });
  it('returns the current user interface, if any', async () => {
    const { store, runSaga } = createStore('password', getMockOptions());

    const snapId = 'foo' as SnapId;
    const content = text('foo');
    const id = await interfaceController.createInterface(snapId, content);
    const type = DialogType.Alert;
    const ui = { type, id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      snapId,
      rootControllerMessenger,
    ).toPromise();
    expect(result).toStrictEqual({
      type,
      content,
      ok: expect.any(Function),
    });
  });

  it('waits for a user interface to be set if none is currently set', async () => {
    const { store, runSaga } = createStore('password', getMockOptions());

    const snapId = 'foo' as SnapId;

    const promise = runSaga(
      getInterface,
      runSaga,
      snapId,
      rootControllerMessenger,
    ).toPromise();

    const content = text('foo');
    const id = await interfaceController.createInterface(snapId, content);
    const type = DialogType.Alert;
    const ui = { type, id };
    store.dispatch(setInterface(ui));

    const result = await promise;
    expect(result).toStrictEqual({
      type,
      content,
      ok: expect.any(Function),
    });
  });
});
