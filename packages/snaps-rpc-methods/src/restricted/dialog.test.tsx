import type { MockAnyNamespace } from '@metamask/messenger';
import { MOCK_ANY_NAMESPACE, Messenger } from '@metamask/messenger';
import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import type { SnapId } from '@metamask/snaps-sdk';
import { DialogType, NodeType } from '@metamask/snaps-sdk';
import { Box, Text } from '@metamask/snaps-sdk/jsx';

import type { DialogMessengerActions } from './dialog';
import {
  DIALOG_APPROVAL_TYPES,
  dialogBuilder,
  getDialogImplementation,
} from './dialog';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(dialogBuilder).toMatchObject({
      targetName: 'snap_dialog',
      specificationBuilder: expect.any(Function),
      actionNames: [
        'ApprovalController:addRequest',
        'SnapInterfaceController:createInterface',
        'SnapInterfaceController:getInterface',
        'SnapInterfaceController:setInterfaceDisplayed',
      ],
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      dialogBuilder.specificationBuilder({
        messenger: new Messenger({ namespace: 'Dialog' }),
      }),
    ).toStrictEqual({
      permissionType: PermissionType.RestrictedMethod,
      targetName: 'snap_dialog',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
      subjectTypes: [SubjectType.Snap],
    });
  });
});

describe('implementation', () => {
  const getMessenger = () => {
    const messenger = new Messenger<MockAnyNamespace, DialogMessengerActions>({
      namespace: MOCK_ANY_NAMESPACE,
    });

    messenger.registerActionHandler(
      'ApprovalController:addRequest',
      async () => null,
    );

    messenger.registerActionHandler(
      'SnapInterfaceController:createInterface',
      () => 'bar',
    );

    messenger.registerActionHandler(
      'SnapInterfaceController:getInterface',
      () => ({
        content: { type: NodeType.Text as const, value: 'foo' },
        state: {},
        snapId: 'foo' as SnapId,
        context: null,
      }),
    );

    messenger.registerActionHandler(
      'SnapInterfaceController:setInterfaceDisplayed',
      () => null,
    );

    jest.spyOn(messenger, 'call');

    return messenger;
  };

  it('accepts string dialog types', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });
    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: {
          type: NodeType.Panel as const,
          children: [
            { type: NodeType.Heading as const, value: 'foo' },
            { type: NodeType.Text as const, value: 'bar' },
          ],
        },
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: undefined,
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('accepts no dialog type with an interface ID', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });
    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        id: 'bar',
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: 'bar',
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES.default,
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('accepts no dialog type with content', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    const content = (
      <Box>
        <Text>Hello, world!</Text>
      </Box>
    );

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        content,
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      'foo',
      content,
    );
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: 'bar',
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES.default,
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('gets the interface data if an interface ID is passed', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        id: 'bar',
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: undefined,
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('creates a new interface if some content is passed', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    const content = {
      type: NodeType.Panel as const,
      children: [
        { type: NodeType.Heading as const, value: 'foo' },
        { type: NodeType.Text as const, value: 'bar' },
      ],
    };

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content,
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      'foo',
      content,
    );
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: undefined,
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('creates a new interface if a JSX element is passed', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    const content = (
      <Box>
        <Text>Hello, world!</Text>
      </Box>
    );

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content,
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:createInterface',
      'foo',
      content,
    );
    expect(messenger.call).toHaveBeenCalledWith(
      'ApprovalController:addRequest',
      {
        id: undefined,
        origin: 'foo',
        type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
        requestData: {
          id: 'bar',
          placeholder: undefined,
        },
      },
      true,
    );
  });

  it('sets an interface as displayed', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        id: 'bar',
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:setInterfaceDisplayed',
      'foo',
      'bar',
    );
  });

  it('sets an interface as displayed if content is passed without an ID', async () => {
    const messenger = getMessenger();
    const implementation = getDialogImplementation({ messenger });

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: <Text>Foo</Text>,
      },
    });

    expect(messenger.call).toHaveBeenCalledTimes(3);
    expect(messenger.call).toHaveBeenCalledWith(
      'SnapInterfaceController:setInterfaceDisplayed',
      'foo',
      'bar',
    );
  });

  it('throws if the requested interface does not exist.', async () => {
    const messenger = new Messenger({ namespace: MOCK_ANY_NAMESPACE });

    messenger.registerActionHandler(
      'SnapInterfaceController:getInterface',
      (_origin: string, id: string) => {
        throw new Error(`Interface with id '${id}' not found.`);
      },
    );

    const spy = jest.spyOn(messenger, 'call');

    const implementation = getDialogImplementation({ messenger });

    await expect(
      implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: 'alert',
          id: 'bar',
        },
      }),
    ).rejects.toThrow(
      rpcErrors.invalidParams(
        `Invalid params: Interface with id 'bar' not found.`,
      ),
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(
      'SnapInterfaceController:getInterface',
      'foo',
      'bar',
    );
  });

  describe('alerts', () => {
    it('handles alerts', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: {
            type: NodeType.Panel as const,
            children: [
              { type: NodeType.Heading as const, value: 'foo' },
              { type: NodeType.Text as const, value: 'bar' },
            ],
          },
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
          requestData: {
            id: 'bar',
            placeholder: undefined,
          },
        },
        true,
      );
    });

    it('handles JSX alerts', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ),
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
          requestData: {
            id: 'bar',
            placeholder: undefined,
          },
        },
        true,
      );
    });
  });

  describe('confirmations', () => {
    it('handles confirmations', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: {
            type: NodeType.Panel as const,
            children: [
              { type: NodeType.Heading as const, value: 'foo' },
              { type: NodeType.Text as const, value: 'bar' },
            ],
          },
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Confirmation],
          requestData: {
            id: 'bar',
            placeholder: undefined,
          },
        },
        true,
      );
    });

    it('handles JSX confirmations', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ),
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Confirmation],
          requestData: {
            id: 'bar',
            placeholder: undefined,
          },
        },
        true,
      );
    });

    it('handles confirmations using an ID', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          id: 'baz',
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Confirmation],
          requestData: {
            id: 'baz',
            placeholder: undefined,
          },
        },
        true,
      );
    });
  });

  describe('prompts', () => {
    it('handles prompts', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Prompt,
          content: {
            type: NodeType.Panel as const,
            children: [
              { type: NodeType.Heading as const, value: 'foo' },
              { type: NodeType.Text as const, value: 'bar' },
            ],
          },
          placeholder: 'foobar',
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Prompt],
          requestData: {
            id: 'bar',
            placeholder: 'foobar',
          },
        },
        true,
      );
    });

    it('handles JSX prompts', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Prompt,
          content: (
            <Box>
              <Text>Hello, world!</Text>
            </Box>
          ),
          placeholder: 'foobar',
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Prompt],
          requestData: {
            id: 'bar',
            placeholder: 'foobar',
          },
        },
        true,
      );
    });

    it('handles prompts using an ID', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Prompt,
          id: 'baz',
          placeholder: 'foobar',
        },
      });

      expect(messenger.call).toHaveBeenCalledTimes(3);
      expect(messenger.call).toHaveBeenCalledWith(
        'ApprovalController:addRequest',
        {
          id: undefined,
          origin: 'foo',
          type: DIALOG_APPROVAL_TYPES[DialogType.Prompt],
          requestData: {
            id: 'baz',
            placeholder: 'foobar',
          },
        },
        true,
      );
    });
  });

  describe('validation', () => {
    it.each([undefined, null, false, 2])(
      'rejects invalid parameter object',
      async (value) => {
        const messenger = getMessenger();
        const implementation = getDialogImplementation({ messenger });

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: value as any,
          }),
        ).rejects.toThrow(
          'Invalid params: Expected params to be a single object.',
        );
      },
    );

    it('rejects empty parameter object', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {} as any,
        }),
      ).rejects.toThrow(
        /Invalid params: At path: .* -- Expected type to be one of: .*, but received: .*/u,
      );
    });

    it.each([{ type: false }, { type: '' }, { type: 'foo' }])(
      'rejects invalid types',
      async (value) => {
        const messenger = getMessenger();
        const implementation = getDialogImplementation({ messenger });

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: value as any,
          }),
        ).rejects.toThrow(
          'The "type" property must be one of: alert, confirmation, prompt.',
        );
      },
    );

    it.each([
      { type: DialogType.Alert },
      { type: DialogType.Alert, content: null },
      { type: DialogType.Alert, content: false },
      { type: DialogType.Alert, content: '' },
      { type: DialogType.Alert, content: 'abc' },
      { type: DialogType.Alert, content: 2 },
      { type: DialogType.Alert, content: [] },
    ])('rejects invalid fields', async (value) => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: value as any,
        }),
      ).rejects.toThrow(
        /Invalid params: At path: .* -- Expected type to be one of: .*, but received: .*/u,
      );
    });

    it.each([true, 2, [], {}, new (class {})()])(
      'rejects invalid placeholder contents',
      async (value: any) => {
        const messenger = getMessenger();
        const implementation = getDialogImplementation({ messenger });

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Prompt,
              content: {
                type: NodeType.Panel as const,
                children: [
                  { type: NodeType.Heading as const, value: 'foo' },
                  { type: NodeType.Text as const, value: 'bar' },
                ],
              },
              placeholder: value,
            },
          }),
        ).rejects.toThrow(
          /Invalid params: At path: placeholder -- Expected a string, but received: .*/u,
        );
      },
    );

    it('rejects placeholders with invalid length', async () => {
      const messenger = getMessenger();
      const implementation = getDialogImplementation({ messenger });

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Prompt,
            content: {
              type: NodeType.Panel as const,
              children: [
                { type: NodeType.Heading as const, value: 'foo' },
                { type: NodeType.Text as const, value: 'bar' },
              ],
            },
            placeholder: '',
          },
        }),
      ).rejects.toThrow(
        'Invalid params: At path: placeholder -- Expected a string with a length between `1` and `40` but received one with a length of `0`',
      );
    });

    it.each([DialogType.Alert, DialogType.Confirmation])(
      'rejects placeholder field for alerts and confirmations',
      async (type) => {
        const messenger = getMessenger();
        const implementation = getDialogImplementation({ messenger });
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type,
              content: {
                type: NodeType.Panel as const,
                children: [
                  { type: NodeType.Heading as const, value: 'foo' },
                  { type: NodeType.Text as const, value: 'bar' },
                ],
              },
              placeholder: 'foobar',
            },
          }),
        ).rejects.toThrow(
          'Invalid params: At path: placeholder -- Expected a value of type `never`, but received: `"foobar"`',
        );
      },
    );
  });
});
