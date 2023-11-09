import type { Component } from '@metamask/snaps-ui';

import type { EnumToUnion } from '../../internals';

export enum DialogType {
  Alert = 'alert',
  Confirmation = 'confirmation',
  Prompt = 'prompt',
}

export type AlertDialog = {
  type: EnumToUnion<DialogType.Alert>;
  content: Component;
};

export type ConfirmationDialog = {
  type: EnumToUnion<DialogType.Confirmation>;
  content: Component;
};

export type PromptDialog = {
  type: EnumToUnion<DialogType.Prompt>;
  content: Component;
  placeholder?: string;
};

export type Dialog = AlertDialog | ConfirmationDialog | PromptDialog;

/**
 * The request parameters for the `snap_dialog` method.
 *
 * @property type - The type of dialog to display.
 * @property content - The content to display in the dialog.
 * @property placeholder - The placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 */
export type DialogParams = Dialog;

/**
 * The result returned by the `snap_dialog` method.
 *
 * - If the dialog is an `alert`, the result is `null`.
 * - If the dialog is a `confirmation`, the result is a boolean indicating
 * whether the user confirmed the dialog.
 * - If the dialog is a `prompt`, the result is the value entered by
 * the user.
 */
export type DialogResult = null | boolean | string;
