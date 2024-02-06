import type { EnumToUnion } from '../../internals';
import type { Component } from '../../ui';

/**
 * The type of dialog to display.
 *
 * - `alert` - A dialog with a single button.
 * - `confirmation` - A dialog with two buttons, one to confirm and one to
 * cancel.
 * - `prompt` - A dialog with two buttons and a text input.
 */
export enum DialogType {
  Alert = 'alert',
  Confirmation = 'confirmation',
  Prompt = 'prompt',
}

/**
 * An alert dialog.
 *
 * @property type - The type of dialog. Must be `alert`.
 * @property content - The content to display in the dialog.
 * @property id - The Snap interface ID.
 */
export type AlertDialog =
  | {
      type: EnumToUnion<DialogType.Alert>;
      content: Component;
    }
  | {
      type: EnumToUnion<DialogType.Alert>;
      id: string;
    };

/**
 * A confirmation dialog.
 *
 * @property type - The type of dialog. Must be `confirmation`.
 * @property content - The content to display in the dialog.
 * @property id - The Snap interface ID.
 */
export type ConfirmationDialog =
  | {
      type: EnumToUnion<DialogType.Confirmation>;
      content: Component;
    }
  | {
      type: EnumToUnion<DialogType.Confirmation>;
      id: string;
    };

/**
 * A prompt dialog.
 *
 * @property type - The type of dialog. Must be `prompt`.
 * @property content - The content to display in the dialog.
 * @property id - The Snap interface ID.
 * @property placeholder - An optional placeholder text to display in the text
 * input.
 */
export type PromptDialog =
  | {
      type: EnumToUnion<DialogType.Prompt>;
      content: Component;
      placeholder?: string;
    }
  | {
      type: EnumToUnion<DialogType.Prompt>;
      id: string;
      placeholder?: string;
    };

/**
 * The request parameters for the `snap_dialog` method.
 *
 * @property type - The type of dialog to display.
 * @property content - The content to display in the dialog.
 * @property id - The Snap interface ID.
 * @property placeholder - The placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 */
export type DialogParams = AlertDialog | ConfirmationDialog | PromptDialog;

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
