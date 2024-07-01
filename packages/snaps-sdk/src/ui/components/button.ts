import type { Infer } from '@metamask/superstruct';
import {
  assign,
  literal,
  object,
  optional,
  string,
  union,
} from '@metamask/superstruct';

import { enumValue } from '../../internals';
import { createBuilder } from '../builder';
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

/**
 * Create a {@link Button} node.
 *
 * @param args - The node arguments. This can be either a string, or an object
 * with a `value` property. A set of optional properties can be passed.
 * @param args.variant - The optional variant of the button.
 * @param args.value - The text content of the node.
 * @param args.name - The optional name of the button.
 * @returns The text node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * ```typescript
 * const node = button({  variant: 'primary', text: 'Hello, world!', name: 'myButton' });
 * const node = button('Hello, world!', 'button', 'myButton', 'primary');
 * const node = button('Hello, world!');
 * ```
 */
export const button = createBuilder(NodeType.Button, ButtonStruct, [
  'value',
  'buttonType',
  'name',
  'variant',
]);
