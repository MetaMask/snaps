import { SnapInterfaceController } from '@metamask/snaps-controllers';
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
import {
  Button,
  Text,
  Dropdown,
  Option,
  Box,
  Input,
} from '@metamask/snaps-sdk/jsx';
import {
  getJsxElementFromComponent,
  HandlerType,
  WrappedSnapError,
} from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
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
  selectInDropdown,
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
  const interfaceActions = {
    clickElement: jest.fn(),
    typeInField: jest.fn(),
    selectInDropdown: jest.fn(),
  };

  it('returns an `ok` function that resolves the user interface with `null` for alert dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Alert,
      <Text>foo</Text>,
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Alert,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBeNull();
  });

  it('returns an `ok` function that resolves the user interface with `true` for confirmation dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Confirmation,
      <Text>foo</Text>,
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBe(true);
  });

  it('returns a `cancel` function that resolves the user interface with `false` for confirmation dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Confirmation,
      <Text>foo</Text>,
      interfaceActions,
    );

    assert(response.type === DialogType.Confirmation);
    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.cancel();
    expect(await promise).toBe(false);
  });

  it('returns an `ok` function that resolves the user interface with the input value for prompt dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      <Text>foo</Text>,
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok('bar');
    expect(await promise).toBe('bar');
  });

  it('returns an `ok` function that resolves the user interface with an empty string for prompt dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      <Text>foo</Text>,
      interfaceActions,
    );

    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.ok();
    expect(await promise).toBe('');
  });

  it('returns a `cancel` function that resolves the user interface with `null` for prompt dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DialogType.Prompt,
      <Text>foo</Text>,
      interfaceActions,
    );

    assert(response.type === DialogType.Prompt);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.cancel();
    expect(await promise).toBeNull();
  });

  it('throws an error for unknown dialog types', () => {
    const { runSaga } = createStore(getMockOptions());

    expect(() => {
      // @ts-expect-error - Invalid dialog type.
      getInterfaceResponse(runSaga, 'Foo', <Text>foo</Text>);
    }).toThrow('Unknown or unsupported dialog type: "Foo".');
  });
});

describe('getElement', () => {
  it('gets an element at the root', () => {
    const content = button({ value: 'foo', name: 'bar' });
    const result = getElement(getJsxElementFromComponent(content), 'bar');

    expect(result).toStrictEqual({
      element: <Button name="bar">foo</Button>,
    });
  });

  it('gets an element with a given name inside a panel', () => {
    const content = panel([button({ value: 'foo', name: 'bar' })]);
    const result = getElement(getJsxElementFromComponent(content), 'bar');

    expect(result).toStrictEqual({
      element: <Button name="bar">foo</Button>,
    });
  });

  it('gets an element in a form', () => {
    const content = form('foo', [button({ value: 'foo', name: 'bar' })]);
    const result = getElement(getJsxElementFromComponent(content), 'bar');

    expect(result).toStrictEqual({
      element: <Button name="bar">foo</Button>,
      form: 'foo',
    });
  });

  it('gets an element in a form when there are multiple forms', () => {
    const content = panel([
      form('form-1', [button({ value: 'foo', name: 'bar' })]),
      form('form-2', [button({ value: 'foo', name: 'baz' })]),
    ]);
    const result = getElement(getJsxElementFromComponent(content), 'baz');

    expect(result).toStrictEqual({
      element: <Button name="baz">foo</Button>,
      form: 'form-2',
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
      MOCK_SNAP_ID,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      getJsxElementFromComponent(content),
      MOCK_SNAP_ID,
      'bar',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
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
          context: null,
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
      MOCK_SNAP_ID,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      getJsxElementFromComponent(content),
      MOCK_SNAP_ID,
      'baz',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: '',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.ButtonClickEvent,
            name: 'baz',
          },
          id: interfaceId,
          context: null,
        },
      },
    });

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
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
          context: null,
        },
      },
    });
  });

  it('throws if there is no button with the given name in the interface', async () => {
    const content = button({ value: 'foo', name: 'foo' });

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      clickElement(
        rootControllerMessenger,
        interfaceId,
        getJsxElementFromComponent(content),
        MOCK_SNAP_ID,
        'baz',
      ),
    ).rejects.toThrow(
      'Could not find an element in the interface with the name "baz".',
    );

    expect(handleRpcRequestMock).not.toHaveBeenCalled();
  });

  it('throws if the element is not a button', async () => {
    const content = input({ value: 'foo', name: 'foo' });

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      clickElement(
        rootControllerMessenger,
        interfaceId,
        getJsxElementFromComponent(content),
        MOCK_SNAP_ID,
        'foo',
      ),
    ).rejects.toThrow(
      'Expected an element of type "Button", but found "Input".',
    );

    expect(handleRpcRequestMock).not.toHaveBeenCalled();
  });

  it('unwraps errors', async () => {
    const content = button({ value: 'foo', name: 'foo' });

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    handleRpcRequestMock.mockRejectedValue(
      new WrappedSnapError(new Error('bar')),
    );

    await expect(
      clickElement(
        rootControllerMessenger,
        interfaceId,
        getJsxElementFromComponent(content),
        MOCK_SNAP_ID,
        'foo',
      ),
    ).rejects.toThrow('bar');

    expect(handleRpcRequestMock).toHaveBeenCalled();
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
      MOCK_SNAP_ID,
      content,
    );

    await typeInField(
      rootControllerMessenger,
      interfaceId,
      getJsxElementFromComponent(content),
      MOCK_SNAP_ID,
      'bar',
      'baz',
    );

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:updateInterfaceState',
      interfaceId,
      { bar: 'baz' },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
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
          context: null,
        },
      },
    });
  });

  it('throws if there is no inputs in the interface', async () => {
    const content = text('bar');

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      typeInField(
        rootControllerMessenger,
        interfaceId,
        getJsxElementFromComponent(content),
        MOCK_SNAP_ID,
        'bar',
        'baz',
      ),
    ).rejects.toThrow(
      'Could not find an element in the interface with the name "bar".',
    );
  });

  it('throws if the element is not an input', async () => {
    const content = button({ value: 'foo', name: 'foo' });

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      typeInField(
        rootControllerMessenger,
        interfaceId,
        getJsxElementFromComponent(content),
        MOCK_SNAP_ID,
        'foo',
        'baz',
      ),
    ).rejects.toThrow(
      'Expected an element of type "Input", but found "Button".',
    );
  });
});

describe('selectInDropdown', () => {
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

    const content = (
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    );

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await selectInDropdown(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'foo',
      'option2',
    );

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:updateInterfaceState',
      interfaceId,
      { foo: 'option2' },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: '',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.InputChangeEvent,
            name: 'foo',
            value: 'option2',
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('throws if selected option does not exist', async () => {
    const content = (
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    );

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectInDropdown(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'option3',
      ),
    ).rejects.toThrow(
      'The dropdown with the name "foo" does not contain "option3"',
    );
  });

  it('throws if there is no dropdowns in the interface', async () => {
    const content = (
      <Box>
        <Text>Foo</Text>
      </Box>
    );

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectInDropdown(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'bar',
        'baz',
      ),
    ).rejects.toThrow(
      'Could not find an element in the interface with the name "bar".',
    );
  });

  it('throws if the element is not a dropdown', async () => {
    const content = <Input name="foo" />;

    const interfaceId = await interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectInDropdown(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'baz',
      ),
    ).rejects.toThrow(
      'Expected an element of type "Dropdown", but found "Input".',
    );
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
    const { store, runSaga } = createStore(getMockOptions());

    const content = text('foo');
    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type, id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
    ).toPromise();
    expect(result).toStrictEqual({
      type,
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('waits for a user interface to be set if none is currently set', async () => {
    const { store, runSaga } = createStore(getMockOptions());

    const promise = runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
    ).toPromise();

    const content = text('foo');
    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type, id };
    store.dispatch(setInterface(ui));

    const result = await promise;
    expect(result).toStrictEqual({
      type,
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('sends a request to the snap when `clickElement` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const { store, runSaga } = createStore(getMockOptions());

    const content = button({ value: 'foo', name: 'foo' });
    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type, id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
    ).toPromise();

    await result.clickElement('foo');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
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
            context: null,
          },
        },
      },
    );
  });

  it('sends a request to the snap when `typeInField` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const { store, runSaga } = createStore(getMockOptions());

    const content = input('foo');
    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type, id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
    ).toPromise();

    await result.typeInField('foo', 'bar');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
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
            context: null,
          },
        },
      },
    );
  });

  it('sends a request to the snap when `selectInDropdown` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const { store, runSaga } = createStore(getMockOptions());

    const content = (
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    );
    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type, id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
    ).toPromise();

    await result.selectInDropdown('foo', 'option2');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
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
              value: 'option2',
            },
            id,
            context: null,
          },
        },
      },
    );
  });
});
