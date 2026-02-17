import type { Infer } from '@metamask/superstruct';
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

/**
 * An input node, that renders an input.
 *
 * @property type - The type of the node, must be the string 'input'.
 * @property name - The name for the input.
 * @property value - The value of the input.
 * @property inputType - An optional type, either `text`, `password` or `number`.
 * @property placeholder - An optional input placeholder.
 * @property label - An optional input label.
 * @property error - An optional error text.
 */
export type Input = Infer<typeof InputStruct>;
