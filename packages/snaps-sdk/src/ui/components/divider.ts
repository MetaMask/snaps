import type { Infer } from '@metamask/superstruct';
import { assign, literal, object } from '@metamask/superstruct';

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
 * @deprecated Snaps component functions are deprecated, in favor of the new JSX
 * components. This function will be removed in a future release.
 * @example
 * const node = divider();
 */
export const divider = createBuilder(NodeType.Divider, DividerStruct);
