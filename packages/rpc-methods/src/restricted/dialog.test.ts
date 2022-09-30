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
        showAlert: true,
        showConfirmation: true,
        showPrompt: true,
      },
    });
  });

  it('builder outputs expected specification', () => {
    expect(
      dialogBuilder.specificationBuilder({
        methodHooks: {
          showAlert: jest.fn(),
          showConfirmation: jest.fn(),
          showPrompt: jest.fn(),
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
      showAlert: jest.fn().mockResolvedValue(null),
      showConfirmation: jest.fn(),
      showPrompt: jest.fn(),
    } as DialogMethodHooks);

  describe('alerts', () => {
    it('handles alerts', async () => {
      const hooks = getMockDialogHooks();
      const implementation = getDialogImplementation(hooks);
      await implementation({
        context: { origin: 'foo' },
        method: 'snap_dialog',
        params: {
          type: DialogType.alert,
          fields: {
            title: 'Foo',
            description: 'Bar',
            textAreaContent: 'Baz',
          },
        },
      });

      expect(hooks.showAlert).toHaveBeenCalledTimes(1);
      expect(hooks.showAlert).toHaveBeenCalledWith('foo', {
        title: 'Foo',
        description: 'Bar',
        textAreaContent: 'Baz',
      });

      expect(hooks.showConfirmation).not.toHaveBeenCalled();
      expect(hooks.showPrompt).not.toHaveBeenCalled();
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
          type: DialogType.confirmation,
          fields: {
            title: 'Foo',
            description: 'Bar',
            textAreaContent: 'Baz',
          },
        },
      });

      expect(hooks.showConfirmation).toHaveBeenCalledTimes(1);
      expect(hooks.showConfirmation).toHaveBeenCalledWith('foo', {
        title: 'Foo',
        description: 'Bar',
        textAreaContent: 'Baz',
      });

      expect(hooks.showAlert).not.toHaveBeenCalled();
      expect(hooks.showPrompt).not.toHaveBeenCalled();
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
          type: DialogType.prompt,
          fields: {
            title: 'Foo',
            description: 'Bar',
          },
        },
      });

      expect(hooks.showPrompt).toHaveBeenCalledTimes(1);
      expect(hooks.showPrompt).toHaveBeenCalledWith('foo', {
        title: 'Foo',
        description: 'Bar',
      });

      expect(hooks.showAlert).not.toHaveBeenCalled();
      expect(hooks.showConfirmation).not.toHaveBeenCalled();
    });
  });

  describe('validation', () => {
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
        { type: DialogType.alert },
        { type: DialogType.alert, fields: null },
        { type: DialogType.alert, fields: false },
        { type: DialogType.alert, fields: '' },
        { type: DialogType.alert, fields: 'abc' },
        { type: DialogType.alert, fields: 2 },
        { type: DialogType.alert, fields: [] },
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
              type: DialogType.alert,
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
              type: DialogType.alert,
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
              type: DialogType.alert,
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
            type: DialogType.prompt,
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
