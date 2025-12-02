import { SnapInterfaceController } from '@metamask/snaps-controllers';
import { DIALOG_APPROVAL_TYPES } from '@metamask/snaps-rpc-methods';
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
  RadioGroup,
  Radio,
  Box,
  AddressInput,
  Input,
  FileInput,
  Checkbox,
  Form,
  Container,
  Footer,
  SelectorOption,
  Card,
  Selector,
  Field,
  AccountSelector,
  AssetSelector,
  DateTimePicker,
} from '@metamask/snaps-sdk/jsx';
import {
  getJsxElementFromComponent,
  HandlerType,
  WrappedSnapError,
} from '@metamask/snaps-utils';
import { MOCK_SNAP_ID } from '@metamask/snaps-utils/test-utils';
import type { SagaIterator } from 'redux-saga';
import { take } from 'redux-saga/effects';

import {
  clickElement,
  getElement,
  getInterface,
  getInterfaceResponse,
  mergeValue,
  resolveWithSaga,
  selectInDropdown,
  selectFromRadioGroup,
  typeInField,
  uploadFile,
  selectFromSelector,
  waitForUpdate,
  getValueFromSelector,
  pickDateTime,
} from './interface';
import type { RunSagaFunction } from './store';
import { createStore, resolveInterface, setInterface } from './store';
import {
  getMockOptions,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from './test-utils';
import {
  assertIsAlertDialog,
  assertIsConfirmationDialog,
  assertIsCustomDialog,
  assertIsPromptDialog,
  assertCustomDialogHasFooter,
  assertCustomDialogHasPartialFooter,
  assertCustomDialogHasNoFooter,
} from './validation';

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
    pickDateTime: jest.fn(),
    typeInField: jest.fn(),
    selectInDropdown: jest.fn(),
    selectFromRadioGroup: jest.fn(),
    selectFromSelector: jest.fn(),
    uploadFile: jest.fn(),
    waitForUpdate: jest.fn(),
  };

  it('returns an `ok` function that resolves the user interface with `null` for alert dialogs', async () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DIALOG_APPROVAL_TYPES[DialogType.Alert],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );
    assertIsAlertDialog(response);

    expect(response).toStrictEqual({
      type: DialogType.Alert,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
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
      DIALOG_APPROVAL_TYPES[DialogType.Confirmation],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );

    assertIsConfirmationDialog(response);
    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
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
      DIALOG_APPROVAL_TYPES[DialogType.Confirmation],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );

    assertIsConfirmationDialog(response);
    expect(response).toStrictEqual({
      type: DialogType.Confirmation,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
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
      DIALOG_APPROVAL_TYPES[DialogType.Prompt],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );

    assertIsPromptDialog(response);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
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
      DIALOG_APPROVAL_TYPES[DialogType.Prompt],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );

    assertIsPromptDialog(response);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
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
      DIALOG_APPROVAL_TYPES[DialogType.Prompt],
      'foo',
      <Text>foo</Text>,
      interfaceActions,
    );

    assertIsPromptDialog(response);
    expect(response).toStrictEqual({
      type: DialogType.Prompt,
      id: 'foo',
      content: <Text>foo</Text>,
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
      ok: expect.any(Function),
      cancel: expect.any(Function),
    });

    const promise = getResolve(runSaga);
    await response.cancel();
    expect(await promise).toBeNull();
  });

  it('returns no `ok` or `cancel` functions for custom dialogs with a complete footer', () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DIALOG_APPROVAL_TYPES.default,
      'foo',
      <Container>
        <Box>
          <Text>foo</Text>
        </Box>
        <Footer>
          <Button name="cancel">Cancel</Button>
          <Button name="confirm">Confirm</Button>
        </Footer>
      </Container>,
      interfaceActions,
    );

    assertIsCustomDialog(response);
    assertCustomDialogHasFooter(response);

    expect(response).toStrictEqual({
      id: 'foo',
      content: (
        <Container>
          <Box>
            <Text>foo</Text>
          </Box>
          <Footer>
            <Button name="cancel">Cancel</Button>
            <Button name="confirm">Confirm</Button>
          </Footer>
        </Container>
      ),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      waitForUpdate: expect.any(Function),
      uploadFile: expect.any(Function),
    });
  });

  it('returns a `cancel` functions for custom dialogs with a partial footer', () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DIALOG_APPROVAL_TYPES.default,
      'foo',
      <Container>
        <Box>
          <Text>foo</Text>
        </Box>
        <Footer>
          <Button name="confirm">Confirm</Button>
        </Footer>
      </Container>,
      interfaceActions,
    );

    assertIsCustomDialog(response);
    assertCustomDialogHasPartialFooter(response);

    expect(response).toStrictEqual({
      id: 'foo',
      content: (
        <Container>
          <Box>
            <Text>foo</Text>
          </Box>
          <Footer>
            <Button name="confirm">Confirm</Button>
          </Footer>
        </Container>
      ),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
      cancel: expect.any(Function),
    });
  });

  it('returns a `ok` and `cancel` functions for custom dialogs without a footer', () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      DIALOG_APPROVAL_TYPES.default,
      'foo',
      <Container>
        <Box>
          <Text>foo</Text>
        </Box>
      </Container>,
      interfaceActions,
    );

    assertIsCustomDialog(response);
    assertCustomDialogHasNoFooter(response);

    expect(response).toStrictEqual({
      id: 'foo',
      content: (
        <Container>
          <Box>
            <Text>foo</Text>
          </Box>
        </Container>
      ),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
      cancel: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('returns the interface actions and content for a notification', () => {
    const { runSaga } = createStore(getMockOptions());
    const response = getInterfaceResponse(
      runSaga,
      'Notification',
      'foo',
      <Box>
        <Text>Foo</Text>
      </Box>,
      interfaceActions,
    );

    expect(response).toStrictEqual({
      id: 'foo',
      content: (
        <Box>
          <Text>Foo</Text>
        </Box>
      ),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
    });
  });

  it('throws an error for unknown dialog types', () => {
    const { runSaga } = createStore(getMockOptions());

    expect(() => {
      // @ts-expect-error - Invalid dialog type.
      getInterfaceResponse(runSaga, 'Foo', <Text>foo</Text>);
    }).toThrow('Unknown or unsupported dialog type: "Foo".');
  });
});

describe('resolveWithSaga', () => {
  it('resolves the user interface', async () => {
    const { runSaga, store } = createStore(
      getMockOptions({
        state: {
          ui: {
            current: {
              type: DIALOG_APPROVAL_TYPES.default,
              id: 'foo',
            },
          },
        },
      }),
    );

    await runSaga(resolveWithSaga, 'hello').toPromise();

    expect(store.getState().ui.current).toBeNull();
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

  it('gets a button with a form property', () => {
    const content = (
      <Box>
        <Form name="referenced-form">
          <Field>
            <Input name="input" />
          </Field>
        </Form>
        <Button name="button" type="submit" form="referenced-form">
          foo
        </Button>
      </Box>
    );
    const result = getElement(content, 'button');

    expect(result).toStrictEqual({
      element: (
        <Button name="button" type="submit" form="referenced-form">
          foo
        </Button>
      ),
      form: 'referenced-form',
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
    const interfaceId = interfaceController.createInterface(
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
      origin: 'metamask',
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

    const interfaceId = interfaceController.createInterface(
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
      origin: 'metamask',
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
      origin: 'metamask',
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

  it('sends a `FormSubmitEvent` to the Snap for a button with a form property', async () => {
    const content = (
      <Box>
        <Form name="referenced-form">
          <Field>
            <Input name="input" />
          </Field>
        </Form>
        <Button name="button" type="submit" form="referenced-form">
          foo
        </Button>
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'button',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.ButtonClickEvent,
            name: 'button',
          },
          id: interfaceId,
          context: null,
        },
      },
    });

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.FormSubmitEvent,
            name: 'referenced-form',
            value: {
              input: null,
            },
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('supports checkboxes', async () => {
    const content = (
      <Form name="form">
        <Checkbox name="checkbox" />
        <Button name="button" type="submit">
          Submit
        </Button>
      </Form>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'checkbox',
    );

    await clickElement(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'button',
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.InputChangeEvent,
            name: 'checkbox',
            value: true,
          },
          id: interfaceId,
          context: null,
        },
      },
    });

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.FormSubmitEvent,
            name: 'form',
            value: {
              checkbox: true,
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

    const interfaceId = interfaceController.createInterface(
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

    const interfaceId = interfaceController.createInterface(
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
      'Expected an element of type "Button" or "Checkbox", but found "Input".',
    );

    expect(handleRpcRequestMock).not.toHaveBeenCalled();
  });

  it('unwraps errors', async () => {
    const content = button({ value: 'foo', name: 'foo' });

    const interfaceId = interfaceController.createInterface(
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

    const interfaceId = interfaceController.createInterface(
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
      origin: 'metamask',
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

  it('updates the interface state and sends an InputChangeEvent for an AddressInput', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const content = (
      <AddressInput
        name="addressInput"
        chainId="eip155:0"
        placeholder="Enter an address"
      />
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await typeInField(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'addressInput',
      '0x1234567890123456789012345678901234567890',
    );

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:updateInterfaceState',
      interfaceId,
      { addressInput: 'eip155:0:0x1234567890123456789012345678901234567890' },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.InputChangeEvent,
            name: 'addressInput',
            value: 'eip155:0:0x1234567890123456789012345678901234567890',
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('throws if there is no inputs in the interface', async () => {
    const content = text('bar');

    const interfaceId = interfaceController.createInterface(
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

    const interfaceId = interfaceController.createInterface(
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
      'Expected an element of type "Input" or "AddressInput", but found "Button".',
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

    const interfaceId = interfaceController.createInterface(
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
      origin: 'metamask',
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

    const interfaceId = interfaceController.createInterface(
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

    const interfaceId = interfaceController.createInterface(
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

    const interfaceId = interfaceController.createInterface(
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

describe('uploadFile', () => {
  it('uploads a file and sends an `FileUploadEvent` to the Snap', async () => {
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

    const content = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await uploadFile(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'foo',
      new Uint8Array([1, 2, 3]),
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.FileUploadEvent,
            name: 'foo',
            file: {
              name: '',
              size: 3,
              contentType: 'application/octet-stream',
              contents: 'AQID',
            },
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('uploads a file with a custom file name and MIME type', async () => {
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

    const content = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await uploadFile(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'foo',
      new Uint8Array([1, 2, 3]),
      {
        fileName: 'bar',
        contentType: 'text/plain',
      },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.FileUploadEvent,
            name: 'foo',
            file: {
              name: 'bar',
              size: 3,
              contentType: 'text/plain',
              contents: 'AQID',
            },
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('throws an error if the file size exceeds the maximum allowed size', async () => {
    const rootControllerMessenger = getRootControllerMessenger();
    const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
      rootControllerMessenger,
    );

    const interfaceController = new SnapInterfaceController({
      messenger: controllerMessenger,
    });

    const content = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      uploadFile(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        new Uint8Array(11_000_000),
      ),
    ).rejects.toThrow(
      'The file size (11.00 MB) exceeds the maximum allowed size of 10.00 MB.',
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
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = text('foo');
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();
    expect(result).toStrictEqual({
      id,
      type,
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('waits for a user interface to be set if none is currently set', async () => {
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const promise = runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    const content = text('foo');
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };
    store.dispatch(setInterface(ui));

    const result = await promise;
    expect(result).toStrictEqual({
      id,
      type,
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      pickDateTime: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
      ok: expect.any(Function),
    });
  });

  it('sends a request to the snap when `clickElement` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = button({ value: 'foo', name: 'foo' });
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    await result.clickElement('foo');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
      {
        origin: 'metamask',
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
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = input('foo');
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    await result.typeInField('foo', 'bar');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
      {
        origin: 'metamask',
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
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = (
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    );
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    await result.selectInDropdown('foo', 'option2');

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
      {
        origin: 'metamask',
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

  it('sends a request to the Snap when `pickDateTime` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = <DateTimePicker name="foo" />;

    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    const date = new Date();

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    await result.pickDateTime('foo', date);

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
      {
        origin: 'metamask',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: UserInputEventType.InputChangeEvent,
              name: 'foo',
              value: date.toISOString(),
            },
            id,
            context: null,
          },
        },
      },
    );
  });

  it('sends a request to the snap when `uploadFile` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = (
      <Box>
        <FileInput name="foo" />
      </Box>
    );
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    await result.uploadFile('foo', new Uint8Array([1, 2, 3]));

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'ExecutionService:handleRpcRequest',
      MOCK_SNAP_ID,
      {
        origin: 'metamask',
        handler: HandlerType.OnUserInput,
        request: {
          jsonrpc: '2.0',
          method: ' ',
          params: {
            event: {
              type: UserInputEventType.FileUploadEvent,
              name: 'foo',
              file: {
                name: '',
                size: 3,
                contentType: 'application/octet-stream',
                contents: 'AQID',
              },
            },
            id,
            context: null,
          },
        },
      },
    );
  });

  it('waits for the interface content to update when `waitForUpdate` is called', async () => {
    jest.spyOn(rootControllerMessenger, 'call');
    const options = getMockOptions();
    const { store, runSaga } = createStore(options);

    const content = (
      <Box>
        <Input name="foo" />
      </Box>
    );
    const id = interfaceController.createInterface(MOCK_SNAP_ID, content);
    const type = DialogType.Alert;
    const ui = { type: DIALOG_APPROVAL_TYPES[type], id };

    store.dispatch(setInterface(ui));

    const result = await runSaga(
      getInterface,
      runSaga,
      MOCK_SNAP_ID,
      rootControllerMessenger,
      options,
    ).toPromise();

    const promise = result.waitForUpdate();

    interfaceController.updateInterface(
      MOCK_SNAP_ID,
      id,
      <Text>Hello world!</Text>,
    );

    const newInterface = await promise;

    expect(newInterface.content.type).toBe('Text');
  });
});

describe('selectFromRadioGroup', () => {
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
      <RadioGroup name="foo">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await selectFromRadioGroup(
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
      origin: 'metamask',
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

  it('throws if chosen option does not exist', async () => {
    const content = (
      <RadioGroup name="foo">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromRadioGroup(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'option3',
      ),
    ).rejects.toThrow(
      'The RadioGroup with the name "foo" does not contain "option3"',
    );
  });

  it('throws if there is no RadioGroup in the interface', async () => {
    const content = (
      <Box>
        <Text>Foo</Text>
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromRadioGroup(
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

  it('throws if the element is not a RadioGroup', async () => {
    const content = <Input name="foo" />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromRadioGroup(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'baz',
      ),
    ).rejects.toThrow(
      'Expected an element of type "RadioGroup", but found "Input".',
    );
  });
});

describe('getValueFromSelector', () => {
  it('returns the selected value of a Selector', () => {
    const options = getMockOptions();

    const element = (
      <Selector name="foo" title="Choose an option">
        <SelectorOption value="option1">
          <Card title="Option 1" value="option1" />
        </SelectorOption>
        <SelectorOption value="option2">
          <Card title="Option 2" value="option2" />
        </SelectorOption>
      </Selector>
    );

    expect(getValueFromSelector(element, options, 'option2')).toBe('option2');
  });

  it('throws if the Selector does not contain the value', () => {
    const options = getMockOptions();

    const element = (
      <Selector name="foo" title="Choose an option">
        <SelectorOption value="option1">
          <Card title="Option 1" value="option1" />
        </SelectorOption>
        <SelectorOption value="option2">
          <Card title="Option 2" value="option2" />
        </SelectorOption>
      </Selector>
    );

    expect(() => getValueFromSelector(element, options, 'option3')).toThrow(
      'The Selector with the name "foo" does not contain "option3"',
    );
  });

  it('returns the selected value of an AccountSelector', () => {
    const options = getMockOptions();

    const element = <AccountSelector name="accounts" />;

    expect(
      getValueFromSelector(
        element,
        options,
        'e051723c-85d0-43a3-b9bf-568a90d3f378',
      ),
    ).toStrictEqual({
      accountId: options.accounts[1].id,
      addresses: [
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
      ],
    });
  });

  it('throws if the AccountSelector does not contain the value', () => {
    const options = getMockOptions();

    const element = <AccountSelector name="accounts" />;

    expect(() =>
      getValueFromSelector(
        element,
        options,
        'de3fa629-b619-46f7-885e-36788af5c3be',
      ),
    ).toThrow(
      'The AccountSelector with the name "accounts" does not contain an account with ID "de3fa629-b619-46f7-885e-36788af5c3be"',
    );
  });

  it('returns the selected value of an AssetSelector', () => {
    const options = getMockOptions();

    const element = (
      <AssetSelector
        name="assets"
        addresses={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ]}
      />
    );

    expect(
      getValueFromSelector(
        element,
        options,
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      ),
    ).toStrictEqual({
      asset:
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      name: 'USDC',
      symbol: 'USDC',
    });
  });

  it('throws if the AssetSelector does not contain the value', () => {
    const options = getMockOptions();

    const element = (
      <AssetSelector
        name="assets"
        addresses={[
          'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:7S3P4HxJpyyigGzodYwHtCxZyUQe9JiBMHyRWXArAaKv',
        ]}
      />
    );

    expect(() =>
      getValueFromSelector(
        element,
        options,
        'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:InvalidToken',
      ),
    ).toThrow(
      'The AssetSelector with the name "assets" does not contain an asset with ID "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp/token:InvalidToken"',
    );
  });

  it('throws if the element is not a Selector, AccountSelector or AssetSelector', () => {
    const options = getMockOptions();

    const element = <Input name="foo" />;

    expect(() => getValueFromSelector(element, options, 'option1')).toThrow(
      'Expected an element of type "Selector", "AccountSelector" or "AssetSelector", but found "Input".',
    );
  });
});

describe('selectFromSelector', () => {
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

    const options = getMockOptions();

    const content = (
      <Selector name="foo" title="Choose an option" value="option1">
        <SelectorOption value="option1">
          <Card title="Option 1" value="option1" />
        </SelectorOption>
        <SelectorOption value="option2">
          <Card title="Option 2" value="option2" />
        </SelectorOption>
      </Selector>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await selectFromSelector(
      rootControllerMessenger,
      options,
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
      origin: 'metamask',
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

  it('throws if chosen option does not exist', async () => {
    const options = getMockOptions();

    const content = (
      <Selector name="foo" title="Choose an option" value="option1">
        <SelectorOption value="option1">
          <Card title="Option 1" value="option1" />
        </SelectorOption>
        <SelectorOption value="option2">
          <Card title="Option 2" value="option2" />
        </SelectorOption>
      </Selector>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromSelector(
        rootControllerMessenger,
        options,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'option3',
      ),
    ).rejects.toThrow(
      'The Selector with the name "foo" does not contain "option3"',
    );
  });

  it('throws if there is no Selector in the interface', async () => {
    const options = getMockOptions();

    const content = (
      <Box>
        <Text>Foo</Text>
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromSelector(
        rootControllerMessenger,
        options,
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

  it('throws if the element is not a Selector', async () => {
    const options = getMockOptions();

    const content = <Input name="foo" />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      selectFromSelector(
        rootControllerMessenger,
        options,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        'baz',
      ),
    ).rejects.toThrow(
      'Expected an element of type "Selector", "AccountSelector" or "AssetSelector", but found "Input".',
    );
  });
});

describe('pickDateTime', () => {
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

    const content = <DateTimePicker name="foo" />;

    const valueToPick = new Date('2024-01-01T12:00:00Z');

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await pickDateTime(
      rootControllerMessenger,
      interfaceId,
      content,
      MOCK_SNAP_ID,
      'foo',
      valueToPick,
    );

    expect(rootControllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:updateInterfaceState',
      interfaceId,
      { foo: valueToPick.toISOString() },
    );

    expect(handleRpcRequestMock).toHaveBeenCalledWith(MOCK_SNAP_ID, {
      origin: 'metamask',
      handler: HandlerType.OnUserInput,
      request: {
        jsonrpc: '2.0',
        method: ' ',
        params: {
          event: {
            type: UserInputEventType.InputChangeEvent,
            name: 'foo',
            value: valueToPick.toISOString(),
          },
          id: interfaceId,
          context: null,
        },
      },
    });
  });

  it('throws if there is no DateTimePicker in the interface', async () => {
    const content = (
      <Box>
        <Text>Foo</Text>
      </Box>
    );

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      pickDateTime(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'bar',
        new Date(),
      ),
    ).rejects.toThrow(
      'Could not find an element in the interface with the name "bar".',
    );
  });

  it('throws if the element is not a DateTimePicker', async () => {
    const content = <Input name="foo" />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      pickDateTime(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        new Date(),
      ),
    ).rejects.toThrow(
      'Expected an element of type "DateTimePicker", but found "Input".',
    );
  });

  it('throws if the provided date is the future and the component does not allow it', async () => {
    const content = <DateTimePicker name="foo" disableFuture={true} />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await expect(
      pickDateTime(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        futureDate,
      ),
    ).rejects.toThrow(
      `The selected date "${futureDate.toISOString()}" is in the future, but the DateTimePicker with the name "foo" has future dates disabled.`,
    );
  });

  it('throws if the provided date is the past and the component does not allow it', async () => {
    const content = <DateTimePicker name="foo" disablePast={true} />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    const pastDate = new Date();
    pastDate.setMonth(pastDate.getMonth() - 1);

    await expect(
      pickDateTime(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        pastDate,
      ),
    ).rejects.toThrow(
      `The selected date "${pastDate.toISOString()}" is in the past, but the DateTimePicker with the name "foo" has past dates disabled.`,
    );
  });

  it('throws if the provided date is invalid', async () => {
    const content = <DateTimePicker name="foo" />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    await expect(
      pickDateTime(
        rootControllerMessenger,
        interfaceId,
        content,
        MOCK_SNAP_ID,
        'foo',
        new Date('invalid-date'),
      ),
    ).rejects.toThrow(`Expected "value" to be a valid Date object.`);
  });
});

describe('waitForUpdate', () => {
  const options = getMockOptions();

  const rootControllerMessenger = getRootControllerMessenger();
  const controllerMessenger = getRestrictedSnapInterfaceControllerMessenger(
    rootControllerMessenger,
  );

  const interfaceController = new SnapInterfaceController({
    messenger: controllerMessenger,
  });

  it('waits for the interface content to update', async () => {
    const content = <Input name="foo" />;

    const interfaceId = interfaceController.createInterface(
      MOCK_SNAP_ID,
      content,
    );

    const promise = waitForUpdate(
      rootControllerMessenger,
      options,
      MOCK_SNAP_ID,
      interfaceId,
      content,
    );

    interfaceController.updateInterface(
      MOCK_SNAP_ID,
      interfaceId,
      <Text>Hello world!</Text>,
    );

    const newInterface = await promise;

    expect(newInterface.content.type).toBe('Text');
  });
});
