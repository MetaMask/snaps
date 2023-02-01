import { PermissionType } from '@metamask/permission-controller';
import { heading, panel, text } from '@metamask/snaps-ui';

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
      panel([heading('foo'), text('bar')]),
      undefined,
    );
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
        panel([heading('foo'), text('bar')]),
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
        panel([heading('foo'), text('bar')]),
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
        panel([heading('foo'), text('bar')]),
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
        /Invalid params: At path: .* -- Expected .*, but received: .*\./u,
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
          /Invalid params: At path: placeholder -- Expected a string, but received: .*\./u,
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
        'Invalid params: At path: placeholder -- Expected a string with a length between `1` and `40` but received one with a length of `0`.',
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
            params: {
              type,
              content: panel([heading('foo'), text('bar')]),
              placeholder: 'foobar',
            },
          }),
        ).rejects.toThrow(
          'Invalid params: Alerts or confirmations may not specify a "placeholder" field.',
        );
      },
    );
  });
});
