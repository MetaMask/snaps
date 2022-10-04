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
    it('ignores unrecognized dialog fields', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.Alert,
          fields: {
            title: 'Foo',
            bar: 'baz',
          } as any,
        },
      });

      expect(hooks.showDialog).toHaveBeenCalledTimes(1);
      expect(hooks.showDialog).toHaveBeenCalledWith('foo', DialogType.Alert, {
        title: 'Foo',
      });
    });

    it('rejects invalid parameter object', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      for (const invalidInput of [
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
        { type: false },
        { type: '' },
        { type: 'foo' },
        { type: DialogType.Alert },
        { type: DialogType.Alert, fields: null },
        { type: DialogType.Alert, fields: false },
        { type: DialogType.Alert, fields: '' },
        { type: DialogType.Alert, fields: 'abc' },
        { type: DialogType.Alert, fields: 2 },
        { type: DialogType.Alert, fields: [] },
      ]) {
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: invalidInput as any,
          }),
        ).rejects.toThrow(
          'Must specify object parameter of the form `{ type: DialogType, fields: DialogFields }`.',
        );
      }
    });

    it('rejects invalid titles', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      for (const invalidInput of [
        undefined,
        null,
        false,
        '',
        2,
        [],
        {},
        new (class {})(),
        new Array(41).fill('a').join(''),
      ]) {
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: invalidInput,
                description: 'Bar',
                textAreaContent: 'Baz',
              } as any,
            },
          }),
        ).rejects.toThrow(
          'Must specify a non-empty string "title" less than 40 characters long.',
        );
      }
    });

    it('rejects invalid descriptions', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      for (const invalidInput of [
        true,
        2,
        [],
        {},
        new (class {})(),
        new Array(141).fill('a').join(''),
      ]) {
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: 'Foo',
                description: invalidInput,
                textAreaContent: 'Baz',
              } as any,
            },
          }),
        ).rejects.toThrow(
          '"description" must be a string no more than 140 characters long if specified.',
        );
      }
    });

    it('rejects invalid text area contents', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);

      for (const invalidInput of [
        true,
        2,
        [],
        {},
        new (class {})(),
        new Array(1801).fill('a').join(''),
      ]) {
        await expect(
          implementation({
            context: { origin: 'foo' },
            method: 'snap_dialog',
            params: {
              type: DialogType.Alert,
              fields: {
                title: 'Foo',
                description: 'Bar',
                textAreaContent: invalidInput,
              } as any,
            },
          }),
        ).rejects.toThrow(
          '"textAreaContent" must be a string no more than 1800 characters long if specified.',
        );
      }
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
      ).rejects.toThrow('Prompts may not specify a "textAreaContent" field.');
    });
  });
});
