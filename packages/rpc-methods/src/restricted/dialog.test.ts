import { PermissionType } from '@metamask/controllers';
import {
  dialogBuilder,
  DialogType,
  DialogMethodHooks,
  getDialogImplementation,
} from './dialog';

describe('builder', () => {
  it('has the expected shape', () => {
    expect(dialogBuilder).toMatchObject({
      targetKey: 'snap_dialog',
      specificationBuilder: expect.any(Function),
      methodHooks: {
        showDialog: true,
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      dialogBuilder.specificationBuilder({
        methodHooks: {
          showDialog: jest.fn(),
        },
      }),
    ).toMatchObject({
      permissionType: PermissionType.RestrictedMethod,
      targetKey: 'snap_dialog',
      allowedCaveats: null,
      methodImplementation: expect.any(Function),
    });
  });
});

describe('implementation', () => {
  const getMockDialogHooks = () =>
    ({
      showDialog: jest.fn(),
    } as DialogMethodHooks);

  describe('alerts', () => {
    it('handles alerts', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          fields: {
            title: 'Foo',
            description: 'Bar',
            textAreaContent: 'Baz',
          },
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith('foo', DialogType.Alert, {
        title: 'Foo',
        description: 'Bar',
        textAreaContent: 'Baz',
      });
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
          fields: {
            title: 'Foo',
            description: 'Bar',
            textAreaContent: 'Baz',
          },
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith(
        'foo',
        DialogType.Confirmation,
        {
          title: 'Foo',
          description: 'Bar',
          textAreaContent: 'Baz',
        },
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
          fields: {
            title: 'Foo',
            description: 'Bar',
          },
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith('foo', DialogType.Prompt, {
        title: 'Foo',
        description: 'Bar',
      });
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
        'The "type" property must be one of: Alert, Confirmation, Prompt.',
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
          'The "type" property must be one of: Alert, Confirmation, Prompt.',
        );
      },
    );

    it.each([
      { type: DialogType.Alert },
      { type: DialogType.Alert, fields: null },
      { type: DialogType.Alert, fields: false },
      { type: DialogType.Alert, fields: '' },
      { type: DialogType.Alert, fields: 'abc' },
      { type: DialogType.Alert, fields: 2 },
      { type: DialogType.Alert, fields: [] },
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
        /Invalid params: At path: .* -- Expected .*, but received: .*\./u,
      );
    });

    it.each([undefined, null, false, 2, [], {}, new (class {})()])(
      'rejects invalid titles',
      async (value) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: value,
                description: 'Bar',
                textAreaContent: 'Baz',
              } as any,
            },
          }),
        ).rejects.toThrow(
          /Invalid params: At path: fields.title -- Expected a string, but received: .*\./u,
        );
      },
    );

    it('rejects titles with invalid length', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            fields: {
              title: '',
              description: 'Bar',
              textAreaContent: 'Baz',
            },
          },
        }),
      ).rejects.toThrow(
        'Invalid params: At path: fields.title -- Expected a string with a length between `1` and `40` but received one with a length of `0`.',
      );
    });

    it.each([true, 2, [], {}, new (class {})()])(
      'rejects invalid descriptions',
      async (value) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: 'Foo',
                description: value,
                textAreaContent: 'Baz',
              } as any,
            },
          }),
        ).rejects.toThrow(
          /Invalid params: At path: fields.description -- Expected a string, but received: .*\./u,
        );
      },
    );

    it('rejects too long descriptions', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            fields: {
              title: 'Foo',
              description: 'a'.repeat(141),
              textAreaContent: 'Baz',
            } as any,
          },
        }),
      ).rejects.toThrow(
        'Invalid params: At path: fields.description -- Expected a string with a length between `1` and `140` but received one with a length of `141`.',
      );
    });

    it.each([true, 2, [], {}, new (class {})()])(
      'rejects invalid text area contents',
      async (value) => {
        const hooks = getMockDialogHooks();
        const implementation = getDialogImplementation(hooks);

        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: 'Foo',
                description: 'Bar',
                textAreaContent: value,
              } as any,
            },
          }),
        ).rejects.toThrow(
          /Invalid params: At path: fields\.textAreaContent -- Expected a string, but received: .*\./u,
        );
      },
    );

    it('rejects too long text area contents', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Alert,
            fields: {
              title: 'Foo',
              description: 'Bar',
              textAreaContent: 'a'.repeat(1801),
            } as any,
          },
        }),
      ).rejects.toThrow(
        'Invalid params: At path: fields.textAreaContent -- Expected a string with a length between `1` and `1800` but received one with a length of `1801`.',
      );
    });

    it('rejects textAreaContent field for prompts', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await expect(
        implementation({
          context: { origin: 'foo' },
          method: 'snap_dialog',
          params: {
            type: DialogType.Prompt,
            fields: {
              title: 'Foo',
              description: 'Bar',
              textAreaContent: 'Baz',
            } as any,
          },
        }),
      ).rejects.toThrow(
        'Invalid params: Prompts may not specify a "textAreaContent" field.',
      );
    });
  });
});
