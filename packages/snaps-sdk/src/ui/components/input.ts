import { assign, object, optional, string, union } from '@metamask/superstruct';

import { enumValue, literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

/**
 * This replicates the available input types from the metamask extension.
 * https://github.com/MetaMask/metamask-extension/main/ui/components/component-library/input/input.constants.js
 */
export enum InputType {
  Text = 'text',
  Number = 'number',
  Password = 'password',
}

export const InputStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Input),
    value: optional(string()),
    name: string(),
    inputType: optional(
      union([
        enumValue(InputType.Text),
        enumValue(InputType.Password),
        enumValue(InputType.Number),
      ]),
    ),
    placeholder: optional(string()),
    label: optional(string()),
    error: optional(string()),
  }),
);
