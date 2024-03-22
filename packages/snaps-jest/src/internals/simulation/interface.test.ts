import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import {
  ButtonType,
  DialogType,
  UserInputEventType,
  button,
  form,
  input,
  panel,
  text,
} from '@metamask/snaps-sdk';
import { HandlerType } from '@metamask/snaps-utils';
import { assert } from '@metamask/utils';
import type { SagaIterator } from 'redux-saga';
import { take } from 'redux-saga/effects';

import {
  getMockOptions,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from '../../test-utils';
import {
  clickElement,
  getElement,
  getInterface,
  getInterfaceResponse,
  mergeValue,
  typeInField,
} from './interface';
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
  const interfaceActions = { clickElement: jest.fn(), typeInField: jest.fn() };
  it('returns an `ok` function that resolves the user interface with `null` for alert dialogs', async () => {
    const { runSaga } = createStore('password', getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Alert,
      text('foo'),
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Alert,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      interfaceActions,
    );

    assert(response.type === DialogType.Confirmation);
    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      interfaceActions,
    );

    assert(response.type === DialogType.Prompt);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: text('foo'),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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

describe('getElement', () => {
  it('gets an element at the root', () => {
    const content = button({ value: 'foo', name: 'bar' });

    const result = getElement(content, 'bar');

    expect(result).toStrictEqual({
      element: button({ value: 'foo', name: 'bar' }),
    });
  });

  it('gets an element with a given name inside a panel', () => {
    const content = panel([button({ value: 'foo', name: 'bar' })]);

    const result = getElement(content, 'bar');

    expect(result).toStrictEqual({
      element: button({ value: 'foo', name: 'bar' }),
    });
  });

  it('gets an element in a form', () => {
    const content = form('foo', [button({ value: 'foo', name: 'bar' })]);

    const result = getElement(content, 'bar');

    expect(result).toStrictEqual({
      element: button({ value: 'foo', name: 'bar' }),
      form: 'foo',
    });
  });
});

describe('clickElement', () => {
  const rootControllerMessenger = getRootControllerMessenger();
  const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
    rootControllerMessenger,
  );

  const interfaceController = new SnapInterfaceController({
    messenger: controllerMessenger,
  });

  const handleRpcRequestMock = jest.fn();

  rootControllerMessenger.registerActionHandler(
    'ExecutionService:handleRpcRequest',
    handleRpcRequestMock,
  );

  it('sends a ButtonClickEvent to the snap', async () => {
    const content = button({ value: 'foo', name: 'bar' });

    const interfaceId = await interfaceController.createInterface(
      'foo' as SnapId,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      content,
      'foo' as SnapId,
      'bar',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith('foo', {
      origin: '',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.ButtonClickEvent,
            name: 'bar',
          },
          id: interfaceId,
        },
      },
    });
  });

  it('sends a FormSubmitEvent to the snap', async () => {
    const content = form('bar', [
      input({ value: 'foo', name: 'foo' }),
      button({ value: 'baz', name: 'baz', buttonType: ButtonType.Submit }),
    ]);

    const interfaceId = await interfaceController.createInterface(
      'foo' as SnapId,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      content,
      'foo' as SnapId,
      'baz',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith('foo', {
      origin: '',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.FormSubmitEvent,
            name: 'bar',
            value: {
              foo: 'foo',
            },
          },
          id: interfaceId,
        },
      },
    });
  });

  it('throws if there is no button with the given name in the interface', async () => {
    const content = button({ value: 'foo', name: 'foo' });

    const interfaceId = await interfaceController.createInterface(
      'foo' as SnapId,
      content,
    );

    await expect(
      clickElement(
        rootControllerMessenger,
        interfaceId,
        content,
        'foo' as SnapId,
        'baz',
      ),
    ).rejects.toThrow('No button found in the interface.');

    expect(handleRpcRequestMock).not.toHaveBeenCalled();
  });
});

describe('mergeValue', () => {
  it('merges a value outside of a form', () => {
    const state = { foo: 'bar' };

    const result = mergeValue(state, 'foo', 'baz');

    expect(result).toStrictEqual({ foo: 'baz' });
  });

  it('merges a value inside of a form', () => {
    const state = { foo: { bar: 'baz' } };

    const result = mergeValue(state, 'bar', 'test', 'foo');

    expect(result).toStrictEqual({ foo: { bar: 'test' } });
  });
});

describe('typeInField', () => {
  const rootControllerMessenger = getRootControllerMessenger();
  const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
    rootControllerMessenger,
  );

  const interfaceController = new SnapInterfaceController({
    messenger: controllerMessenger,
  });

  const handleRpcRequestMock = jest.fn();

  rootControllerMessenger.registerActionHandler(
    'ExecutionService:handleRpcRequest',
    handleRpcRequestMock,
  );
  it('updates the interface state and sends an InputChangeEvent', async () => {
    jest.spyOn(rootControllerMessenger, 'call');

    const content = input('bar');

    const interfaceId = await interfaceController.createInterface(
      'foo' as SnapId,
      content,
    );

    await typeInField(
      rootControllerMessenger,
      interfaceId,
      content,
      'foo' as SnapId,
      'bar',
      'baz',
    );

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:updateInterfaceState',
      interfaceId,
      { bar: 'baz' },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith('foo', {
      origin: '',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.InputChangeEvent,
            name: 'bar',
            value: 'baz',
          },
          id: interfaceId,
        },
      },
    });
  });

  it('throws if there is no inputs in the interface', async () => {
    const content = text('bar');

    const interfaceId = await interfaceController.createInterface(
      'foo' as SnapId,
      content,
    );

    await expect(
      typeInField(
        rootControllerMessenger,
        interfaceId,
        content,
        'foo' as SnapId,
        'bar',
        'baz',
      ),
    ).rejects.toThrow('No input found in the interface.');
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
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
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
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('sends a request to the snap when `clickElement` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const { store, runSaga } = createStore('password', getMockOptions());

    const snapId = 'foo' as SnapId;
    const content = button({ value: 'foo', name: 'foo' });
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

    await result.clickElement('foo');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      snapId,
      {
        origin: '',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: UserInputEventType.ButtonClickEvent,
              name: 'foo',
            },
            id,
          },
        },
      },
    );
  });

  it('sends a request to the snap when `typeInField` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const { store, runSaga } = createStore('password', getMockOptions());

    const snapId = 'foo' as SnapId;
    const content = input('foo');
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

    await result.typeInField('foo', 'bar');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      snapId,
      {
        origin: '',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: UserInputEventType.InputChangeEvent,
              name: 'foo',
              value: 'bar',
            },
            id,
          },
        },
      },
    );
  });
});
