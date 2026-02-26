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
 */
export type AlertDialog =
  | {
      /**
       * The literal string "alert" to indicate that this is an alert dialog.
       */
      type: EnumToUnion<DialogType.Alert>;

      /**
       * The content to display in the alert dialog.
       */
      content: ComponentOrElement;
    }
  | {
      /**
       * The literal string "alert" to indicate that this is an alert dialog.
       */
      type: EnumToUnion<DialogType.Alert>;

      /**
       * The Snap interface ID, which can be used to display a previously
       * created interface. See [`snap_createInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
       */
      id: string;
    };

/**
 * A confirmation dialog.
 */
export type ConfirmationDialog =
  | {
      /**
       * The literal string "confirmation" to indicate that this is a
       * confirmation dialog.
       */
      type: EnumToUnion<DialogType.Confirmation>;

      /**
       * The content to display in the confirmation dialog.
       */
      content: ComponentOrElement;
    }
  | {
      /**
       * The literal string "confirmation" to indicate that this is a
       * confirmation dialog.
       */
      type: EnumToUnion<DialogType.Confirmation>;

      /**
       * The Snap interface ID, which can be used to display a previously
       * created interface. See [`snap_createInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
       */
      id: string;
    };

/**
 * A prompt dialog.
 */
export type PromptDialog =
  | {
      /**
       * The literal string "prompt" to indicate that this is a prompt dialog.
       */
      type: EnumToUnion<DialogType.Prompt>;

      /**
       * The content to display in the prompt dialog.
       */
      content: ComponentOrElement;

      /**
       * An optional placeholder text to display in the text input.
       */
      placeholder?: string;
    }
  | {
      /**
       * The literal string "prompt" to indicate that this is a prompt dialog.
       */
      type: EnumToUnion<DialogType.Prompt>;

      /**
       * The Snap interface ID, which can be used to display a previously
       * created interface. See [`snap_createInterface`](https://docs.metamask.io/snaps/reference/snaps-api/snap_createinterface).
       */
      id: string;

      /**
       * An optional placeholder text to display in the text input.
       */
      placeholder?: string;
    };

/**
 * An object containing the contents of the dialog.
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

/**
 * - If the dialog is an `alert`, the result is `null`.
 * - If the dialog is a `confirmation`, the result is a boolean indicating
 * whether the user confirmed the dialog.
 * - If the dialog is a `prompt`, the result is the value entered by
 * the user.
 */
export type DialogResult = Json;
