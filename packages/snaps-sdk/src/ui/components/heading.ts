import type { Infer } from 'superstruct';
import { assign, literal, object, string } from 'superstruct';

import { createBuilder } from '../builder';
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

/**
 * Create a {@link Heading} node.
 *
 * @param args - The node arguments. This can either be a string, or an object
 * with the `value` property.
 * @param args.value - The heading text.
 * @returns The heading node as object.
 * @example
 * const node = heading({ value: 'Hello, world!' });
 * const node = heading('Hello, world!');
 */
export const heading = createBuilder(NodeType.Heading, HeadingStruct, [
  'value',
]);
