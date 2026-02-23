import type { Json } from '@metamask/utils';

import type { ComponentOrElement } from '..';
import type { EnumToUnion } from '../../internals';

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

export type DefaultDialog =
  | {
      id: string;
    }
  | { content: ComponentOrElement };

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
      content: ComponentOrElement;
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
      content: ComponentOrElement;
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
      content: ComponentOrElement;
      placeholder?: string;
    }
  | {
      type: EnumToUnion<DialogType.Prompt>;
      id: string;
      placeholder?: string;
    };

/* eslint-disable jsdoc/check-indentation */
/**
 * An object containing the contents of the dialog.
 *
 * - `type` - The type of dialog. Not providing a type will create a fully
 * [custom dialog](https://docs.metamask.io/snaps/features/custom-ui/dialogs/#display-a-custom-dialog).
 * Possible values are:
 *   - `alert` - An alert that can only be acknowledged.
 *   - `confirmation` - A confirmation that can be accepted or rejected.
 *   - `prompt` - A prompt where the user can enter a text response.
 *
 * - One of:
 *   - `content` - The content of the alert, as a
 * [custom UI](https://docs.metamask.io/snaps/features/custom-ui/) component.
 *   - `id` - The ID of an
 * [interactive interface](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
 * - `placeholder` - An optional placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 *
 * @property type - The type of dialog to display.
 * @property content - The content to display in the dialog.
 * @property id - The Snap interface ID.
 * @property placeholder - The placeholder text to display in the dialog. Only
 * applicable for the `prompt` dialog.
 */
export type DialogParams =
  | AlertDialog
  | ConfirmationDialog
  | PromptDialog
  | DefaultDialog;
/* eslint-enable jsdoc/check-indentation */

/**
 * - If the dialog is an `alert`, the result is `null`.
 * - If the dialog is a `confirmation`, the result is a boolean indicating
 * whether the user confirmed the dialog.
 * - If the dialog is a `prompt`, the result is the value entered by
 * the user.
 */
export type DialogResult = Json;
