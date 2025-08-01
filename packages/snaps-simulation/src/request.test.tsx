import { SnapInterfaceController } from '@metamask/snaps-controllers';
import type { SnapId } from '@metamask/snaps-sdk';
import { UserInputEventType, button, input, text } from '@metamask/snaps-sdk';
import {
  Card,
  Dropdown,
  Option,
  Radio,
  RadioGroup,
  Selector,
  SelectorOption,
} from '@metamask/snaps-sdk/jsx';
import { getJsxElementFromComponent, HandlerType } from '@metamask/snaps-utils';
import {
  getSnapManifest,
  MOCK_SNAP_ID,
} from '@metamask/snaps-utils/test-utils';

import {
  getInterfaceApi,
  getInterfaceFromResult,
  handleRequest,
} from './request';
import { installSnap } from './simulation';
import {
  getMockOptions,
  getMockServer,
  getRestrictedSnapInterfaceControllerMessenger,
  getRootControllerMessenger,
} from './test-utils';
import type { SnapResponseWithInterface } from './types';

describe('handleRequest', () => {
  it('sends a JSON-RPC request and returns the response', async () => {
    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          return 'Hello, world!';
        };
      `,
    });

    const options = getMockOptions();

    const snap = await installSnap(snapId, { options });
    const response = await handleRequest({
      ...snap,
      simulationOptions: options,
      handler: HandlerType.OnRpcRequest,
      request: {
        method: 'foo',
        params: ['bar'],
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        result: 'Hello, world!',
      },
      notifications: [],
      tracked: {
        errors: [],
        events: [],
        traces: [],
      },
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('gets an interface from the Snap', async () => {
    const { snapId, close: closeServer } = await getMockServer({
      manifest: getSnapManifest({
        initialPermissions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          snap_dialog: {},
        },
      }),
      sourceCode: `
        module.exports.onRpcRequest = async () => {
          return await snap.request({
            method: 'snap_dialog',
            params: {
              content: {
                type: 'Text',
                props: {
                  children: 'Hello, world!',
                },
                key: null,
              },
            },
          });
        }
      `,
    });

    const options = getMockOptions();

    const snap = await installSnap(snapId, { options });
    const response = handleRequest({
      ...snap,
      simulationOptions: options,
      handler: HandlerType.OnRpcRequest,
      request: {
        method: 'foo',
        params: ['bar'],
      },
    });

    const ui = await response.getInterface();

    expect(ui).toStrictEqual({
      cancel: expect.any(Function),
      clickElement: expect.any(Function),
      content: {
        type: 'Text',
        props: {
          children: 'Hello, world!',
        },
        key: null,
      },
      id: expect.any(String),
      ok: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      selectInDropdown: expect.any(Function),
      typeInField: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('can get an interface from the SnapInterfaceController if the result contains an id', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = text('foo');
    const id = await interfaceController.createInterface(
      'local:http://localhost:4242' as SnapId,
      content,
    );

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onHomePage = async (request) => {
          return ({ id: '${id}' });
        };
      `,
      port: 4242,
    });
    const options = getMockOptions();
    const snap = await installSnap(snapId, { options });
    const response = await handleRequest({
      ...snap,
      controllerMessenger,
      simulationOptions: options,
      handler: HandlerType.OnHomePage,
      request: {
        method: '',
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        result: {
          id,
        },
      },
      notifications: [],
      tracked: {
        errors: [],
        events: [],
        traces: [],
      },
      getInterface: expect.any(Function),
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('gracefully handles returned invalid UI', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onHomePage = async (request) => {
          return ({ content: 'foo' });
        };
      `,
      port: 4242,
    });

    const options = getMockOptions();
    const snap = await installSnap(snapId, { options });
    const response = await handleRequest({
      ...snap,
      controllerMessenger,
      simulationOptions: options,
      handler: HandlerType.OnHomePage,
      request: {
        method: '',
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        error: expect.objectContaining({
          code: -32603,
          message: 'The Snap returned an invalid interface.',
        }),
      },
      notifications: [],
      tracked: {
        errors: [],
        events: [],
        traces: [],
      },
      getInterface: expect.any(Function),
    });

    expect(() =>
      (response as SnapResponseWithInterface).getInterface(),
    ).toThrow(
      'Unable to get the interface from the Snap: The request to the Snap failed.',
    );

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('gracefully handles returned invalid UI when not awaiting the request', async () => {
    const controllerMessenger = getRootControllerMessenger();

    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onHomePage = async (request) => {
          return ({ content: 'foo' });
        };
      `,
      port: 4242,
    });

    const options = getMockOptions();
    const snap = await installSnap(snapId);
    const promise = handleRequest({
      ...snap,
      controllerMessenger,
      simulationOptions: options,
      handler: HandlerType.OnHomePage,
      request: {
        method: '',
      },
    });

    await expect(promise.getInterface()).rejects.toThrow(
      'Unable to get the interface from the Snap: The returned interface may be invalid. The error message received was: The Snap returned an invalid interface.',
    );

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });

  it('returns an error response', async () => {
    const { snapId, close: closeServer } = await getMockServer({
      sourceCode: `
        module.exports.onRpcRequest = async (request) => {
          throw new Error('Something went wrong.');
        };
      `,
    });

    const options = getMockOptions();
    const snap = await installSnap(snapId, { options });
    const response = await handleRequest({
      ...snap,
      handler: HandlerType.OnRpcRequest,
      simulationOptions: options,
      request: {
        method: 'foo',
        params: ['bar'],
      },
    });

    expect(response).toStrictEqual({
      id: expect.any(String),
      response: {
        error: expect.objectContaining({
          code: -32603,
          message: 'Something went wrong.',
        }),
      },
      notifications: [],
      tracked: {
        errors: [],
        events: [],
        traces: [],
      },
      getInterface: expect.any(Function),
    });

    await closeServer();
    await snap.executionService.terminateAllSnaps();
  });
});

describe('getInterfaceFromResult', () => {
  const controllerMessenger = getRootControllerMessenger();
  // eslint-disable-next-line no-new
  new SnapInterfaceController({
    messenger:
      getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
  });

  it('returns the interface ID if the result includes it', async () => {
    const result = await getInterfaceFromResult(
      { id: 'foo' },
      MOCK_SNAP_ID,
      controllerMessenger,
    );

    expect(result).toBe('foo');
  });

  it('creates a new interface and returns its ID if the result contains content', async () => {
    jest.spyOn(controllerMessenger, 'call');

    const result = await getInterfaceFromResult(
      { content: text('foo') },
      MOCK_SNAP_ID,
      controllerMessenger,
    );

    expect(result).toStrictEqual(expect.any(String));

    expect(controllerMessenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      MOCK_SNAP_ID,
      text('foo'),
    );
  });
});

describe('getInterfaceApi', () => {
  it('gets the content from the SnapInterfaceController if the result contains an interface ID', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();
    const interfaceController = new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });
    const content = text('foo');

    const id = await interfaceController.createInterface(MOCK_SNAP_ID, content);

    const getInterface = await getInterfaceApi(
      { id },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    expect(getInterface).toStrictEqual(expect.any(Function));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getInterface!();

    expect(result).toStrictEqual({
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
    });
  });

  it('gets the content from the SnapInterfaceController if the result contains content', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = text('foo');

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    expect(getInterface).toStrictEqual(expect.any(Function));

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const result = getInterface!();

    expect(result).toStrictEqual({
      content: getJsxElementFromComponent(content),
      clickElement: expect.any(Function),
      typeInField: expect.any(Function),
      selectInDropdown: expect.any(Function),
      selectFromRadioGroup: expect.any(Function),
      selectFromSelector: expect.any(Function),
      uploadFile: expect.any(Function),
      waitForUpdate: expect.any(Function),
    });
  });

  it('returns undefined if there is no interface ID associated with the result', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    const result = await getInterfaceApi(
      {},
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    expect(result).toBeUndefined();
  });

  it('sends the request to the snap when using `clickElement`', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    jest.spyOn(controllerMessenger, 'call');

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = button({ value: 'foo', name: 'foo' });

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snapInterface = getInterface!();

    await snapInterface.clickElement('foo');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      4,
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
            id: expect.any(String),
            context: null,
          },
        },
      },
    );
  });

  it('sends the request to the snap when using `typeInField`', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    jest.spyOn(controllerMessenger, 'call');

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = input('foo');

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snapInterface = getInterface!();

    await snapInterface.typeInField('foo', 'bar');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      5,
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
            id: expect.any(String),
            context: null,
          },
        },
      },
    );
  });

  it('sends the request to the snap when using `selectInDropdown`', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    jest.spyOn(controllerMessenger, 'call');

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = (
      <Dropdown name="foo">
        <Option value="option1">Option 1</Option>
        <Option value="option2">Option 2</Option>
      </Dropdown>
    );

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snapInterface = getInterface!();

    await snapInterface.selectInDropdown('foo', 'option2');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      5,
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
            id: expect.any(String),
            context: null,
          },
        },
      },
    );
  });

  it('sends the request to the snap when using `selectFromRadioGroup`', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    jest.spyOn(controllerMessenger, 'call');

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

    const content = (
      <RadioGroup name="foo">
        <Radio value="option1">Option 1</Radio>
        <Radio value="option2">Option 2</Radio>
      </RadioGroup>
    );

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snapInterface = getInterface!();

    await snapInterface.selectFromRadioGroup('foo', 'option2');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      5,
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
            id: expect.any(String),
            context: null,
          },
        },
      },
    );
  });

  it('sends the request to the snap when using `selectInSelector`', async () => {
    const options = getMockOptions();
    const controllerMessenger = getRootControllerMessenger();

    jest.spyOn(controllerMessenger, 'call');

    // eslint-disable-next-line no-new
    new SnapInterfaceController({
      messenger:
        getRestrictedSnapInterfaceControllerMessenger(controllerMessenger),
    });

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

    const getInterface = await getInterfaceApi(
      { content },
      MOCK_SNAP_ID,
      controllerMessenger,
      options,
    );

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const snapInterface = getInterface!();

    await snapInterface.selectFromSelector('foo', 'option2');

    expect(controllerMessenger.call).toHaveBeenNthCalledWith(
      5,
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
            id: expect.any(String),
            context: null,
          },
        },
      },
    );
  });
});
