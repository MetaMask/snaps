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
