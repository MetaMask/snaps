import type { Infer } from 'superstruct';
import { assign, literal, object, optional, string, union } from 'superstruct';

import { enumValue } from '../../internals';
import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';

export enum ButtonVariants {
  Primary = 'primary',
  Secondary = 'secondary',
}

export enum ButtonTypes {
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
        enumValue(ButtonVariants.Primary),
        enumValue(ButtonVariants.Secondary),
      ]),
    ),
    buttonType: optional(
      union([enumValue(ButtonTypes.Button), enumValue(ButtonTypes.Submit)]),
    ),
    name: optional(string()),
  }),
);

/**
 * A button node, that renders either a primary or a secondary button.
 *
 * @property type - The type of the node, must be the string 'button'.
 * @property variant - The style variant of the node, must be either 'primary' or 'secondary'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property name - An optional name to identify the button.
 */
export type Button = Infer<typeof ButtonStruct>;

/**
 * Create a {@link Button} node.
 *
 * @param args - The node arguments. This can be either a string, or an object
 * with a `text` property.
 * @param args.variant - The optional variant of the button.
 * @param args.value - The text content of the node.
 * @param args.name - The optional name of the button.
 * @returns The text node as object.
 * @example
 * ```typescript
 * const node = button({  variant: 'primary', text: 'Hello, world!', name: 'myButton' });
 * const node = button('primary', 'Hello, world!', 'myButton');
 * ```
 */
export const button = createBuilder(NodeType.Button, ButtonStruct, [
  'value',
  'buttonType',
  'name',
  'variant',
]);
