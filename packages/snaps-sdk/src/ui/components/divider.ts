import type { Infer } from 'superstruct';
import { assign, literal, object } from 'superstruct';

import { createBuilder } from '../builder';
import { NodeStruct, NodeType } from '../nodes';

export const DividerStruct = assign(
  NodeStruct,
  object({
    type: literal(NodeType.Divider),
  }),
);

/**
 * A divider node, that renders a line between other nodes.
 */
export type Divider = Infer<typeof DividerStruct>;

/**
 * Create a {@link Divider} node.
 *
 * @returns The divider node as object.
 * @example
 * const node = divider();
 */
export const divider = createBuilder(NodeType.Divider, DividerStruct);
