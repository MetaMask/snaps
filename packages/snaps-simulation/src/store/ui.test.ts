import { DIALOG_APPROVAL_TYPES } from '@metamask/snaps-rpc-methods';
import { DialogType, NodeType } from '@metamask/snaps-sdk';

import {
  getCurrentInterface,
  resolveInterface,
  setInterface,
  uiSlice,
} from './ui';

describe('uiSlice', () => {
  describe('setInterface', () => {
    it('sets the current interface', () => {
      const state = uiSlice.reducer(
        undefined,
        setInterface({
          type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
          content: { type: NodeType.Text as const, value: 'foo' },
        }),
      );

      expect(state).toStrictEqual({
        current: {
          type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
          content: { type: NodeType.Text as const, value: 'foo' },
        },
      });
    });
  });

  describe('closeInterface', () => {
    it('closes the current interface', () => {
      const state = uiSlice.reducer(
        {
          current: {
            type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
            content: { type: NodeType.Text as const, value: 'foo' },
          },
        },
        uiSlice.actions.closeInterface(),
      );

      expect(state).toStrictEqual({
        current: null,
      });
    });
  });
});

describe('resolveInterface', () => {
  it('resolves the current interface', () => {
    expect(resolveInterface(true)).toStrictEqual({
      type: `${uiSlice.name}/resolveInterface`,
      payload: true,
    });

    expect(resolveInterface(false)).toStrictEqual({
      type: `${uiSlice.name}/resolveInterface`,
      payload: false,
    });

    expect(resolveInterface(null)).toStrictEqual({
      type: `${uiSlice.name}/resolveInterface`,
      payload: null,
    });
  });
});

describe('getCurrentInterface', () => {
  it('returns the current interface', () => {
    const state = {
      ui: {
        current: {
          type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
          content: { type: NodeType.Text as const, value: 'foo' },
        },
      },
    };

    // @ts-expect-error - The `state` parameter is only partially defined.
    expect(getCurrentInterface(state)).toStrictEqual({
      type: DIALOG_APPROVAL_TYPES[DialogType.Alert],
      content: { type: NodeType.Text as const, value: 'foo' },
    });
  });
});
