import type { Infer } from '@metamask/superstruct';
import {
  assign,
  boolean,
  object,
  optional,
  string,
} from '@metamask/superstruct';

import { literal } from '../../internals';
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
