import type { Infer } from '@metamask/superstruct';
import {
  assign,
  boolean,
  literal,
  object,
  optional,
  string,
} from '@metamask/superstruct';

import { createBuilder } from '../builder';
import { LiteralStruct, NodeType } from '../nodes';

export const TextStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Text),
    value: string(),
    markdown: optional(boolean()),
  }),
);

/**
 * A text node, that renders the text as one or more paragraphs.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 * @property markdown - A flag to enable/disable markdown, if nothing is specified
 * markdown will be enabled.
 */
export type Text = Infer<typeof TextStruct>;

/**
 * Create a {@link Text} node.
 *
 * @param args - The node arguments. This can be either a string
 * and a boolean, or an object with a `value` property
 * and an optional `markdown` property.
 * @param args.value - The text content of the node.
 * @param args.markdown - An optional flag to enable or disable markdown. This
 * is enabled by default.
 * @returns The text node as object.
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = text({ value: 'Hello, world!' });
 * const node = text('Hello, world!');
 * const node = text({ value: 'Hello, world!', markdown: false });
 * const node = text('Hello, world!', false);
 */
export const text = createBuilder(NodeType.Text, TextStruct, [
  'value',
  'markdown',
]);
