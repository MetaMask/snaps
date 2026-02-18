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
