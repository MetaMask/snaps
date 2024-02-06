import { PermissionType, SubjectType } from '@metamask/permission-controller';
import { rpcErrors } from '@metamask/rpc-errors';
import { DialogType, heading, panel, text } from '@metamask/snaps-sdk';

import type { DialogMethodHooks } from './dialog';
import { dialogBuilder, getDialogImplementation } from './dialog';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(dialogBuilder).toMatchObject({
      targetName: 'snap_dialog',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        showDialog: true,
        createInterface: true,
        getInterface: true,
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      dialogBuilder.specificationBuilder({
        methodHooks: {
          showDialog: jest.fn(),
          createInterface: jest.fn(),
          getInterface: jest.fn(),
        },
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
  const getMockDialogHooks = () =>
    ({
      showDialog: jest.fn(),
      createInterface: jest.fn().mockReturnValue('bar'),
      getInterface: jest
        .fn()
        .mockReturnValue({ content: text('foo'), state: {}, snapId: 'foo' }),
    } as DialogMethodHooks);

  it('accepts string dialog types', async () => {
    const hooks = getMockDialogHooks();
    const implementation = getDialogImplementation(hooks);
    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content: panel([heading('foo'), text('bar')]),
      },
    });

    expect(hooks.showDialog).toHaveBeenCalledTimes(1);
    expect(hooks.showDialog).toHaveBeenCalledWith(
      'foo',
      DialogType.Alert,
      'bar',
      undefined,
    );
  });

  it('gets the interface data if an interface ID is passed', async () => {
    const hooks = {
      showDialog: jest.fn(),
      createInterface: jest.fn().mockReturnValue('bar'),
      getInterface: jest
        .fn()
        .mockReturnValue({ content: text('foo'), state: {}, snapId: 'foo' }),
    };

    const implementation = getDialogImplementation(hooks);

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        id: 'bar',
      },
    });

    expect(hooks.showDialog).toHaveBeenCalledTimes(1);
    expect(hooks.showDialog).toHaveBeenCalledWith(
      'foo',
      DialogType.Alert,
      'bar',
      undefined,
    );
  });

  it('creates a new interface if some content is passed', async () => {
    const hooks = getMockDialogHooks();
    const implementation = getDialogImplementation(hooks);

    const content = panel([heading('foo'), text('bar')]);

    await implementation({
      context: { origin: 'foo' },
      method: 'snap_dialog',
      params: {
        type: 'alert',
        content,
      },
    });

    expect(hooks.createInterface).toHaveBeenCalledWith('foo', content);
    expect(hooks.showDialog).toHaveBeenCalledTimes(1);
    expect(hooks.showDialog).toHaveBeenCalledWith(
      'foo',
      DialogType.Alert,
      'bar',
      undefined,
    );
  });

  it('throws if the requested interface does not exist.', async () => {
    const hooks = {
      showDialog: jest.fn(),
      createInterface: jest.fn(),
      getInterface: jest.fn().mockImplementation((_snapId, id) => {
        throw new Error(`Interface with id '${id}' not found.`);
      }),
    };

    const implementation = getDialogImplementation(hooks);

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

    expect(hooks.getInterface).toHaveBeenCalledTimes(1);
    expect(hooks.getInterface).toHaveBeenCalledWith('foo', 'bar');
  });

  describe('alerts', () => {
    it('handles alerts', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          content: panel([heading('foo'), text('bar')]),
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith(
        'foo',
        DialogType.Alert,
        'bar',
        undefined,
      );
    });
  });

  describe('confirmations', () => {
    it('handles confirmations', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Confirmation,
          content: panel([heading('foo'), text('bar')]),
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith(
        'foo',
        DialogType.Confirmation,
        'bar',
        undefined,
      );
    });
  });

  describe('prompts', () => {
    it('handles prompts', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Prompt,
          content: panel([heading('foo'), text('bar')]),
          placeholder: 'foobar',
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith(
        'foo',
        DialogType.Prompt,
        'bar',
        'foobar',
      );
    });
  });

  describe('validation', () => {
    it.each([
      undefined,
      null,
      false,
      '',
      'abc',
      2,
      [],
      {},
      new (class {})(),
      new Array(41).fill('a').join(''),
    ])('rejects invalid parameter object', async (value) => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: value as any,
        }),
      ).rejects.toThrow(
        'The "type" property must be one of: alert, confirmation, prompt.',
      );
    });

    it.each([{ type: false }, { type: '' }, { type: 'foo' }])(
      'rejects invalid types',
      async (value) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);

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
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: value as any,
        }),
      ).rejects.toThrow(
        /Invalid params: At path: .* — Expected a value of type .*, but received: .*\./u,
      );
    });

    it.each([true, 2, [], {}, new (class {})()])(
      'rejects invalid placeholder contents',
      async (value: any) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Prompt,
              content: panel([heading('foo'), text('bar')]),
              placeholder: value,
            },
          }),
        ).rejects.toThrow(
          /Invalid params: At path: placeholder — Expected a value of type string, but received: .*\./u,
        );
      },
    );

    it('rejects placeholders with invalid length', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Prompt,
            content: panel([heading('foo'), text('bar')]),
            placeholder: '',
          },
        }),
      ).rejects.toThrow(
        'Invalid params: At path: placeholder — Expected a string with a length between 1 and 40, but received one with a length of 0.',
      );
    });

    it.each([DialogType.Alert, DialogType.Confirmation])(
      'rejects placeholder field for alerts and confirmations',
      async (type) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            // @ts-expect-error Wrong params.
            params: {
              type,
              content: panel([heading('foo'), text('bar')]),
              placeholder: 'foobar',
            },
          }),
        ).rejects.toThrow(
          'Invalid params: Unknown key: placeholder, received: "foobar".',
        );
      },
    );
  });
});
