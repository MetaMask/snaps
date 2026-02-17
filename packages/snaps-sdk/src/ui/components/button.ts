import type { Infer } from '@metamask/superstruct';
import { assign, object, optional, string, union } from '@metamask/superstruct';

import { enumValue, literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum ButtonType {
  Button = 'button',
  Submit = 'submit',
}

export const ButtonStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Button),
    value: string(),
    variant: optional(
      union([
        enumValue(ButtonVariant.Primary),
        enumValue(ButtonVariant.Secondary),
      ]),
    ),
    buttonType: optional(
      union([enumValue(ButtonType.Button), enumValue(ButtonType.Submit)]),
    ),
    name: optional(string()),
  }),
);

/**
 * A button node, that renders either a primary or a secondary button.
 *
 * @property type - The type of the node, must be the string 'button'.
 * @property variant - The style variant of the node, must be either 'primary' or 'secondary'.
 * @property value - The text content of the node as plain text.
 * @property buttonType - The type of the button, must be either 'button' or 'submit'.
 * @property name - An optional name to identify the button.
 */
export type Button = Infer<typeof ButtonStruct>;
