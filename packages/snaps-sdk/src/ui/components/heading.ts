import type { Infer } from '@metamask/superstruct';
import { assign, object, string } from '@metamask/superstruct';

import { literal } from '../../internals';
import { LiteralStruct, NodeType } from '../nodes';

export const HeadingStruct = assign(
  LiteralStruct,
  object({
    type: literal(NodeType.Heading),
    value: string(),
  }),
);

/**
 * A heading node, that renders the text as a heading. The level of the heading
 * is determined by the depth of the heading in the document.
 *
 * @property type - The type of the node, must be the string 'text'.
 * @property value - The text content of the node, either as plain text, or as a
 * markdown string.
 */
export type Heading = Infer<typeof HeadingStruct>;
